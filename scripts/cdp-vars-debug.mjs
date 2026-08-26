/**
 * Debug — check what CSS variable values Chrome resolves.
 */
import { spawn } from 'node:child_process'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9343
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-varsdebug-${process.pid}`

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

const debug = await evalJs(`
  (() => {
    const cs = getComputedStyle(document.documentElement);
    return {
      '--muted': cs.getPropertyValue('--muted'),
      '--muted-rgb': cs.getPropertyValue('--muted-rgb'),
      '--text': cs.getPropertyValue('--text'),
      '--text-rgb': cs.getPropertyValue('--text-rgb'),
      '--bg': cs.getPropertyValue('--bg'),
      '--bg-rgb': cs.getPropertyValue('--bg-rgb'),
      '--faint': cs.getPropertyValue('--faint'),
      '--faint-rgb': cs.getPropertyValue('--faint-rgb'),
      bodyColor: getComputedStyle(document.body).color,
      bodyBg: getComputedStyle(document.body).backgroundColor,
    }
  })()
`)
console.log('CSS variables:', JSON.stringify(debug, null, 2))

// Also check a text-muted element's actual applied style
const el2 = await evalJs(`
  (() => {
    const el = document.querySelector('.text-muted');
    if (!el) return {error: 'no .text-muted'};
    // Check if there's an inline style or more specific rule
    return {
      className: el.className,
      computedColor: getComputedStyle(el).color,
      computedBg: getComputedStyle(el).backgroundColor,
      // Walk up all elements and check their computed styles
      parentColors: (() => {
        const chain = [];
        let node = el;
        while (node && chain.length < 5) {
          const cs = getComputedStyle(node);
          chain.push({
            tag: node.tagName,
            cls: (node.className || '').toString().slice(0, 60),
            color: cs.color,
            bg: cs.backgroundColor,
            opacity: cs.opacity,
          });
          node = node.parentElement;
        }
        return chain;
      })()
    }
  })()
`)
console.log('\nElement chain:', JSON.stringify(el2, null, 2))

ws.close(); proc.kill(); process.exit(0)
