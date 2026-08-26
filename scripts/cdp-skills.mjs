/**
 * Quick probe — scroll to Skills section, screenshot it, measure every text node.
 * Usage: node scripts/cdp-skills.mjs [url]
 */
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9340
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-skills-${process.pid}`

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

// Scroll to Skills section
await evalJs(`
  const el = document.getElementById('skills');
  if (el) el.scrollIntoView({block: 'start'});
`)
await sleep(600)

// Screenshot
const shot = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync('scripts/audit-shots/skills.png', Buffer.from(shot.data, 'base64'))

// Measure all text in #skills
const probe = await evalJs(`
  (() => {
    const section = document.getElementById('skills');
    if (!section) return {error: 'no #skills'};
    const results = [];
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const t = n.nodeValue.trim();
      if (t.length < 2) continue;
      const el = n.parentElement;
      if (!el) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      let op = 1, node = el;
      while (node && node !== section) { op *= parseFloat(getComputedStyle(node).opacity || '1'); node = node.parentElement; }
      results.push({text: t.slice(0, 50), color: cs.color, opacity: +op.toFixed(2), fontSize: cs.fontSize, top: Math.round(rect.top), bottom: Math.round(rect.bottom)});
    }
    return results;
  })()
`)
console.log(`\n===== SKILLS SECTION TEXT: ${RAW_URL} =====`)
console.log(`Found ${probe.length || 0} text nodes`)
for (const t of probe) {
  const flag = t.opacity < 0.7 ? ' <<<< LOW OPACITY' : ''
  console.log(`  op=${t.opacity}  size=${t.fontSize}  color=${t.color}  [${t.top}-${t.bottom}]  "${t.text}"${flag}`)
}

ws.close()
proc.kill()
process.exit(0)
