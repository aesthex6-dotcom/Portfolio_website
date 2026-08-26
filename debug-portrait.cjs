const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'log') {
      logs.push(msg.text());
      console.log(msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });

  await page.goto('http://localhost:5179', { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for the image to load
  await page.waitForFunction(() => {
    const img = document.querySelector('img[alt="Portrait of Himanshu Arya"]');
    return img && img.naturalWidth > 0;
  }, { timeout: 10000 });

  // Wait a bit more for diagnostics to fire
  await page.waitForTimeout(1000);

  console.log('\n=== ALL CONSOLE LOGS ===');
  logs.forEach(l => console.log(l));

  await browser.close();
})();