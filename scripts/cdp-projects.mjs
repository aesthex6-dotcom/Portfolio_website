/**
 * Project-scene assembly probe. For every ProjectScene on the page, scroll to
 * the position where its bottom exactly meets the viewport bottom (fully on
 * screen) and verify its text (title, body, meta rows, CTA) is fully assembled
 * (opacity >= 0.99). Then scroll to where its center meets the viewport center
 * and verify it is still fully assembled. This is the acceptance test for
 * "no project text is ever left invisible on screen".
 *
 * Usage: node scripts/cdp-projects.mjs [url]
 */
import { spawn } from 'node:child_process'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9335
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-projects-${process.pid}`

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
  // settle: let content grow, then land on true max and come back to top
  let max = document.documentElement.scrollHeight - vh
  window.scrollTo(0, max)
  await new Promise((r) => setTimeout(r, 700))
  max = document.documentElement.scrollHeight - vh
  window.scrollTo(0, 0)
  await new Promise((r) => setTimeout(r, 500))

  const scenes = Array.from(document.querySelectorAll('ul.divide-y li.relative.py-14, ul.divide-y li.relative.py-20'))
  const out = []
  for (const scene of scenes) {
    const h3 = scene.querySelector('h3')
    const title = h3 ? h3.textContent.trim() : '(no h3)'
    const r0 = scene.getBoundingClientRect()
    const absTop = r0.top + window.scrollY
    const absBottom = r0.bottom + window.scrollY

    // 1) fully on screen: bottom at viewport bottom
    const yFull = absBottom - vh
    window.scrollTo(0, yFull)
    await new Promise((r) => setTimeout(r, 350))
    const measure = () => {
      const picks = []
      scene.querySelectorAll('h3, p, dl span, button').forEach((el) => {
        const t = el.textContent.trim().slice(0, 24)
        if (!t || t.length < 2) return
        const cs = getComputedStyle(el)
        let op = 1, node = el
        while (node && node !== scene) { op *= parseFloat(getComputedStyle(node).opacity || '1'); node = node.parentElement }
        if (t.length < 26 && /[A-Za-z]/.test(t)) picks.push([t, +op.toFixed(2)])
      })
      return picks
    }
    const atFull = measure()
    const minFull = Math.min(...atFull.map(([, o]) => o))

    // 2) centered: scene center at viewport center
    const center = (absTop + absBottom) / 2
    window.scrollTo(0, center - vh / 2)
    await new Promise((r) => setTimeout(r, 350))
    const atCenter = measure()
    const minCenter = Math.min(...atCenter.map(([, o]) => o))

    out.push({
      title,
      rect: [Math.round(absTop), Math.round(absBottom)],
      minAtFullyOnScreen: minFull,
      minAtCentered: minCenter,
      atFull: atFull.filter(([, o]) => o < 0.99).slice(0, 6),
    })
  }
  return { out }
})()`

const report = await evalJs(PROBE)
console.log(`\n===== PROJECT SCENES: ${RAW_URL} =====`)
for (const s of report.out) {
  const ok = s.minAtFullyOnScreen >= 0.99 && s.minAtCentered >= 0.99
  console.log(`${ok ? 'PASS' : 'FAIL'}  "${s.title}"`)
  console.log(`        rect=${s.rect}  min opacity when fully on screen=${s.minAtFullyOnScreen}  when centered=${s.minAtCentered}`)
  if (s.atFull.length) console.log(`        sub-0.99 at fully-on-screen: ${JSON.stringify(s.atFull)}`)
}
console.log('\n(Done)')

ws.close()
proc.kill()
process.exit(0)
