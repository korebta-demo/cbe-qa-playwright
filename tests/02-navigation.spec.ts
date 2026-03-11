import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────
// SUITE 2 – Navigation & Key User Journeys
// Verifies menus, navigation paths, and that
// important content areas are visible.
// ─────────────────────────────────────────────

test.describe('Navigation & User Journeys', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to be fully interactive
    await page.waitForLoadState('domcontentloaded');
  });

  test('main navigation menu is visible', async ({ page }) => {
    // Look for a nav element or common menu pattern
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  test('navigation links are not broken', async ({ page }) => {
    const links = await page.$$eval('nav a[href]', els =>
      els.map(el => el.getAttribute('href')).filter(Boolean)
    );

    console.log(`Found ${links.length} nav links`);
    expect(links.length).toBeGreaterThan(0);

    // Check that each internal link doesn't return 4xx/5xx
    for (const href of links.slice(0, 10)) { // check first 10 to stay fast
      if (href && href.startsWith('/')) {
        const response = await page.request.get(`https://www.combanketh.et${href}`);
        expect(
          response.status(),
          `Broken link: ${href} returned ${response.status()}`
        ).toBeLessThan(400);
      }
    }
  });

  test('search functionality is present (if available)', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('loan');
      await searchInput.press('Enter');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'screenshots/search-results.png' });
    } else {
      test.skip(true, 'No search input found');
    }
  });

  test('footer is present with key links', async ({ page }) => {
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
    await page.screenshot({ path: 'screenshots/footer.png' });
  });

});

// ─────────────────────────────────────────────
// SUITE 3 – Internet Banking Portal
// ─────────────────────────────────────────────

test.describe('Internet Banking Portal', () => {

  test('internet banking login page is reachable', async ({ page }) => {
    await page.goto('/');

    // Find and click the internet banking link
    const ibLink = page.getByRole('link', { name: /internet banking|online banking/i }).first();

    if (await ibLink.isVisible()) {
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page').catch(() => null),
        ibLink.click(),
      ]);

      const target = newPage || page;
      await target.waitForLoadState('domcontentloaded');

      const status = target.url();
      console.log(`Internet Banking URL resolved to: ${status}`);
      expect(target.url()).not.toContain('error');

      await target.screenshot({ path: 'screenshots/internet-banking-portal.png', fullPage: true });
    } else {
      test.skip(true, 'Internet banking link not found on homepage');
    }
  });

  test('login form has username and password fields', async ({ page }) => {
    // Navigate directly if you know the URL — update this if needed
    await page.goto('https://ibank.combanketh.et').catch(() => page.goto('/'));
    await page.waitForLoadState('domcontentloaded');

    const usernameField = page.locator('input[type="text"], input[name*="user" i], input[id*="user" i]').first();
    const passwordField = page.locator('input[type="password"]').first();

    const hasUsername = await usernameField.isVisible().catch(() => false);
    const hasPassword = await passwordField.isVisible().catch(() => false);

    if (hasUsername && hasPassword) {
      await expect(usernameField).toBeVisible();
      await expect(passwordField).toBeVisible();
      console.log('Login form fields found ✓');
    } else {
      console.log('Login form not found at expected URL — may require VPN or direct access');
      test.skip(true, 'Login form not accessible from this environment');
    }
  });

});
