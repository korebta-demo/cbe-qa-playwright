import { test, expect } from '@playwright/test';
import { gotoPublicHome } from './site';

// ─────────────────────────────────────────────
// Suite 2 – What visitors actually see (smoke, not a crawler)
// ─────────────────────────────────────────────

test.describe('Public site smoke', () => {
  test.beforeEach(async ({ page }) => {
    await gotoPublicHome(page);
  });

  test('page shows navigation or other obvious interactive chrome', async ({ page }) => {
    // Avoid locator.or() in expect — strict mode errors when *both* sides match.
    const navCount = await page.getByRole('navigation').count();
    if (navCount > 0) {
      await expect(page.getByRole('navigation').first()).toBeVisible({ timeout: 25_000 });
    } else {
      await expect(page.getByRole('link').first()).toBeVisible({ timeout: 25_000 });
    }
    await page.screenshot({ path: 'screenshots/02-top-chrome.png' });
  });

  test('body has meaningful text (not an empty shell)', async ({ page }) => {
    const textLen = await page.evaluate(() => (document.body?.innerText ?? '').trim().length);
    expect(textLen, 'expected visible text on the page').toBeGreaterThan(80);
  });

  test('first same-origin relative link returns OK when fetched', async ({ page, request }) => {
    const href = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]'));
      const pick = anchors.find(a => {
        const path = a.getAttribute('href') ?? '';
        return path.length > 1 && !path.startsWith('//');
      });
      return pick?.getAttribute('href') ?? null;
    });

    if (!href) {
      test.skip(true, 'No in-page relative link found to probe');
      return;
    }

    const res = await request.get(href);
    expect(res.status(), `GET ${href} → ${res.status()}`).toBeLessThan(400);
  });
});
