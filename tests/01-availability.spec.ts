import { test, expect } from '@playwright/test';
import { gotoPublicHome } from './site';

// ─────────────────────────────────────────────
// Suite 1 – Availability (minimal, demo-friendly)
// Uses https://combanketh.et + /home (www subdomain is not used).
// ─────────────────────────────────────────────

test.describe('Site Availability', () => {
  test('public home loads with a real HTTP response', async ({ page }) => {
    const response = await gotoPublicHome(page);
    expect(response, 'navigation should return a response').toBeTruthy();
    expect(response!.status(), `unexpected status: ${response!.status()}`).toBeLessThan(400);

    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveTitle(/.+/);

    await page.screenshot({ path: 'screenshots/01-home-full.png', fullPage: true });
  });

  test('home becomes interactive within a reasonable time', async ({ page }) => {
    const start = Date.now();
    await gotoPublicHome(page);
    await page.waitForLoadState('domcontentloaded');
    const elapsed = Date.now() - start;
    expect(elapsed, `load took ${elapsed}ms`).toBeLessThan(25_000);
  });
});
