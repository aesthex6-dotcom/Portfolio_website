/**
 * Debug — find what layout-shifts when scrolling. Measure the absolute top of
 * every section + the AgentKit scene BEFORE and AFTER a scroll jump, and watch
 * whether scrollHeight changes.
 */
import { spawn } from 'node:child_process'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9335
const PROFILE = `${process.cwd()}\\scripts\\.chrome-shift-${process.pid}`

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
const evalJs = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, userGesture: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result.value }
const sleep = ms => new Promise(r => setTimeout(r, ms))

await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: 'http://localhost:5199/?r=' + Date.now() })
for (let i = 0; i < 60; i++) { if (await evalJs('document.readyState === "complete"')) break; await sleep(200) }
await evalJs('document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true)')
await sleep(1500)

const snap = () => evalJs(`
  (() => {
    const sections = Array.from(document.querySelectorAll('section.scene')).map(s => ({
      id: s.id || s.className.toString().slice(0, 12),
      top: Math.round(s.getBoundingClientRect().top + window.scrollY),
      h: Math.round(s.getBoundingClientRect().height),
    }));
    const li = Array.from(document.querySelectorAll('li')).find(el => el.querySelector('h3') && el.querySelector('h3').textContent.includes('AgentKit'));
    const lr = li ? li.getBoundingClientRect() : null;
    return {
      scrollY: Math.round(window.scrollY),
      scrollH: document.documentElement.scrollHeight,
      liAbsTop: lr ? Math.round(lr.top + window.scrollY) : null,
      liRectTop: lr ? Math.round(lr.top) : null,
      sections,
    };
  })()
`)

const before = await snap()
console.log('\n--- BEFORE scroll ---')
console.log(JSON.stringify(before, null, 1))

// Abrupt jump to AgentKit centered
const target = Math.round(before.liAbsTop + 468.3 / 2 - 450)
await evalJs(`window.scrollTo(0, ${target})`)
await sleep(1200)

const after = await snap()
console.log('\n--- AFTER abrupt scrollTo(' + target + ') + 1.2s ---')
console.log(JSON.stringify(after, null, 1))

// Now scroll back to top, then gradually up to the same spot
await evalJs(`window.scrollTo(0, 0)`)
await sleep(800)
await evalJs(`window.scrollTo(0, ${target})`)
await sleep(1200)
const afterGradual = await snap()
console.log('\n--- AFTER scrollTo(0) then scrollTo(target) ---')
console.log(JSON.stringify(afterGradual, null, 1))

ws.close(); proc.kill(); process.exit(0)
