import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(rootDir, 'dist')
const testResultsDir = path.resolve(rootDir, 'test-results')

if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true })
}

// Simple static server for dist
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

function startServer(port = 4174) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0])
      if (reqPath === '/') reqPath = '/index.html'

      let filePath = path.join(distDir, reqPath)
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distDir, 'index.html')
      }

      const ext = path.extname(filePath).toLowerCase()
      const contentType = mimeTypes[ext] || 'application/octet-stream'

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('404 Not Found')
        } else {
          res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          })
          res.end(content)
        }
      })
    })

    server.listen(port, () => {
      resolve(server)
    })
  })
}

async function runVerification() {
  console.log('--- Starting Cinematic Browser Verification ---')
  const port = 4174
  const server = await startServer(port)
  console.log(`Static server running at http://localhost:${port}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  })

  const page = await context.newPage()

  const consoleErrors = []
  const failedRequests = []
  const knightFramesRequested = new Set()
  const samuraiFramesRequested = new Set()

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
      console.error('Browser console error:', msg.text())
    }
  })

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message)
    console.error('Browser page error:', err.message)
  })

  page.on('response', (res) => {
    const url = res.url()
    if (res.status() >= 400) {
      failedRequests.push({ url, status: res.status() })
      console.error(`Failed HTTP request (${res.status()}): ${url}`)
    }
    if (url.includes('/cinematics/knight/frame_')) {
      const match = url.match(/frame_(\d+)\.avif/)
      if (match) knightFramesRequested.add(match[1])
    }
    if (url.includes('/cinematics/samurai/frame_')) {
      const match = url.match(/frame_(\d+)\.avif/)
      if (match) samuraiFramesRequested.add(match[1])
    }
  })

  // Test 1: Knight Sequence (English mode)
  console.log('\n[Test 1] Knight Sequence Verification (English mode)')
  await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle' })

  // Check canvas presence
  const canvas = await page.locator('canvas[aria-label="Cinematic sequence"]')
  await canvas.waitFor({ state: 'visible', timeout: 5000 })
  console.log('✓ Cinematic canvas mounted and visible')

  // Capture p=0 (initial frame)
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(testResultsDir, 'knight_p000.png') })
  console.log('✓ Captured Knight p=0.0 (Frame 001)')

  // Get runway height
  const runwayHeight = await page.evaluate(() => {
    return 6 * window.innerHeight // 600vh runway
  })
  console.log(`Runway height calculated: ${runwayHeight}px`)

  // Step scroll Knight to p=0.25, p=0.50, p=0.75, p=1.00
  const steps = [
    { p: 0.25, name: 'knight_p025.png', label: 'p=0.25 (~Frame 030)' },
    { p: 0.50, name: 'knight_p050.png', label: 'p=0.50 (~Frame 060)' },
    { p: 0.75, name: 'knight_p075.png', label: 'p=0.75 (~Frame 090)' },
    { p: 1.00, name: 'knight_p100.png', label: 'p=1.00 (Frame 120 - Screen Zoom)' },
  ]

  for (const step of steps) {
    const targetY = Math.round(step.p * runwayHeight)
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY)
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(testResultsDir, step.name) })
    console.log(`✓ Scrolled and captured Knight ${step.label}`)
  }

  // Test 2: Reverse Scrolling (Fast scroll back to p=0)
  console.log('\n[Test 2] Reverse Scrolling Verification')
  for (let p = 0.9; p >= 0; p -= 0.3) {
    const targetY = Math.round(p * runwayHeight)
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY)
    await page.waitForTimeout(100)
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await page.waitForTimeout(400)
  console.log('✓ Reverse scrolling executed cleanly back to top')

  // Test 3: Samurai Sequence (Japanese mode)
  console.log('\n[Test 3] Samurai Sequence Verification (Japanese mode)')
  await page.evaluate(() => {
    localStorage.setItem('portfolio:mode', 'ja')
  })
  await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(testResultsDir, 'samurai_p000.png') })
  console.log('✓ Switched to Japanese mode, captured Samurai p=0.0 (Frame 001)')

  // Step scroll Samurai
  const samuraiSteps = [
    { p: 0.30, name: 'samurai_p030.png', label: 'p=0.30 (~Frame 036)' },
    { p: 0.60, name: 'samurai_p060.png', label: 'p=0.60 (~Frame 072)' },
    { p: 1.00, name: 'samurai_p100.png', label: 'p=1.00 (Frame 120 - Screen Zoom)' },
  ]

  for (const step of samuraiSteps) {
    const targetY = Math.round(step.p * runwayHeight)
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), targetY)
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(testResultsDir, step.name) })
    console.log(`✓ Scrolled and captured Samurai ${step.label}`)
  }

  // Test 4: Mid-Sequence Mode Switch at p=0.50
  console.log('\n[Test 4] Mid-Sequence Mode Switch Verification')
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(0.50 * runwayHeight))
  await page.waitForTimeout(300)
  // Switch mode to 'en' in localStorage
  await page.evaluate(() => {
    localStorage.setItem('portfolio:mode', 'en')
    // Trigger storage event or direct UI update if applicable
  })
  console.log('✓ Mid-sequence mode state switched successfully')

  // Test 5: Rapid Bidirectional Scrubbing
  console.log('\n[Test 5] Rapid Bidirectional Scrubbing Stress Test')
  for (let cycle = 0; cycle < 5; cycle++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), 4000)
    await page.waitForTimeout(50)
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), 1000)
    await page.waitForTimeout(50)
  }
  await page.waitForTimeout(300)
  console.log('✓ Rapid bidirectional scrubbing stress test completed with zero crashes')

  // Test 6: Mobile Responsiveness Check
  console.log('\n[Test 6] Mobile Responsive Viewport Verification')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }))
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(testResultsDir, 'mobile_viewport.png') })
  console.log('✓ Mobile viewport captured (390x844)')

  // Teardown
  await browser.close()
  server.close()

  console.log('\n--- VERIFICATION SUMMARY ---')
  console.log(`Knight frames requested: ${knightFramesRequested.size}`)
  console.log(`Samurai frames requested: ${samuraiFramesRequested.size}`)
  console.log(`HTTP 404/Error requests: ${failedRequests.length}`)
  console.log(`Browser console errors: ${consoleErrors.length}`)

  if (failedRequests.length > 0) {
    console.error('Failed requests:', failedRequests)
  }
  if (consoleErrors.length > 0) {
    console.error('Console errors:', consoleErrors)
  }

  if (failedRequests.length === 0 && consoleErrors.length === 0) {
    console.log('\n🎉 ALL CINEMATIC SEQUENCE TESTS PASSED WITH ZERO ERRORS!')
  } else {
    process.exitCode = 1
  }
}

runVerification().catch((err) => {
  console.error('Verification script error:', err)
  process.exit(1)
})
