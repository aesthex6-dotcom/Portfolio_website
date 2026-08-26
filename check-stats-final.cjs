const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => console.log('[BROWSER]', msg.type(), msg.text()));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);

  // Check where the stats section is
  const statsSection = await page.$('div.flex.flex-wrap.items-stretch.gap-4');
  if (statsSection) {
    const box = await statsSection.boundingBox();
    console.log('Stats section bounding box:', box);
  }

  // Scroll to stats section - go further down
  await page.evaluate(() => window.scrollTo(0, 12000));
  await page.waitForTimeout(3000);

  // Check visibility of stat cards
  const statCards = await page.$$('div[class*="flex flex-col items-center gap-2"]');
  console.log('Total stat cards:', statCards.length);

  for (let i = 0; i < statCards.length; i++) {
    const box = await statCards[i].boundingBox();
    const visible = await statCards[i].isVisible();
    const viewport = await page.evaluate(() => ({ innerHeight: window.innerHeight, scrollY: window.scrollY }));
    console.log(`Stat Card ${i}:`, { box, visible, viewport });
    const text = await statCards[i].innerText();
    console.log(`Stat Card ${i} text: "${text}"`);
  }

  await page.waitForTimeout(5000);

  for (let i = 0; i < statCards.length; i++) {
    const text = await statCards[i].innerText();
    console.log(`Stat Card ${i} final text: "${text}"`);
  }

  await browser.close();
})();