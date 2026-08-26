/**
 * Settled-state scan — scrolls the whole page, waits 900ms per step for
 * scroll-scrubbed reveals to finish, then flags any in-viewport text that is
 * STILL below 0.9 effective opacity or clipped. Distinguishes genuinely-stuck
 * invisible text from expected mid-animation states.
 * Usage: node scripts/cdp-settled.mjs [url]
 */
import { spawn } from 'node:child_process'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9339
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-settled-${process.pid}`

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

const SCANNER = `(async () => {
  const flags = [];
  const seen = new Set();
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const steps = 14;
  const scan = () => {
    const vh = window.innerHeight, vw = window.innerWidth;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode.nodeValue.trim();
      if (t.length < 2) continue;
      const el = walker.currentNode.parentElement;
      if (!el || el.closest('script,style,noscript,svg')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -20 || rect.top > vh + 20 || rect.left > vw + 20 || rect.right < -20) continue;
      if (rect.width < 2 || rect.height < 2) continue;
      // effective opacity
      let op = 1, node = el;
      while (node) { op *= parseFloat(getComputedStyle(node).opacity || '1'); node = node.parentElement; }
      // clip fully open? (all insets near 0 or 1)
      let clipped = false;
      if (cs.clipPath && cs.clipPath !== 'none') {
        const m = cs.clipPath.match(/[\\d.]+/g);
        const nums = m ? m.map(Number) : [];
        if (nums.length === 4) { const vals = nums.slice(0, 4); clipped = vals.some(v => v > 0.02 && v < 0.98); }
        else clipped = true;
      }
      if (op < 0.9 || clipped) {
        const key = t.slice(0, 30) + '|' + (el.className || '').toString().slice(0, 40);
        if (seen.has(key)) continue;
        seen.add(key);
        const chain = [];
        let c = el; while (c && c !== document.body && chain.length < 6) { chain.push(c.tagName + (c.className ? '.' + String(c.className).split(/\\s+/).slice(0,3).join('.') : '')); c = c.parentElement; }
        flags.push({ text: t.slice(0, 45), opacity: +op.toFixed(2), clip: clipped ? cs.clipPath.slice(0, 50) : 'open', font: cs.fontSize, chain: chain.join(' < ') });
      }
    }
  };
  for (let i = 0; i <= steps; i++) {
    const y = Math.round(total * i / steps);
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 900));
    scan();
  }
  window.scrollTo(0, total);
  await new Promise(r => setTimeout(r, 900));
  scan();
  return flags;
})()`

const flags = await evalJs(SCANNER)
console.log(`\n===== SETTLED TEXT WITH OPACITY < 0.9 OR CLIPPED (${flags.length}) =====`)
for (const f of flags) console.log(`  op=${f.opacity}  clip=${f.clip}  size=${f.font}  "${f.text}"\n      @ ${f.chain}`)

ws.close(); proc.kill(); process.exit(0)
