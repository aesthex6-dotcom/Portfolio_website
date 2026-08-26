const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // Scroll down to trigger more content
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(1000);

  // Check for EngineeredField after scrolling
  const engineSvg = await page.$('svg[viewBox="0 0 100 100"]');
  console.log('EngineeredField SVG after scroll:', !!engineSvg);

  // Check for ProjectScene
  const projectScenes = await page.$$('[class*="ProjectScene"]');
  console.log('ProjectScene elements:', projectScenes.length);

  // Check for sections
  const sections = await page.$$('section');
  console.log('Total sections:', sections.length);
  for (let i = 0; i < sections.length; i++) {
    const id = await sections[i].getAttribute('id');
    const className = await sections[i].getAttribute('class');
    console.log(`Section ${i}: id="${id}" class="${className}"`);
  }

  // Check for fixed elements with style
  const fixedStyle = await page.$$('[style*="fixed"]');
  console.log('\nElements with style containing "fixed":', fixedStyle.length);

  // Check for the .noise and .vignette
  const noise = await page.$('.noise');
  const vignette = await page.$('.vignette');
  console.log('.noise:', !!noise);
  console.log('.vignette:', !!vignette);

  // Check for EngineeredField by its unique classes
  const efElements = await page.$$('[class*="Engineered"], [class*="engineered"]');
  console.log('EngineeredField elements:', efElements.length);

  // Check for svg with class containing fixed inset
  const allSvg = await page.$$('svg');
  console.log('\nAll SVGs with details:');
  for (let i = 0; i < allSvg.length; i++) {
    const style = await allSvg[i].getAttribute('style');
    const className = await allSvg[i].getAttribute('class');
    const viewBox = await allSvg[i].getAttribute('viewBox');
    if (className && (className.includes('fixed') || className.includes('inset') || className.includes('pointer'))) {
      console.log(`  SVG ${i}: class="${className}" viewBox="${viewBox}" style="${style}"`);
    }
  }

  await browser.close();
})();