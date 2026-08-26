/**
 * Debug — why does text-faint report contrast:4.36 on the Skills panel?
 * Scrolls the panel into view, reads computed color + opacity + the FIRST
 * painted ancestor background (the audit's exact method), and recomputes.
 */
import { spawn } from 'node:child_process'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9340
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-faintdebug-${process.pid}`

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
await sleep(1800)

// Scroll to the Skills section (find "Subsystems" eyebrow, center it)
const pos = await evalJs(`
  (() => {
    const els = Array.from(document.querySelectorAll('p, span'));
    const target = els.find(el => el.textContent.trim() === 'Subsystems');
    if (!target) return null;
    const rect = target.getBoundingClientRect();
    return { absTop: rect.top + window.scrollY, vh: window.innerHeight };
  })()
`)
console.log('Subsystems position:', JSON.stringify(pos))
if (!pos) { console.log('NOT FOUND'); process.exit(0) }

await evalJs(`window.scrollTo(0, ${pos.absTop - 120})`)
await sleep(700)

// Measure the flagged text-faint elements using the audit's exact method
const probe = await evalJs(`
  (() => {
    const results = [];
    const wanted = ['Subsystems', 'Readout', 'Inspect the system', 'src/data/skills.ts', 'Stable', '05', '16', '21'];
    const textNodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) { const t = n.nodeValue.trim(); if (t.length < 2) continue; textNodes.push([n.parentElement, t]); }
    for (const [el, text] of textNodes) {
      if (el.closest('script,style,noscript,svg')) continue;
      if (!wanted.some(w => text.includes(w))) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      // first painted ancestor bg (audit method)
      let node = el, bg = null;
      while (node) {
        const c = getComputedStyle(node).backgroundColor;
        const m = c.match(/[\\d.]+/g);
        const alpha = c.startsWith('rgba') && m && m.length >= 4 ? Number(m[3]) : (c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)' ? 1 : 0);
        if (m && m.length >= 3 && alpha > 0.01) { bg = [Number(m[0]), Number(m[1]), Number(m[2])]; break; }
        node = node.parentElement;
      }
      let op = 1, node2 = el;
      while (node2) { op *= parseFloat(getComputedStyle(node2).opacity || '1'); node2 = node2.parentElement; }
      const rect = el.getBoundingClientRect();
      results.push({ text: text.slice(0, 40), color: cs.color, bg: bg ? 'rgb(' + bg.join(',') + ')' : null, opacity: +op.toFixed(3), font: cs.fontSize + ' ' + cs.fontWeight, top: Math.round(rect.top) });
    }
    // also read the panel's own computed bg + any inline/atmosphere vars
    const panel = document.querySelector('.panel.relative.overflow-hidden');
    const rootCs = getComputedStyle(document.documentElement);
    results.push({
      text: '── root vars ──',
      color: '--bg-rgb=' + rootCs.getPropertyValue('--bg-rgb').trim() +
             ' --surface-rgb=' + rootCs.getPropertyValue('--surface-rgb').trim() +
             ' --faint-rgb=' + rootCs.getPropertyValue('--faint-rgb').trim(),
      bg: panel ? getComputedStyle(panel).backgroundColor : null,
      opacity: 1, font: '', top: 0
    });
    return results;
  })()
`)
console.log('\n===== FAINT TEXT MEASUREMENTS (in-viewport) =====')
for (const r of probe) console.log(JSON.stringify(r))

ws.close(); proc.kill(); process.exit(0)
