import { defineConfig, devices } from '@playwright/test';

/**
 * Local demo smoke tests only — starts the Vite app and hits http://127.0.0.1:5173.
 * Use: `yarn test:demo` or CI. Does not run the external CBE website suites.
 */
export default defineConfig({
  testDir: './tests/demo',
  timeout: 20_000,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report-demo' }],
    ['github'],
  ],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
