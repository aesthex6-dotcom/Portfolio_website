/**
 * Debug — use CDP CSS.getMatchedStylesForNode to find what overrides .text-muted color
 */
import { spawn } from 'node:child_process'

const RAW_URL = process.argv[2] || 'http://localhost:5199/'
const URL = RAW_URL + (RAW_URL.includes('?') ? '&' : '?') + 'r=' + Date.now()
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9345
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-matched-${process.pid}`

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
await send('DOM.enable')
await send('CSS.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: URL })
for (let i = 0; i < 60; i++) { if (await evalJs('document.readyState === "complete"')) break; await sleep(200) }
await sleep(1800)

// Get the remote object for the first .text-muted element
const obj = await evalJs(`
  (() => {
    const el = document.querySelector('.text-muted');
    if (!el) return null;
    return { text: el.textContent.slice(0, 40), className: el.className };
  })()
`)
console.log('Target element:', JSON.stringify(obj))

// Get the DOM node
const { root } = await send('DOM.getDocument', { depth: 0 })
const { nodeId } = await send('DOM.querySelector', { nodeId: root.nodeId, selector: '.text-muted' })
console.log('DOM nodeId:', nodeId)

// Get matched styles
const matched = await send('CSS.getMatchedStylesForNode', { nodeId })
console.log('\n=== MATCHED CSS RULES for .text-muted ===')
for (const rule of matched.matchedCSSRules) {
  const selector = rule.rule.selectorList?.selectors?.map(s => s.text).join(', ') || '?'
  const source = rule.rule.origin
  const style = rule.rule.style
  const colorProp = style.cssProperties.find(p => p.name === 'color')
  if (colorProp) {
    console.log(`  [${source}] ${selector} → color: ${colorProp.value} (priority: ${colorProp.priority || 'normal'})`)
  }
}

// Also check inherited styles
console.log('\n=== INHERITED RULES ===')
if (matched.inherited) {
  for (const inh of matched.inherited) {
    const selector = inh.rule.selectorList?.selectors?.map(s => s.text).join(', ') || '?'
    const colorProp = inh.rule.style.cssProperties.find(p => p.name === 'color')
    if (colorProp) {
      console.log(`  ${selector} → color: ${colorProp.value}`)
    }
  }
}

ws.close(); proc.kill(); process.exit(0)
