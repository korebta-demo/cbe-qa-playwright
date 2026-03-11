import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────
// SUITE 4 – Visual Snapshot Tests
//
// HOW THESE WORK:
// First run:  snapshots are created and saved in tests/__snapshots__/
// Later runs: new screenshots are compared to the saved baseline
// If they differ beyond the threshold → test fails
//
// To update baselines after an intentional redesign:
//   npx playwright test --update-snapshots
// ─────────────────────────────────────────────

test.describe('Visual Snapshots', () => {

  test('homepage visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hide dynamic elements that change every load (banners, dates, etc.)
    await page.evaluate(() => {
      // Add selectors here that are dynamic/animated and should be hidden during snapshot
      const dynamicSelectors = ['.ticker', '.countdown', '[data-dynamic]', '.banner-slider'];
      dynamicSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          (el as HTMLElement).style.visibility = 'hidden';
        });
      });
    });

    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: false,
      maxDiffPixelRatio: 0.05, // allow up to 5% pixel difference
    });
  });

  test('header visual snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header, [role="banner"]').first();
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('header.png', {
        maxDiffPixelRatio: 0.03,
      });
    } else {
      test.skip(true, 'No header element found');
    }
  });

});
