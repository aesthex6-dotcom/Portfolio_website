/**
 * Debug — map the exit-wrapper opacity across a project scene's full travel
 * to find where it actually reaches 1.0 and whether a natural "at rest"
 * reading position exists within that window.
 */
import { spawn } from 'node:child_process'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9336
const PROFILE = `${process.cwd()}\\scripts\\.chrome-exitmap-${process.pid}`
const TITLE = process.argv[2] || 'AgentKit'

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
await sleep(1500)

const info = await evalJs(`
  (() => {
    const lis = Array.from(document.querySelectorAll('li'));
    const li = lis.find(el => el.querySelector('h3') && el.querySelector('h3').textContent.includes(${JSON.stringify(TITLE)}));
    if (!li) return null;
    const r = li.getBoundingClientRect();
    return { absTop: r.top + scrollY, h: r.height, vh: innerHeight, scrollH: document.documentElement.scrollHeight };
  })()
`)
console.log(`scene "${TITLE}":`, JSON.stringify(info))
if (!info) { console.log('NOT FOUND'); process.exit(0) }

// Travel: from scene start entering viewport bottom (scroll = absTop - vh)
// to scene fully out the top (scroll = absTop + h).
const from = Math.max(0, Math.round(info.absTop - info.vh - 100))
const to = Math.min(info.scrollH - info.vh, Math.round(info.absTop + info.h + 100))
const STEPS = 24
const rows = []
for (let i = 0; i <= STEPS; i++) {
  const y = Math.round(from + ((to - from) * i) / STEPS)
  await evalJs(`window.scrollTo(0, ${y})`)
  await sleep(120)
  const r = await evalJs(`
    (() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes(${JSON.stringify(TITLE)}));
      if (!h3) return null;
      const grid = h3.closest('.grid.items-center.gap-10');
      if (!grid) return null;
      const cs = getComputedStyle(grid);
      const li = grid.parentElement;
      const lr = li.getBoundingClientRect();
      return { op: parseFloat(cs.opacity || '1'), top: Math.round(lr.top), bottom: Math.round(lr.bottom) };
    })()
  `)
  rows.push({ y, op: r ? +r.op.toFixed(2) : null, top: r ? r.top : null, bottom: r ? r.bottom : null })
}

// find the window where opacity == 1.0
const full = rows.filter(r => r.op !== null && r.op >= 0.99)
console.log('\nscroll   sceneTop  sceneBottom  wrapperOpacity')
for (const r of rows) {
  const marker = r.op !== null && r.op >= 0.99 ? '  ← FULL' : ''
  console.log(`${String(r.y).padEnd(8)} ${String(r.top).padEnd(8)} ${String(r.bottom).padEnd(10)} ${r.op === null ? '  n/a' : r.op.toFixed(2)}${marker}`)
}
if (full.length) {
  console.log(`\nFull-opacity window: scrollY ${full[0].y} → ${full[full.length - 1].y} (${full[full.length - 1].y - full[0].y}px wide)`)
  // is the centered position inside it?
  const centered = Math.round(info.absTop + info.h / 2 - 450)
  const inWindow = centered >= full[0].y && centered <= full[full.length - 1].y
  console.log(`Geometric center scrollY ${centered}: ${inWindow ? 'INSIDE full window' : 'OUTSIDE full window'} — scene at that point: top=${info.absTop - centered}, bottom=${info.absTop + info.h - centered}`)
} else {
  console.log('\n⚠ NO scroll position reaches opacity 1.0')
}

ws.close(); proc.kill(); process.exit(0)
