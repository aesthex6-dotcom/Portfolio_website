const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Scroll to stats section
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(2000);

  // Check GitHub username display
  const usernameElements = await page.$$('text=@aesthex6-dotcom');
  console.log('Username @aesthex6-dotcom found:', usernameElements.length > 0);

  // Check for incorrect URL username
  const wrongUsername = await page.$$('text=@https://github.com/aesthex6-dotcom');
  console.log('Incorrect @https://... found:', wrongUsername.length > 0);

  // Check profile link href
  const profileLink = await page.$('a[href="https://github.com/aesthex6-dotcom"]');
  console.log('Profile link correct:', !!profileLink);

  // Check stat cards
  const statCards = await page.$$('div[class*="flex flex-col items-center gap-2"]');
  console.log('Stat cards (new layout):', statCards.length);

  // Check for old error message
  const errorMsg = await page.$('text=rate-limited? set VITE_GITHUB_TOKEN');
  console.log('Old error message present:', !!errorMsg);

  // Check for new fallback message
  const fallbackMsg = await page.$('text=GitHub stats temporarily unavailable');
  console.log('New fallback message present:', !!fallbackMsg);

  // Check stat values (repos, stars, followers, forks)
  const repoStat = await page.$('text=Repositories');
  const starsStat = await page.$('text=Stars');
  const followersStat = await page.$('text=Followers');
  const forksStat = await page.$('text=Forks');
  console.log('Repositories label:', !!repoStat);
  console.log('Stars label:', !!starsStat);
  console.log('Followers label:', !!followersStat);
  console.log('Forks label:', !!forksStat);

  // Check view profile link text
  const viewProfile = await page.$('text=view profile');
  console.log('View profile link:', !!viewProfile);

  // Get computed styles for spacing
  const statsContainer = await page.$('div.flex.flex-wrap.items-stretch.gap-4');
  console.log('Stats container with gap-4:', !!statsContainer);

  // Check responsive - mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  const mobileStatsContainer = await page.$('div.flex.flex-wrap.items-stretch.gap-4');
  console.log('Mobile stats container present:', !!mobileStatsContainer);

  // Check stat cards on mobile
  const mobileCards = await page.$$('div[class*="flex flex-col items-center gap-2"]');
  console.log('Mobile stat cards:', mobileCards.length);

  await browser.close();
})();