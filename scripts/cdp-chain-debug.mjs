/**
 * Debug — dump the opacity/transform chain for a specific project scene's
 * "Open case study" button to find which ancestor holds opacity < 1.
 */
import { spawn } from 'node:child_process'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9337
const PROFILE = `${process.cwd()}\\scripts\\.chrome-chain-${process.pid}`
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
// Wait for webfonts so layout is stable before measuring positions.
await evalJs('document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true)')
await sleep(1200)

const info = await evalJs(`
  (() => {
    const lis = Array.from(document.querySelectorAll('li'));
    const li = lis.find(el => el.querySelector('h3') && el.querySelector('h3').textContent.includes(${JSON.stringify(TITLE)}));
    if (!li) return null;
    const r = li.getBoundingClientRect();
    return { absTop: r.top + scrollY, h: r.height, scrollH: document.documentElement.scrollHeight, vh: innerHeight };
  })()
`)
console.log(`scene "${TITLE}":`, JSON.stringify(info))
if (!info) { console.log('NOT FOUND'); process.exit(0) }

const target = Math.round(info.absTop + info.h / 2 - 450)
await evalJs(`window.scrollTo(0, ${target})`)
await sleep(1000)

const chain = await evalJs(`
  (() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Open case study'));
    const out = [];
    let node = btn, depth = 0;
    while (node && depth < 12) {
      const cs = getComputedStyle(node);
      const r = node.getBoundingClientRect();
      out.push({
        tag: node.tagName,
        cls: (node.className || '').toString().slice(0, 55),
        opacity: cs.opacity,
        color: cs.color,
        clip: cs.clipPath !== 'none' ? cs.clipPath.slice(0, 40) : 'none',
        transform: cs.transform !== 'none' ? 'yes' : 'no',
        top: Math.round(r.top), bottom: Math.round(r.bottom),
      });
      node = node.parentElement; depth++;
    }
    return { scrollY: Math.round(window.scrollY), target: ${target}, chain: out };
  })()
`)
console.log('scrollY =', chain.scrollY, '| target =', chain.target)
for (const c of chain.chain) console.log(JSON.stringify(c))

ws.close(); proc.kill(); process.exit(0)
