const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Check if SVG exists
  const svg = await page.$('svg[viewBox="0 0 1600 900"]');
  console.log('SVG found:', !!svg);

  // Check for knight elements
  const knight = await page.$('#L-knight');
  console.log('Knight layer found:', !!knight);

  const laptop = await page.$('#L-laptop');
  console.log('Laptop layer found:', !!laptop);

  const screen = await page.$('#L-screen');
  console.log('Screen layer found:', !!screen);

  // Check runway
  const runway = await page.$('#knight-runway');
  console.log('Runway found:', !!runway);
  if (runway) {
    const style = await runway.evaluate(el => getComputedStyle(el).height);
    console.log('Runway height:', style);
  }

  // Check overall page structure
  const hero = await page.$('#top');
  console.log('Hero section found:', !!hero);

  // Take screenshot
  await page.screenshot({ path: 'hero_check.png', fullPage: true });
  console.log('Screenshot saved');

  await browser.close();
})();