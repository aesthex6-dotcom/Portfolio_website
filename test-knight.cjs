const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5175', { waitUntil: 'networkidle', timeout: 60000 });
  
  // Wait for the hero to render
  await page.waitForTimeout(2000);
  
  // Check for the Knight Portal SVG
  const svg = await page.$('svg[viewBox="0 0 1600 900"]');
  if (svg) {
    console.log('✅ Knight Portal SVG found!');
    const layers = await page.$$eval('svg[viewBox="0 0 1600 900"] > g[id^="L-"]', els => els.map(e => e.getAttribute('id')));
    console.log('Layers found:', layers);
  } else {
    console.log('❌ Knight Portal SVG NOT found');
    const allSvgs = await page.$$eval('svg', els => els.map(e => e.getAttribute('viewBox')));
    console.log('All SVG viewBoxes:', allSvgs);
  }
  
  // Check for hero section
  const hero = await page.$('#top');
  if (hero) console.log('✅ Hero section found');
  else console.log('❌ Hero section NOT found');
  
  // Check runway
  const runway = await page.$('#knight-runway');
  if (runway) console.log('✅ Knight runway found');
  else console.log('❌ Knight runway NOT found');
  
  // Get scroll height
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log('Document scrollHeight:', scrollHeight);
  
  await browser.close();
})();
