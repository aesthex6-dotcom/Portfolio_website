/**
 * Debug — find the actual CSS rule that sets color on .text-muted
 */
import { spawn } from 'node:child_process'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9344
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-cssdebug-${process.pid}`

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
    // Find all stylesheets and search for text-muted
    const results = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          const text = rule.cssText || '';
          if (text.includes('text-muted')) {
            results.push(text.slice(0, 200));
          }
        }
      } catch (e) {
        results.push('ERROR: ' + e.message + ' on ' + (sheet.href || 'inline'));
      }
    }
    return results;
  })()
`)
console.log('CSS rules containing text-muted:')
for (const r of debug) console.log('  ', r)

// Also check what the computed style resolves to
const resolve = await evalJs(`
  (() => {
    // Create a test element with text-muted
    const test = document.createElement('p');
    test.className = 'text-muted';
    document.body.appendChild(test);
    const cs = getComputedStyle(test);
    const result = { color: cs.color, fontSize: cs.fontSize };
    document.body.removeChild(test);

    // Now check with text-ink
    const test2 = document.createElement('p');
    test2.className = 'text-ink';
    document.body.appendChild(test2);
    const cs2 = getComputedStyle(test2);
    result.inkColor = cs2.color;
    document.body.removeChild(test2);

    return result;
  })()
`)
console.log('\nTest element computed colors:', JSON.stringify(resolve, null, 2))

ws.close(); proc.kill(); process.exit(0)
