import { test, expect } from '@playwright/test';

test('Capture Hero screenshot for My AI portfolio project', async ({ page }) => {
  test.setTimeout(60000);
  // Start from the home page - the Hero is the first section
  await page.goto('http://localhost:5179', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for the Hero to fully render
  await page.waitForTimeout(3000);

  // The Hero content is in #top section (fixed overlay during Knight Runway)
  // Wait for the portrait to be visible as a signal that Hero is rendered
  await page.waitForSelector('#top img, #top [class*="PhotoFrame"]', { timeout: 20000, state: 'visible' });

  // Small wait for animations to settle
  await page.waitForTimeout(1500);

  // Capture the Hero viewport - the #top section contains the Hero content
  const heroSection = page.locator('#top');
  await expect(heroSection).toBeVisible();

  // Take screenshot of the Hero section
  await heroSection.screenshot({
    path: 'public/projects/kumar-portfolio.png',
    animations: 'disabled', // Disable animations for clean capture
  });

  console.log('Hero screenshot captured to public/projects/kumar-portfolio.png');
});