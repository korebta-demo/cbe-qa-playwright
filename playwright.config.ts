import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,                   // retry once on failure before marking as failed
  workers: 2,
  reporter: [
    ['list'],                   // console output
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['github'],                 // summary on the Actions run page (when running in CI)
    ['junit', { outputFile: 'results/junit.xml' }],
  ],

  use: {
    baseURL: 'https://www.combanketh.et',
    headless: true,
    screenshot: 'only-on-failure',   // save screenshot when a test fails
    video: 'retain-on-failure',      // save video when a test fails
    trace: 'retain-on-failure',      // save trace when a test fails
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
