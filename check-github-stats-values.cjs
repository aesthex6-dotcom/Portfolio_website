const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Scroll to stats section
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(3000);

  // Get all text content from stat cards
  const statCards = await page.$$('div[class*="flex flex-col items-center gap-2"]');
  console.log('Total stat cards:', statCards.length);

  for (let i = 0; i < statCards.length; i++) {
    const text = await statCards[i].innerText();
    console.log(`Stat Card ${i}: "${text}"`);
  }

  // Check for unavailable indicators
  const unavailable = await page.$$('text=—');
  console.log('Unavailable indicators (—):', unavailable.length);

  // Check for any error fallback
  const errorFallback = await page.$('text=GitHub stats temporarily unavailable');
  console.log('Error fallback shown:', !!errorFallback);

  // Check repo count specifically
  const repoText = await page.$eval('text=Repositories', el => el.closest('div')?.innerText || '');
  console.log('Repositories card full text:', repoText);

  await browser.close();
})();