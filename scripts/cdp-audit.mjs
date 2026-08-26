/**
 * Zero-dependency browser audit — drives headless Chrome over the DevTools
 * Protocol using only Node's built-in fetch + WebSocket.
 *
 * Scrolls the whole page, screenshots it, and scans the RENDERED DOM for:
 *   1. near-invisible text (low WCAG contrast / low opacity / transparent fill)
 *   2. stuck scroll-scrubbed reveals (clip-path still insetting while in view)
 *   3. decorative separators (— • |) in rendered text
 *
 * Usage: node scripts/cdp-audit.mjs [url]
 */
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const URL = process.argv[2] || 'http://localhost:5199/'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9333
const OUT = 'scripts/audit-shots'
mkdirSync(OUT, { recursive: true })
const PROFILE = `${process.cwd()}\\scripts\\.chrome-profile-${process.pid}`

// ---------------------------------------------------------------- chrome
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
  } catch {
    /* not up yet */
  }
  if (!wsUrl) await new Promise((r) => setTimeout(r, 250))
}
if (!wsUrl) {
  console.error('Chrome debugging endpoint never came up')
  proc.kill()
  process.exit(1)
}

// ---------------------------------------------------------------- cdp
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
  const r = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true,
  })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text || 'eval error')
  return r.result.value
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------- page
await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
})
await send('Page.navigate', { url: URL })
for (let i = 0; i < 60; i++) {
  if (await evalJs('document.readyState === "complete" && !!document.querySelector("body")')) break
  await sleep(200)
}
await sleep(1800)

// ---------------------------------------------------------------- scan
const SCANNER = `(async () => {
  const AUDIT = { low: [], clipped: [], seps: [] }
  const SEEN = new Set()

  const lum = (r, g, b) => {
    const f = (c) => { c = c / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
  }
  const contrast = (c1, c2) => {
    const l1 = lum(c1[0], c1[1], c1[2])
    const l2 = lum(c2[0], c2[1], c2[2])
    const [a, b] = [l1, l2].sort((x, y) => y - x)
    return (a + 0.05) / (b + 0.05)
  }
  const parse = (s, a) => {
    if (!s) return null
    // Chrome modern color format: "color(srgb 0.61 0.62 0.59)" — values are 0–1, not 0–255.
    const isModern = s.startsWith('color(')
    const m = s.match(/[\\d.]+/g)
    if (!m || m.length < 3) return null
    const scale = isModern && Number(m[0]) <= 1 ? 255 : 1
    return [Number(m[0]) * scale, Number(m[1]) * scale, Number(m[2]) * scale, m.length >= 4 ? Number(m[3]) * (isModern ? 1 : 1) : a]
  }
  const flatten = (c, bg) => [
    Math.round(c[0] * c[3] + bg[0] * (1 - c[3])),
    Math.round(c[1] * c[3] + bg[1] * (1 - c[3])),
    Math.round(c[2] * c[3] + bg[2] * (1 - c[3])),
  ]
  const bgFor = (el) => {
    let node = el
    while (node) {
      const cs = getComputedStyle(node)
      const b = parse(cs.backgroundColor, 1)
      if (b && b[3] > 0.01) return [b[0], b[1], b[2]]
      node = node.parentElement
    }
    return [23, 23, 23]
  }
  const ancestorOpacity = (el) => {
    let o = 1, node = el
    while (node) { o *= parseFloat(getComputedStyle(node).opacity || '1'); node = node.parentElement }
    return o
  }
  const signFor = (el) => {
    const p = []
    let node = el
    while (node && node !== document.body) {
      p.push(node.tagName + ':' + (node.className ? '.' + String(node.className).split(/\\s+/).join('.') : ''))
      node = node.parentElement
    }
    return p.join(' > ')
  }
  const dedupeKey = (el, text) => signFor(el) + '|' + text

  const measure = () => {
    const vw = window.innerWidth, vh = window.innerHeight
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const textEls = new Map()
    let n
    while ((n = walker.nextNode())) {
      const t = n.nodeValue.trim()
      if (t.length < 2) continue
      const el = n.parentElement
      if (!el || el.closest('script,style,noscript,svg')) continue
      textEls.set(el, t)
    }
    for (const [el, text] of textEls) {
      const rect = el.getBoundingClientRect()
      if (rect.bottom < -20 || rect.top > vh + 20 || rect.right < -20 || rect.left > vw + 20) continue
      if (rect.width < 2 || rect.height < 2) continue
      const cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      const key = dedupeKey(el, text)
      const id = signFor(el)

      for (const ch of ['\\u2014', '\\u2022', '|']) {
        if (text.includes(ch)) {
          if (!SEEN.has('sep' + ch + key)) {
            SEEN.add('sep' + ch + key)
            AUDIT.seps.push({ char: ch, text: text.slice(0, 70), el: id, tag: el.tagName })
          }
        }
      }

      const color = parse(cs.color, 1)
      if (!color) continue
      const fill = cs.webkitTextFillColor
      const fillColor = fill && fill !== 'currentcolor' ? parse(fill, 1) : color
      const isTransparentFill = fillColor && fillColor[3] < 0.05
      const effBg = bgFor(el)
      const fg = isTransparentFill || color[3] < 0.05 ? [255, 0, 255] : flatten(color, effBg)
      const ratio = contrast(fg, effBg)
      const op = ancestorOpacity(el)

      const clip = cs.clipPath
      if (clip && clip !== 'none') {
        const m = clip.match(/[\\d.]+/g)
        const nums = m ? m.map(Number) : []
        const open = nums.length === 4 && nums[0] <= 0.5 && nums[1] <= 0.5 && nums[2] <= 0.5 && nums[3] <= 0.5
        if (!open && rect.top < vh * 0.6 && rect.bottom > vh * 0.4) {
          if (!SEEN.has('clip' + key)) {
            SEEN.add('clip' + key)
            AUDIT.clipped.push({ el: id, tag: el.tagName, text: text.slice(0, 60), clip, rect: [Math.round(rect.top), Math.round(rect.bottom)] })
          }
        }
      }

      if (isTransparentFill) {
        if (!SEEN.has('low' + key)) { SEEN.add('low' + key); AUDIT.low.push({ el: id, tag: el.tagName, text: text.slice(0, 60), kind: 'transparent-fill', clip }) }
      } else if (op < 0.7) {
        if (!SEEN.has('low' + key)) { SEEN.add('low' + key); AUDIT.low.push({ el: id, tag: el.tagName, text: text.slice(0, 60), kind: 'opacity:' + op.toFixed(2), ratio: ratio.toFixed(2) }) }
      } else if (ratio < 4.5) {
        if (!SEEN.has('low' + key)) {
          SEEN.add('low' + key)
          AUDIT.low.push({ el: id, tag: el.tagName, text: text.slice(0, 60), kind: 'contrast:' + ratio.toFixed(2), color: cs.color, bg: 'rgb(' + effBg.join(',') + ')', ratio: ratio.toFixed(2) })
        }
      }
    }
  }

  const total = document.documentElement.scrollHeight - window.innerHeight
  const steps = 16
  for (let i = 0; i <= steps; i++) {
    const y = Math.round((total * i) / steps)
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 300))
    measure()
  }
  window.scrollTo(0, document.documentElement.scrollHeight)
  await new Promise((r) => setTimeout(r, 500))
  measure()
  return { total, low: AUDIT.low.slice(0, 150), clipped: AUDIT.clipped.slice(0, 60), seps: AUDIT.seps }
})()`

