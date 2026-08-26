const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Wait for everything to initialize
  await page.waitForTimeout(2000);

  // Scroll down to trigger scroll progress
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(1000);

  // Check for EngineeredField SVG - fixed inset-0 -z-10
  const engineSvg = await page.$('svg.fixed.inset-0.-z-10[viewBox="0 0 100 100"]');
  console.log('EngineeredField SVG:', !!engineSvg);

  // Check for EngineeredField by unique classes
  const efElements = await page.$$('[class*="Engineered"], [class*="engineered"]');
  console.log('EngineeredField elements (by class):', efElements.length);

  // Check all fixed position SVGs
  const allSvg = await page.$$('svg');
  console.log('\nTotal SVGs:', allSvg.length);
  for (let i = 0; i < allSvg.length; i++) {
    const style = await allSvg[i].getAttribute('style');
    const className = await allSvg[i].getAttribute('class');
    const viewBox = await allSvg[i].getAttribute('viewBox');
    if (className && (className.includes('fixed') || className.includes('inset') || className.includes('pointer') || className.includes('z-10'))) {
      console.log(`  SVG ${i}: class="${className}" viewBox="${viewBox}"`);
    }
  }

  // Check for the .noise and .vignette
  const noise = await page.$('.noise');
  const vignette = await page.$('.vignette');
  console.log('\n.noise:', !!noise);
  console.log('.vignette:', !!vignette);

  // Check sections
  const sections = await page.$$('section');
  console.log('\nTotal sections:', sections.length);
  for (let i = 0; i < sections.length; i++) {
    const id = await sections[i].getAttribute('id');
    const className = await sections[i].getAttribute('class');
    console.log(`Section ${i}: id="${id}" class="${className}"`);
  }

  await browser.close();
})();