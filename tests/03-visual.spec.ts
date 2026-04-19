import { test, expect } from '@playwright/test';
import { gotoPublicHome } from './site';

// ─────────────────────────────────────────────
// Suite 3 – Visible capture (no stored pixel baselines)
// Baseline snapshots are brittle across OS/fonts/ads; we keep a stable
// screenshot artifact for humans and CI instead of toHaveScreenshot().
// ─────────────────────────────────────────────

test.describe('Visual capture', () => {
  test('home viewport screenshot for review', async ({ page }) => {
    await gotoPublicHome(page);

    await page.screenshot({ path: 'screenshots/03-home-viewport.png', fullPage: false });

    const viewportH = await page.evaluate(() => window.innerHeight);
    expect(viewportH).toBeGreaterThan(200);
  });
});
