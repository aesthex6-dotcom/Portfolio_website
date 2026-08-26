const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Check for key elements
  const hero = await page.$('#top');
  const knightRunway = await page.$('#knight-runway');
  const engineeredField = await page.$('svg[viewBox="0 0 100 100"]');
  const utilityDock = await page.$('div[style*="--dock-bottom"]');

  console.log('Hero section (#top):', !!hero);
  console.log('Knight Runway (#knight-runway):', !!knightRunway);
  console.log('EngineeredField SVG:', !!engineeredField);
  console.log('UtilityDock:', !!utilityDock);

  // Check text content
  const bodyText = await page.locator('body').innerText();
  console.log('\nPage contains "HIMANSHU":', bodyText.includes('HIMANSHU'));
  console.log('Page contains "ARYA":', bodyText.includes('ARYA'));
  console.log('Page contains "PORTFOLIO":', bodyText.includes('PORTFOLIO'));

  await browser.close();
})();