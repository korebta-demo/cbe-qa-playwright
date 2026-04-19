import { test, expect } from '@playwright/test';

/**
 * Stable smoke checks against the local Vite demo app (no third-party site).
 */
test.describe('Demo app smoke', () => {
  test('home page renders headline and account card', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-root')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Demo Bank' })).toBeVisible();
    await expect(page.getByTestId('account-summary')).toBeVisible();
    await expect(page.getByTestId('status-pill')).toContainText('active');
  });
});
