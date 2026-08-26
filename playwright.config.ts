import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: ['capture-hero-screenshot.mjs', 'verify-final-polish.mjs'],
  use: {
    baseURL: 'http://localhost:5179',
    headless: true,
    screenshot: 'only-on-failure',
  },
});