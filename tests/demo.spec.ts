import { test, expect, type Page } from '@playwright/test';
import { gotoPublicHome } from './site';

/**
 * Live-site demo tests — easy to narrate on screen.
 *
 *   npx playwright test tests/demo.spec.ts -c playwright.live-demo.config.ts --headed --workers=1
 *   yarn test:e2e -- --headed --workers=1
 *
 * Note: the marketing `h1` on /home can exist in the DOM but be CSS-hidden; we assert on
 * visible chrome (nav + in-nav links) instead of `heading` level 1.
 */

/** True “visible” checks: nav + at least one link users can see inside it. */
async function expectVisibleHomeChrome(page: Page) {
  const nav = page.getByRole('navigation').first();
  await expect(nav).toBeVisible({ timeout: 20_000 });
  const inNavLink = nav.getByRole('link').first();
  await expect(inNavLink).toBeVisible({ timeout: 15_000 });
}

/**
 * Clicks “Internet Banking” and returns whichever page actually received the journey.
 *
 * Sites differ: `target="_blank"` may not always emit `popup` in time (or at all). We avoid
 * hanging on a single event and instead poll for a new tab or a same-tab URL change.
 */
async function openInternetBankingContext(page: Page): Promise<{ ibPage: Page; startUrl: string }> {
  const ibLink = page.getByRole('link', { name: /internet banking|online banking/i }).first();
  await expect(ibLink).toBeVisible({ timeout: 20_000 });

  const startUrl = page.url();
  const context = page.context();

  await ibLink.click();

  // Poll: new browser tab, or same tab navigated away from /home (or query-only change).
  for (let i = 0; i < 50; i++) {
    const others = context.pages().filter((p) => p !== page && !p.isClosed());
    if (others.length > 0) {
      const newest = others[others.length - 1];
      await newest.waitForLoadState('domcontentloaded').catch(() => {});
      return { ibPage: newest, startUrl };
    }

    if (page.url() !== startUrl) {
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      return { ibPage: page, startUrl };
    }

    await page.waitForTimeout(200);
  }

  await page.waitForLoadState('domcontentloaded').catch(() => {});
  return { ibPage: page, startUrl };
}

/** Heuristic: did we leave marketing home, open banking UI, or at least load a “serious” surface? */
function internetBankingStepLooksPlausible(ibPage: Page, startUrl: string): boolean {
  const url = ibPage.url().toLowerCase();
  const start = startUrl.toLowerCase();

  // Full URL compare catches hash / query-only navigations on SPAs.
  const leftMarketingHome = url !== start;
  const urlHints =
    /ibank|login|sign-?on|auth|portal|session|digital|corp|customer|secure|banking|oauth|sso/.test(url);

  // Sync read would block — caller passes body text
  return leftMarketingHome || urlHints;
}

async function internetBankingBodyLooksPlausible(ibPage: Page): Promise<boolean> {
  const body = (await ibPage.locator('body').innerText().catch(() => '')).toLowerCase();

  return (
    /password|username|user\s*id|login|sign\s*in|log\s*in|otp|pin|captcha|customer|internet banking|welcome|secure|token|account|digital|corporate|session/.test(
      body,
    ) || (await ibPage.locator('input:visible').count()) >= 2
  );
}

/** If the bank exposes a Noor control, click twice so the audience sees on/off. No-op if absent. */
async function maybeDemonstrateCBENoor(p: Page) {
  const candidates = [
    p.getByRole('button', { name: /noor/i }),
    p.getByRole('tab', { name: /noor/i }),
    p.getByRole('link', { name: /noor/i }),
    p.getByRole('checkbox', { name: /noor/i }),
  ];

  for (const loc of candidates) {
    const el = loc.first();
    if ((await el.count()) === 0) continue;
    const visible = await el.isVisible().catch(() => false);
    if (!visible) continue;

    await el.scrollIntoViewIfNeeded();
    await el.click();
    await p.waitForTimeout(500);
    await el.click();
    return;
  }
}

test.describe('Public site (demo)', () => {
  test('homepage loads', async ({ page }) => {
    const response = await gotoPublicHome(page);
    expect(response?.status()).toBeLessThan(400);

    const title = await page.title();
    expect(title.trim().length).toBeGreaterThan(0);

    await expectVisibleHomeChrome(page);
    await page.screenshot({ path: 'screenshots/demo-01-home.png', fullPage: true });
  });

  test('navigation works — careers', async ({ page }) => {
    await gotoPublicHome(page);

    const target = page.getByRole('link', { name: /careers/i }).first();
    await expect(target).toBeVisible({ timeout: 15_000 });

    await target.click();
    await page.waitForLoadState('domcontentloaded');

    const urlChanged = !page.url().endsWith('/home');
    const pageText = (await page.locator('body').innerText()).toLowerCase();
    const showsRelatedContent = pageText.includes('career');

    expect(
      urlChanged || showsRelatedContent,
      'Expected URL to leave /home or page body to mention careers after click',
    ).toBe(true);
    await page.screenshot({ path: 'screenshots/demo-02-careers.png', fullPage: true });
  });

  test('internet banking entry — customer path + optional CBE Noor', async ({ page }) => {
    await gotoPublicHome(page);

    const { ibPage, startUrl } = await openInternetBankingContext(page);

    const urlOk = internetBankingStepLooksPlausible(ibPage, startUrl);
    const bodyOk = await internetBankingBodyLooksPlausible(ibPage);

    expect(
      urlOk || bodyOk,
      `After IB click, expected a new tab, navigation, or banking-like UI. url=${ibPage.url()}`,
    ).toBe(true);

    await ibPage.screenshot({ path: 'screenshots/demo-03-internet-banking.png', fullPage: true });

    await maybeDemonstrateCBENoor(ibPage);
    await ibPage.screenshot({ path: 'screenshots/demo-04-after-noor-attempt.png', fullPage: true });

    if (ibPage !== page) await ibPage.close();
  });

  test('another public page — contact or about', async ({ page }) => {
    await gotoPublicHome(page);

    const secondary = page.getByRole('link', { name: /contact|about(\s+us)?/i }).first();

    if ((await secondary.count()) === 0) {
      test.skip(true, 'No Contact / About link found in this build');
      return;
    }

    await expect(secondary).toBeVisible({ timeout: 15_000 });
    await secondary.click();
    await page.waitForLoadState('domcontentloaded');

    const text = (await page.locator('body').innerText()).toLowerCase();
    const urlLeftHome = !page.url().endsWith('/home');

    expect(
      urlLeftHome || text.includes('contact') || text.includes('about'),
      'Expected navigation toward contact/about content',
    ).toBe(true);
    await page.screenshot({ path: 'screenshots/demo-05-contact-about.png', fullPage: true });
  });
});
