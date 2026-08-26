/**
 * Probe — scroll to the "Top capabilities" ranking inside Skills,
 * verify all text assembles to full opacity when in viewport.
 * Usage: node scripts/cdp-skills-rank.mjs [url]
 */
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9341
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-skillsrank-${process.pid}`

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

// First, settle the page by scrolling to bottom and back
await evalJs(`window.scrollTo(0, document.documentElement.scrollHeight)`)
await sleep(600)
await evalJs(`window.scrollTo(0, 0)`)
await sleep(400)

// Find the ranking section and scroll to center it
const pos = await evalJs(`
  (() => {
    // Find the "Top capabilities" heading or the ranking container
    const allH = Array.from(document.querySelectorAll('h3, h4, p'));
    const target = allH.find(el => el.textContent.includes('Top capabilities'));
    if (!target) return {found: false, scrollY: window.scrollY};
    const rect = target.getBoundingClientRect();
    const absTop = rect.top + window.scrollY;
    return {found: true, absTop, vh: window.innerHeight};
  })()
`)
console.log('Ranking section position:', JSON.stringify(pos))

if (pos.found) {
  // Scroll so the ranking is centered in viewport
  const scrollTarget = pos.absTop - 200
  await evalJs(`window.scrollTo(0, ${scrollTarget})`)
  await sleep(600)

  // Take screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync('scripts/audit-shots/skills-rank.png', Buffer.from(shot.data, 'base64'))

  // Measure all text now that ranking is in view
  const probe = await evalJs(`
    (() => {
      const vh = window.innerHeight;
      const results = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        const t = n.nodeValue.trim();
        if (t.length < 2) continue;
        const el = n.parentElement;
        if (!el || el.closest('script,style,noscript,svg')) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) continue;
        if (rect.bottom < -20 || rect.top > vh + 20) continue;
        let op = 1, node = el;
        while (node && node !== document.body) { op *= parseFloat(getComputedStyle(node).opacity || '1'); node = node.parentElement; }
        if (op < 0.9) {
          const clip = cs.clipPath;
          results.push({text: t.slice(0, 50), opacity: +op.toFixed(2), clip: clip !== 'none' ? clip : 'none', color: cs.color, fontSize: cs.fontSize, top: Math.round(rect.top)});
        }
      }
      return results;
    })()
  `)
  console.log(`\n===== TEXT IN VIEWPORT WITH OPACITY < 0.9 (${probe.length}) =====`)
  for (const t of probe) {
    console.log(`  op=${t.opacity}  clip=${t.clip}  size=${t.fontSize}  color=${t.color}  top=${t.top}  "${t.text}"`)
  }
}

ws.close()
proc.kill()
process.exit(0)
