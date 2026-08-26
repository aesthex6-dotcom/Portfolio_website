const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Clear localStorage first
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Scroll to stats section
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(5000);

  // Get all text content from stat cards
  const statCards = await page.$$('div[class*="flex flex-col items-center gap-2"]');
  console.log('Total stat cards:', statCards.length);

  for (let i = 0; i < statCards.length; i++) {
    const text = await statCards[i].innerText();
    console.log(`Stat Card ${i}: "${text}"`);
  }

  // Check localStorage cache
  const cache = await page.evaluate(() => localStorage.getItem('portfolio:github'));
  console.log('Cache:', cache);

  await browser.close();
})();