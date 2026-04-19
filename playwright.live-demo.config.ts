import { defineConfig, devices } from '@playwright/test';

const slowMoMs =
  process.env.PLAYWRIGHT_DEMO_SLOW_MO !== undefined
    ? Number(process.env.PLAYWRIGHT_DEMO_SLOW_MO)
    : 400;

/**
 * Live presentation config — one browser, one worker, visible pacing.
 *
 * Examples:
 *   npx playwright test tests/demo.spec.ts -c playwright.live-demo.config.ts --headed --workers=1
 *   yarn test:e2e -- --headed --workers=1
 *
 * slowMo defaults to 400ms. Disable with: PLAYWRIGHT_DEMO_SLOW_MO=0
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/demo.spec.ts',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-live-demo' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'https://combanketh.et',
    headless: true,
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    actionTimeout: 20_000,
    launchOptions: {
      slowMo: slowMoMs || undefined,
    },
  },
});
