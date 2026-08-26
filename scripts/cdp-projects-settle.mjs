/**
 * Prove — every project scene reaches full assembly (opacity 1.0 on all text)
 * when centered in the viewport and settled.
 * Usage: node scripts/cdp-projects-settle.mjs [url]
 */
import { spawn } from 'node:child_process'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9338
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-projsettle-${process.pid}`

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
await send('Page.navigate', { url: URL })
for (let i = 0; i < 60; i++) { if (await evalJs('document.readyState === "complete"')) break; await sleep(200) }
await sleep(1500)

const scenes = await evalJs(`
  (() => Array.from(document.querySelectorAll('li.relative.py-14.md\\\\:py-20')).map(li => {
    const r = li.getBoundingClientRect();
    return { absTop: r.top + window.scrollY, height: r.height, title: (li.querySelector('h3')||{}).textContent || '' };
  }))()
`)
console.log(`Found ${scenes.length} project scenes`)

for (const [i, s] of scenes.entries()) {
  const target = Math.round(s.absTop + s.height / 2 - 450)
  await evalJs(`window.scrollTo(0, ${target})`)
  await sleep(900)
  const probe = await evalJs(`
    (() => {
      const vh = window.innerHeight;
      const low = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const t = walker.currentNode.nodeValue.trim();
        if (t.length < 2) continue;
        const el = walker.currentNode.parentElement;
        if (!el || el.closest('script,style,noscript,svg')) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -20 || rect.top > vh + 20) continue;
        if (rect.width < 2 || rect.height < 2) continue;
        // effective opacity of the WHOLE chain
        let op = 1, node = el;
        while (node) { op *= parseFloat(getComputedStyle(node).opacity || '1'); node = node.parentElement; }
        if (op < 0.9) low.push({ text: t.slice(0, 40), opacity: +op.toFixed(2), color: cs.color, clip: cs.clipPath !== 'none' });
      }
      return low;
    })()
  `)
  const worst = probe.reduce((m, p) => Math.min(m, p.opacity), 1)
  console.log(`scene ${i + 1} "${s.title.slice(0, 32)}"  h=${Math.round(s.height)}px  → ${probe.length} low-opacity in view, worst=${worst}`)
  for (const p of probe.slice(0, 8)) console.log(`     op=${p.opacity} clip=${p.clip ? 'yes' : 'no'} "${p.text}" (${p.color})`)
}

ws.close(); proc.kill(); process.exit(0)
