/**
 * Debug probe — check what Chrome returns for text-muted color and background.
 * Usage: node scripts/cdp-color-debug.mjs [url]
 */
import { spawn } from 'node:child_process'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9342
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-colordebug-${process.pid}`

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
  } catch {}
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
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: URL })
for (let i = 0; i < 60; i++) {
  if (await evalJs('document.readyState === "complete"')) break
  await sleep(200)
}
await sleep(1800)

const debug = await evalJs(`
  (() => {
    // Find first text-muted element
    const el = document.querySelector('.text-muted');
    if (!el) return {error: 'no .text-muted'};
    const cs = getComputedStyle(el);
    const result = {
      text: el.textContent.slice(0, 40),
      color: cs.color,
      colorType: typeof cs.color,
      bg: cs.backgroundColor,
      opacity: cs.opacity,
    };
    // Walk up for bg
    let node = el;
    const bgChain = [];
    while (node && node !== document.body) {
      const ncs = getComputedStyle(node);
      if (ncs.backgroundColor !== 'rgba(0, 0, 0, 0)' && ncs.backgroundColor !== 'transparent') {
        bgChain.push({tag: node.tagName, bg: ncs.backgroundColor});
      }
      node = node.parentElement;
    }
    result.bgChain = bgChain;
    return result;
  })()
`)
console.log('DEBUG text-muted element:', JSON.stringify(debug, null, 2))

ws.close()
proc.kill()
process.exit(0)
