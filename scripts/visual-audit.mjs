/**
 * Visual audit — the browser is the source of truth.
 * Launches headless Chrome, scrolls the entire page, screenshots it, and
 * scans the RENDERED DOM for:
 *   1. near-invisible text (low WCAG contrast, low opacity, transparent fill)
 *   2. stuck scroll-scrubbed reveals (clip-path still insetting while in view)
 *   3. decorative separators (— • |) in rendered text
 *
 * Usage: node scripts/visual-audit.mjs [url]
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const URL = process.argv[2] || 'http://localhost:5199/'
const OUT = 'scripts/audit-shots'
mkdirSync(OUT, { recursive: true })

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const logs = []
const log = (...a) => {
  logs.push(a.join(' '))
  console.log(...a)
}

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(1600)

// Browser-side audit state + helpers.
await page.evaluate(() => {
  const AUDIT = (window.__audit = { low: [], clipped: [], seps: [] })
  const SEEN = new Set()

  const lum = (r, g, b) => {
    const f = (c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }
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
    const m = s.match(/[\d.]+/g)
    if (!m || m.length < 3) return null
    const rgb = [m[0], m[1], m[2]].map(Number)
    const alpha = m.length >= 4 ? Number(m[3]) : a
    return [...rgb, alpha]
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
    return [23, 23, 23] // fallback: the charcoal ground
  }
  const ancestorOpacity = (el) => {
    let o = 1
    let node = el
    while (node) {
      o *= parseFloat(getComputedStyle(node).opacity || '1')
      node = node.parentElement
    }
    return o
  }
  const sign = (el) => {
    let p = []
    let node = el
    while (node && node !== document.body) {
      p.push(node.tagName + ':' + (node.className ? '.' + String(node.className).split(/\s+/).join('.') : ''))
      node = node.parentElement
    }
    return p.join(' > ')
  }
  const idFor = (el) => {
    const sign = signFor(el)
    if (!SEEN.has(sign)) SEEN.set(sign, SEEN.size + 1)
    return SEEN.get(sign)
  }
  window.__signFor = (el) => {
    let p = []
    let node = el
    while (node && node !== document.body) {
      p.push(node.tagName + ':' + (node.className ? '.' + String(node.className).split(/\s+/).join('.') : ''))
      node = node.parentElement
    }
    return p.join(' > ')
  }

  // measure everything in the current viewport; called at each scroll step
  window.__measure = () => {
    const vw = window.innerWidth
    const vh = window.innerHeight
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
      const id = window.__signFor(el)

      // --- decorative separators ---
      for (const ch of ['—', '•', '|']) {
        if (text.includes(ch)) {
          AUDIT.seps.push({
            char: ch,
            text: t.slice(0, 70),
            el: id,
            tag: el.tagName,
            inView: true,
          })
        }
      }

      // --- contrast / visibility ---
      const color = parse(cs.color, 1)
      if (!color) continue
      const fill = cs.webkitTextFillColor
      const fillColor = fill && fill !== 'currentcolor' ? parse(fill, 1) : color
      const isTransparentFill = fillColor && fillColor[3] < 0.05
      const effBg = bgFor(el)
      const fg = isTransparentFill || color[3] < 0.05 ? [255, 0, 255] : flatten(color, effBg)
      const ratio = contrast(fg, effBg)
      const op = ancestorOpacity(el)

      let clip = cs.clipPath
      if (clip && clip !== 'none') {
        const m = clip.match(/[\d.]+/g)
        const nums = m ? m.map(Number) : []
        const open = nums.length === 4 && nums.every((v, i) => (i === 1 ? v <= 0.5 : v <= 0.5)) // inset near 0/-2
        const trulyOpen = nums.length === 4 && nums[0] <= 0.5 && nums[1] <= 0.5 && nums[2] <= 0.5 && nums[3] <= 0.5
        if (!trulyOpen && rect.top < vh * 0.6 && rect.bottom > vh * 0.4) {
          AUDIT.clipped.push({
            el: id,
            tag: el.tagName,
            text: text.slice(0, 60),
            clip,
            rect: [Math.round(rect.top), Math.round(rect.bottom)],
          })
        }
      }

      if (isTransparentFill) {
        AUDIT.low.push({ el: id, tag: el.tagName, text: text.slice(0, 60), kind: 'transparent-fill', clip })
      } else if (op < 0.7) {
        AUDIT.low.push({ el: id, tag: el.tagName, text: text.slice(0, 60), kind: 'opacity:' + op.toFixed(2), color: cs.color, ratio: ratio.toFixed(2) })
      } else if (ratio < 4.5) {
        AUDIT.low.push({
          el: id,
          tag: el.tagName,
          text: text.slice(0, 60),
          kind: 'contrast:' + ratio.toFixed(2),
          color: cs.color,
          bg: `rgb(${effBg.join(',')})`,
        })
      }
    }
  }
})

// Scroll through the page and measure.
const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
const steps = 16
for (let i = 0; i <= steps; i++) {
  const y = Math.round((total * i) / steps)
  await page.evaluate((yy) => window.scrollTo(0, yy), y)
  await page.waitForTimeout(280)
  await page.evaluate(() => window.__measure())
  await page.screenshot({ path: `${OUT}/step-${String(i).padStart(2, '0')}.png` })
}

// Final: absolute bottom, then re-measure after settling.
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
await page.waitForTimeout(600)
await page.evaluate(() => window.__measure())
await page.screenshot({ path: `${OUT}/bottom.png` })
// Also a full-page shot.
await page.screenshot({ path: `${OUT}/fullpage.png`, fullPage: true })

const report = await page.evaluate(() => {
  const dedupe = (arr, key) => {
    const seen = new Set()
    return arr.filter((x) => {
      const k = x[key] + '|' + (x.text || '')
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
  }
  return {
    low: dedupe(window.__audit.low, 'el').slice(0, 120),
    clipped: dedupe(window.__audit.clipped, 'el').slice(0, 60),
    seps: dedupe(window.__audit.seps, 'el'),
  }
})

log(`\n===== AUDIT: ${URL} =====`)
log(`\n-- LOW-CONTRAST / INVISIBLE TEXT (${report.low.length}) --`)
for (const r of report.low) {
  log(`  ${r.kind.padEnd(28)} ${r.tag.padEnd(6)} ${JSON.stringify(r.text)}  @ ${r.el}`)
}
log(`\n-- STUCK CLIP (${report.clipped.length}) --`)
for (const r of report.clipped) {
  log(`  ${r.tag.padEnd(6)} ${JSON.stringify(r.text)} clip=${r.clip} rect=${r.rect} @ ${r.el}`)
}
log(`\n-- DECORATIVE SEPARATORS IN RENDERED TEXT (${report.seps.length}) --`)
for (const r of report.seps) {
  log(`  "${r.char}"  ${JSON.stringify(r.text)}  @ ${r.el}`)
}
log(`\nScreenshots → ${OUT}/`)
log(`Full page height: ${total}px`)

await browser.close()
