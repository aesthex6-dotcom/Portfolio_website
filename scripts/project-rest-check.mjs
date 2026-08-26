/**
 * Targeted rest-state check — scroll the first project scene through its full
 * scroll range and confirm its metadata/CTA beats reach full opacity at rest.
 * Usage: node scripts/project-rest-check.mjs [url]
 */
import { spawn } from 'node:child_process'

const RAW_URL = process.argv[2] || 'http://localhost:5173/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9340
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-rest-${process.pid}`

const proc = spawn(CHROME, [`--remote-debugging-port=${PORT}`, '--headless=new', '--no-first-run', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${PROFILE}`, 'about:blank'], { stdio: 'ignore' })

let wsUrl = null
for (let i = 0; i < 60 && !wsUrl; i++) {
  try { const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); const page = list.find(t => t.type === 'page'); if (page) wsUrl = page.webSocketDebuggerUrl } catch {}
  if (!wsUrl) await new Promise(r => setTimeout(r, 250))
}
if (!wsUrl) { console.error('no ws'); proc.kill(); process.exit(1) }

const ws = new WebSocket(wsUrl)
await new Promise(r => ws.onopen = r)
let nextId = 1; const pending = new Map()
ws.onmessage = ev => { const msg = JSON.parse(ev.data); if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result) } }
const send = (method, params = {}) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })) })
const evalJs = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, userGesture: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text || JSON.stringify(r.exceptionDetails))
  return r.result.value
}
const sleep = ms => new Promise(r => setTimeout(r, ms))

await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: URL })
for (let i = 0; i < 60; i++) { if (await evalJs('document.readyState === "complete"')) break; await sleep(200) }
await sleep(1500)

const report = await evalJs(`(async () => {
  const scene = Array.from(document.querySelectorAll('li')).find(li => li.textContent.includes('Open case study'))
  if (!scene) return { error: 'no scene li found' }
  const top = scene.getBoundingClientRect().top + window.scrollY
  window.scrollTo(0, Math.max(0, top - window.innerHeight * 0.35))
  await new Promise(r => setTimeout(r, 1000))
  const keys = ['Open case study', 'Stack', 'React · FastAPI · SQLite · Docker']
  const vh = window.innerHeight
  const observations = []
  const measure = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const t = walker.currentNode.nodeValue.trim()
      if (t.length < 2) continue
      const el = walker.currentNode.parentElement
      if (!el || el.closest('script,style,noscript,svg')) continue
      if (!keys.includes(t)) continue
      const rect = el.getBoundingClientRect()
      if (rect.bottom < 0 || rect.top > vh) continue // only in-viewport elements
      let op = 1, node = el
      while (node) { op *= parseFloat(getComputedStyle(node).opacity || '1'); node = node.parentElement }
      observations.push({ text: t, opacity: +op.toFixed(3), top: Math.round(rect.top), bottom: Math.round(rect.bottom) })
    }
  }
  const y0 = window.scrollY
  for (let i = 0; i <= 14; i++) {
    window.scrollTo(0, y0 + i * 130)
    await new Promise(r => setTimeout(r, 400))
    measure()
  }
  // per key: did ANY in-viewport observation reach >= 0.9?
  const measured = {}
  for (const k of keys) {
    const obs = observations.filter(o => o.text === k)
    measured[k] = obs.length ? { maxOpacity: Math.max(...obs.map(o => o.opacity)), observations: obs.length } : { maxOpacity: null, observations: 0 }
  }
  return { sceneTop: top, measured }
})()`)

console.log(`\n===== PROJECT SCENE REST CHECK =====`)
if (report.error) { console.log('ERROR: ' + report.error) } else {
  console.log(`scene top at ${report.sceneTop}px`)
  for (const [k, v] of Object.entries(report.measured)) {
    const max = v.maxOpacity
    const verdict = max === null ? 'never in view' : max >= 0.9 ? 'OK' : 'STUCK'
    console.log(`  ${verdict.padEnd(14)}  maxOp=${max}  (${v.observations} in-view observations)  "${k}"`)
  }
}
ws.close(); proc.kill(); process.exit(0)