const report = await evalJs(SCANNER)

// ---------------------------------------------------------------- shots
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  mkdirSync(OUT, { recursive: true })
  const { writeFileSync } = await import('node:fs')
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, 'base64'))
}
const positions = [
  ['top', 0],
  ['mid', Math.round(report.total * 0.5)],
  ['bottom', report.total],
]
for (const [name, y] of positions) {
  await evalJs(`window.scrollTo(0, ${y})`)
  await sleep(400)
  await shot(name)
}

// full-page capture
const full = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
const { writeFileSync } = await import('node:fs')
writeFileSync(`${OUT}/fullpage.png`, Buffer.from(full.data, 'base64'))

// ---------------------------------------------------------------- report
console.log(`\n===== AUDIT: ${URL}  (page height ${report.total}px) =====`)
console.log(`\n-- LOW-CONTRAST / INVISIBLE TEXT (${report.low.length}) --`)
for (const r of report.low) console.log(`  ${r.kind.padEnd(26)} ${r.tag.padEnd(6)} ${JSON.stringify(r.text)}  @ ${r.el}`)
console.log(`\n-- STUCK CLIP (${report.clipped.length}) --`)
for (const r of report.clipped) console.log(`  ${r.tag.padEnd(6)} ${JSON.stringify(r.text)} clip=${r.clip} rect=${r.rect} @ ${r.el}`)
console.log(`\n-- DECORATIVE SEPARATORS IN RENDERED TEXT (${report.seps.length}) --`)
for (const r of report.seps) console.log(`  "${r.char}"  ${JSON.stringify(r.text)}  @ ${r.el}`)
console.log(`\nScreenshots → ${OUT}/`)

ws.close()
proc.kill()
