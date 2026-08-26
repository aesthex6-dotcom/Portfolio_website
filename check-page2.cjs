const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // More thorough checks
  const bodyText = await page.locator('body').innerText();
  console.log('Body text length:', bodyText.length);

  // Check for key SVG elements
  const svgs = await page.$$('svg');
  console.log('Total SVGs:', svgs.length);
  for (let i = 0; i < svgs.length; i++) {
    const viewBox = await svgs[i].getAttribute('viewBox');
    const className = await svgs[i].getAttribute('class');
    if (viewBox || className) {
      console.log(`SVG ${i}: viewBox="${viewBox}" class="${className}"`);
    }
  }

  // Check for UtilityDock
  const dock = await page.$('div[class*="bottom"]');
  console.log('\nDock element:', !!dock);

  // Check for AtmosphereControl
  const atmosphereBtn = await page.$('button[aria-label*="mood"]') || await page.$('button[aria-label*="Atmosphere"]') || await page.$('[class*="Atmosphere"]');
  console.log('AtmosphereControl:', !!atmosphereBtn);

  // Check for VinylButton
  const vinylBtn = await page.$('button[aria-label*="soundtrack"]') || await page.$('button[aria-label*="vinyl"]') || await page.$('[class*="Vinyl"]');
  console.log('VinylButton:', !!vinylBtn);

  // Check for lodestar
  const lodestar = await page.$('[class*="lodestar"]') || await page.$('[class*="Lodestar"]');
  console.log('Lodestar:', !!lodestar);

  // Get computed styles for EngineeredField
  const engineSvg = await page.$('svg.fixed.inset-0.-z-10');
  console.log('EngineeredField SVG:', !!engineSvg);

  // Check all fixed elements
  const fixedElements = await page.$$('div[style*="fixed"], section[style*="fixed"]');
  console.log('\nFixed position elements:', fixedElements.length);

  await browser.close();
})();