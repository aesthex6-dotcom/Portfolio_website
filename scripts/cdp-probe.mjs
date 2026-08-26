/**
 * Focused probe — at page-bottom scroll, inspect every visible text element in
 * the BOTTOM band of the viewport (rect.top > 0.55*vh). These are the elements
 * the main audit's mid-band clip check never sees: the exact place a
 * scroll-scrubbed Reveal could rest partially clipped if its center can't
 * reach viewport-center before the page ends.
 *
 * Usage: node scripts/cdp-probe.mjs [url]
 */
import { spawn } from 'node:child_process'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9334
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-probe-${process.pid}`

const proc = spawn(
  CHROME,
  [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--no-first-run',
    '--disable-gpu',
    '--hide-scrollbars',
    `--user-data-dir=${PROFILE}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

let wsUrl = null
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
    const page = list.find((t) => t.type === 'page')
    if (page) wsUrl = page.webSocketDebuggerUrl
  } catch {
    /* not up yet */
  }
  if (!wsUrl) await new Promise((r) => setTimeout(r, 250))
}
if (!wsUrl) {
  console.error('Chrome debugging endpoint never came up')
  proc.kill()
  process.exit(1)
}

const ws = new WebSocket(wsUrl)
await new Promise((r) => (ws.onopen = r))
let nextId = 1
const pending = new Map()
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id)
    pending.delete(msg.id)
    msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result)
  }
}
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
const evalJs = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, userGesture: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'eval error')
  return r.result.value
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: URL })
for (let i = 0; i < 60; i++) {
  if (await evalJs('document.readyState === "complete" && !!document.querySelector("body")')) break
  await sleep(200)
}
await sleep(1800)

const PROBE = `(async () => {
  const vh = window.innerHeight
  // Content (fonts/images) can finish loading after readyState, growing the
  // page. Scroll to the current max, wait for growth, then scroll to the TRUE
  // final max so bottom-of-page elements are measured at rest.
  let total = document.documentElement.scrollHeight - vh
  window.scrollTo(0, total)
  await new Promise((r) => setTimeout(r, 800))
  total = document.documentElement.scrollHeight - vh
  window.scrollTo(0, total)
  await new Promise((r) => setTimeout(r, 500))
  const scrollY = window.scrollY

  // Ground truth on the exact Reveal that wraps the "Secret badges" block.
  const eyebrow = Array.from(document.querySelectorAll('p.eyebrow')).find((p) => p.textContent.trim() === 'Secret badges')
  const revealWrap = eyebrow ? eyebrow.closest('.mt-16') || eyebrow.parentElement : null
  const detail = {}
  if (revealWrap) {
    const cs = getComputedStyle(revealWrap)
    const r = revealWrap.getBoundingClientRect()
    detail.reveal = {
      tag: revealWrap.tagName,
      cls: revealWrap.className,
      rect: [Math.round(r.top), Math.round(r.bottom), Math.round(r.height)],
      opacity: cs.opacity,
      clipPath: cs.clipPath,
      willChange: cs.willChange,
      transform: cs.transform,
    }
  }

  const out = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  let n
  while ((n = walker.nextNode())) {
    const t = n.nodeValue.trim()
    if (t.length < 2) continue
    const el = n.parentElement
    if (!el || el.closest('script,style,noscript,svg')) continue
    const rect = el.getBoundingClientRect()
    if (rect.top < vh * 0.55 || rect.bottom < 0 || rect.top > vh + 20) continue
    if (rect.width < 2 || rect.height < 2) continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    let op = 1, node = el
    while (node) { op *= parseFloat(getComputedStyle(node).opacity || '1'); node = node.parentElement }
    const clip = cs.clipPath
    if (op < 0.9 || (clip && clip !== 'none')) {
      out.push({ op: +op.toFixed(2), clip, text: t.slice(0, 40), rect: [Math.round(rect.top), Math.round(rect.bottom)] })
    }
  }
  return { total, scrollY, vh, detail, bottomBandCount: out.length, items: out }
})()`

const report = await evalJs(PROBE)
console.log(`\n===== PROBE: ${RAW_URL}  (page height ${report.total}px, scrollY ${report.scrollY}/${report.total}, vh ${report.vh}) =====`)
console.log(`Badge-list Reveal: ${JSON.stringify(report.detail.reveal, null, 2)}`)
console.log(`\nBottom-band text elements with opacity<0.9 or a clip: ${report.bottomBandCount}\n`)
for (const r of report.items) {
  console.log(`  op=${r.op}  clip=${r.clip || 'none'}  rect=${r.rect}  "${r.text}"`)
}
console.log('\n(Done)')

ws.close()
proc.kill()
process.exit(0)
