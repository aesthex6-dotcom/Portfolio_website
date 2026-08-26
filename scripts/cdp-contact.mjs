/**
 * Focused probe — at page-bottom scroll, measure every clip-path reveal inside
 * the Contact section. The main audit's stuck-clip check only inspects the
 * middle viewport band (rect.top < 0.6vh), which bottom-anchored text misses —
 * this probes the exact place a scroll-scrubbed Reveal could rest partially
 * clipped at the end of the page.
 *
 * Usage: node scripts/cdp-contact.mjs [url]
 */
import { spawn } from 'node:child_process'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9336
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-contact-${process.pid}`

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
  // settle: let content grow, then land on true max
  let max = document.documentElement.scrollHeight - vh
  window.scrollTo(0, max)
  await new Promise((r) => setTimeout(r, 800))
  max = document.documentElement.scrollHeight - vh
  window.scrollTo(0, max)
  await new Promise((r) => setTimeout(r, 600))

  const section = document.getElementById('contact')
  const reveals = Array.from(section.querySelectorAll('div')).filter((el) => {
    const cs = getComputedStyle(el)
    return cs.clipPath && cs.clipPath !== 'none'
  })
  const out = reveals.map((el, i) => {
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    // every text descendant's own computed opacity, clip, and rect
    const text = []
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let n
    while ((n = walker.nextNode())) {
      const t = n.nodeValue.trim()
      if (t.length < 2) continue
      const child = n.parentElement
      if (!child) continue
      const c = child.getBoundingClientRect()
      let op = 1, node = child
      while (node && node !== el) { op *= parseFloat(getComputedStyle(node).opacity || '1'); node = node.parentElement }
      text.push({ t: t.slice(0, 22), op: +op.toFixed(2), rect: [Math.round(c.top), Math.round(c.bottom)] })
    }
    return {
      idx: i,
      cls: (el.className || '').toString().slice(0, 40),
      rect: [Math.round(r.top), Math.round(r.bottom)],
      inViewport: r.top < vh && r.bottom > 0,
      opacity: +cs.opacity,
      clipPath: cs.clipPath,
      y: cs.transform !== 'none' ? cs.transform : 'none',
      text,
    }
  })
  return { vh, maxScroll: max, scrollY: window.scrollY, footerH: document.querySelector('footer')?.offsetHeight ?? 0, reveals: out }
})()`

const report = await evalJs(PROBE)
console.log(`\n===== CONTACT AT REST: ${RAW_URL}  (vh ${report.vh}, scrollY ${report.scrollY}/${report.maxScroll}, footer ${report.footerH}px) =====`)
for (const rv of report.reveals) {
  const worst = rv.text.reduce((m, t) => Math.min(m, t.op), 1)
  console.log(`\nreveal[${rv.idx}] cls="${rv.cls}"  rect=${rv.rect}  inViewport=${rv.inViewport}`)
  console.log(`   opacity=${rv.opacity}  clip=${rv.clipPath}  transform=${rv.y}  worst-text-op=${worst}`)
  for (const t of rv.text) console.log(`     op=${t.op}  rect=${t.rect}  "${t.t}"`)
}
console.log('\n(Done)')

ws.close()
proc.kill()
process.exit(0)
