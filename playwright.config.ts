import { defineConfig, devices } from '@playwright/test';

/**
 * Default config — external regression (Chromium + mobile), excludes live-demo file.
 *
 *   yarn test:external
 *
 * Headed live demo (Chromium only, slowMo, one worker by default in that config):
 *   npx playwright test -c playwright.live-demo.config.ts --headed
 *
 * Local Vite smoke:
 *   yarn test:demo
 */
export default defineConfig({
  testDir: './tests',
  // Ignore Vitest files under tests/unit/ (*.test.ts) and local Vite demo folder.
  testIgnore: ['**/demo/**', '**/demo.spec.ts', '**/unit/**'],
  timeout: 30_000,
  retries: 1,
  workers: 2,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['github'],
    ['junit', { outputFile: 'results/junit.xml' }],
  ],

  use: {
    baseURL: 'https://combanketh.et',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
});
