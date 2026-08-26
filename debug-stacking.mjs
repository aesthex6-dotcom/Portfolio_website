import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

console.log('Navigating to localhost:5173...');
await page.goto('http://localhost:5179', { waitUntil: 'domcontentloaded', timeout: 60000 });

// Wait for app to render
await page.waitForTimeout(3000);

// Scroll down to trigger dock visibility (runway needs ~90vh = ~90 * viewportHeight)
// Keep scroll at 95vh to keep dock visible
await page.evaluate(() => window.scrollBy(0, window.innerHeight * 95));
await page.waitForTimeout(1500);

// DON'T scroll back to 0 - keep the scroll position to verify dock is visible
// await page.evaluate(() => window.scrollTo(0, 0));
// await page.waitForTimeout(500);

const debugResults = await page.evaluate(() => {
  const results = {};

  // 1. Find UtilityDock
  const utilityDock = document.querySelector('.utility-dock') ||
    document.querySelector('[class*="UtilityDock"]') ||
    document.querySelector('div.fixed.bottom-\\[var\\(--dock-bottom\\)\\]');

  // Try broader: the fixed element at bottom-right with z-[70]
  const allFixed = [...document.querySelectorAll('*')].filter(el => {
    const computed = getComputedStyle(el);
    return computed.position === 'fixed' &&
      computed.zIndex === '70' &&
      el.className?.includes?.('bottom-');
  });

  results.utilityDockCandidates = allFixed.map(el => ({
    tag: el.tagName,
    classes: el.className,
    id: el.id,
    boundingRect: el.getBoundingClientRect(),
    computed: {
      opacity: getComputedStyle(el).opacity,
      visibility: getComputedStyle(el).visibility,
      display: getComputedStyle(el).display,
      zIndex: getComputedStyle(el).zIndex,
      position: getComputedStyle(el).position,
      filter: getComputedStyle(el).filter,
      mixBlendMode: getComputedStyle(el).mixBlendMode,
      transform: getComputedStyle(el).transform,
      clipPath: getComputedStyle(el).clipPath,
      mask: getComputedStyle(el).maskImage,
      overflow: getComputedStyle(el).overflow,
      pointerEvents: getComputedStyle(el).pointerEvents,
      isolation: getComputedStyle(el).isolation,
      color: getComputedStyle(el).color,
      backgroundColor: getComputedStyle(el).backgroundColor,
    }
  }));

  // 2. Also search by the structure: fixed bottom-right z-[70] container
  // The UtilityDock renders children: VinylButton, Chat button, Mode selector, AtmosphereControl
  const fixedRightBottom = [...document.querySelectorAll('div.fixed')].filter(el => {
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return rect.right > window.innerWidth - 100 &&
      rect.bottom > window.innerHeight - 200 &&
      cs.position === 'fixed';
  });

  results.fixedRightBottom = fixedRightBottom.map(el => ({
    tag: el.tagName,
    classes: el.className.substring(0, 200),
    boundingRect: el.getBoundingClientRect(),
    computed: {
      opacity: getComputedStyle(el).opacity,
      visibility: getComputedStyle(el).visibility,
      display: getComputedStyle(el).display,
      zIndex: getComputedStyle(el).zIndex,
      position: getComputedStyle(el).position,
      filter: getComputedStyle(el).filter,
      transform: getComputedStyle(el).transform,
      overflow: getComputedStyle(el).overflow,
    }
  }));

  // 3. Check for elements that might be covering the dock
  // Look for any fixed element with high z-index
  const allZFixed = [...document.querySelectorAll('*')].filter(el => {
    const cs = getComputedStyle(el);
    return cs.position === 'fixed' && parseInt(cs.zIndex) >= 50;
  }).sort((a, b) => parseInt(getComputedStyle(b).zIndex) - parseInt(getComputedStyle(a).zIndex));

  results.highZFixedElements = allZFixed.slice(0, 15).map(el => {
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      classes: (el.className || '').toString().substring(0, 120),
      zIndex: cs.zIndex,
      boundingRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      opacity: cs.opacity,
      visibility: cs.visibility,
      transform: cs.transform,
      filter: cs.filter,
      pointerEvents: cs.pointerEvents,
    };
  });

  // 4. Check Knight Portal specifically
  const knightPortal = document.querySelector('#knight-runway')?.querySelector('.fixed');
  const knightPortalSvg = knightPortal?.querySelector('svg');

  results.knightPortal = knightPortal ? {
    tag: knightPortal.tagName,
    classes: knightPortal.className?.substring(0, 200),
    boundingRect: knightPortal.getBoundingClientRect(),
    computed: {
      opacity: getComputedStyle(knightPortal).opacity,
      visibility: getComputedStyle(knightPortal).visibility,
      display: getComputedStyle(knightPortal).display,
      zIndex: getComputedStyle(knightPortal).zIndex,
      position: getComputedStyle(knightPortal).position,
      filter: getComputedStyle(knightPortal).filter,
      transform: getComputedStyle(knightPortal).transform,
      isolation: getComputedStyle(knightPortal).isolation,
      overflow: getComputedStyle(knightPortal).overflow,
      willChange: getComputedStyle(knightPortal).willChange,
    },
    svgPresent: !!knightPortalSvg,
  } : null;

  // 5. Check the noise and vignette overlays
  const noise = document.querySelector('.noise');
  const vignette = document.querySelector('.vignette');

  results.noiseOverlay = noise ? {
    boundingRect: noise.getBoundingClientRect(),
    computed: {
      position: getComputedStyle(noise).position,
      zIndex: getComputedStyle(noise).zIndex,
      opacity: getComputedStyle(noise).opacity,
      pointerEvents: getComputedStyle(noise).pointerEvents,
      mixBlendMode: getComputedStyle(noise).mixBlendMode,
      isolation: getComputedStyle(noise).isolation,
    },
    beforePseudo: (() => {
      const pseudo = getComputedStyle(noise, '::before');
      return {
        position: pseudo.position,
        zIndex: pseudo.zIndex,
        opacity: pseudo.opacity,
        pointerEvents: pseudo.pointerEvents,
        mixBlendMode: pseudo.mixBlendMode,
        inset: pseudo.inset,
      };
    })(),
  } : null;

  results.vignetteOverlay = vignette ? {
    boundingRect: vignette.getBoundingClientRect(),
    computed: {
      position: getComputedStyle(vignette).position,
      zIndex: getComputedStyle(vignette).zIndex,
      opacity: getComputedStyle(vignette).opacity,
      pointerEvents: getComputedStyle(vignette).pointerEvents,
    },
  } : null;

  // 6. Check hero section stacking
  const heroSection = document.querySelector('#knight-runway');

  // 7. Check the actual children inside UtilityDock
  const utilityDockEl = document.querySelector('.no-print.fixed.bottom-\\[var\\(--dock-bottom\\)\\].right-6.z-\\[70\\]');
  const dockChildren = utilityDockEl ? [...utilityDockEl.children].map(child => {
    const rect = child.getBoundingClientRect();
    const cs = getComputedStyle(child);
    return {
      tag: child.tagName,
      classes: child.className?.substring(0, 200),
      boundingRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      computed: {
        opacity: cs.opacity,
        visibility: cs.visibility,
        display: cs.display,
        zIndex: cs.zIndex,
        position: cs.position,
        transform: cs.transform,
        filter: cs.filter,
        pointerEvents: cs.pointerEvents,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        border: cs.border,
      }
    };
  }) : [];

  results.dockChildren = dockChildren;
  results.heroSection = heroSection ? {
    height: heroSection.offsetHeight,
    boundingRect: heroSection.getBoundingClientRect(),
    computed: {
      position: getComputedStyle(heroSection).position,
      zIndex: getComputedStyle(heroSection).zIndex,
      isolation: getComputedStyle(heroSection).isolation,
      transform: getComputedStyle(heroSection).transform,
    },
    childFixedElements: [...heroSection.querySelectorAll('[style*="position: fixed"], [class*="fixed"]')].map(el => ({
      tag: el.tagName,
      classes: el.className?.substring(0, 150),
      computed: {
        position: getComputedStyle(el).position,
        zIndex: getComputedStyle(el).zIndex,
        opacity: getComputedStyle(el).opacity,
        willChange: getComputedStyle(el).willChange,
        isolation: getComputedStyle(el).isolation,
        transform: getComputedStyle(el).transform,
        filter: getComputedStyle(el).filter,
        overflow: getComputedStyle(el).overflow,
      }
    }))
  } : null;

  return results;
});

console.log(JSON.stringify(debugResults, null, 2));

await browser.close();
