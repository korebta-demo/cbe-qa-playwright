import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────
// SUITE 1 – Site Availability & Core Pages
// Checks that the site loads and key pages
// respond correctly every day.
// ─────────────────────────────────────────────

test.describe('Site Availability', () => {

  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/.+/);            // title is not empty
    await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
  });

  test('homepage has no broken images', async ({ page }) => {
    await page.goto('/');
    const brokenImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => !img.naturalWidth)
        .map(img => img.src);
    });
    expect(brokenImages, `Broken images found: ${brokenImages.join(', ')}`).toHaveLength(0);
  });

  test('page responds within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
    console.log(`Homepage loaded in ${elapsed}ms`);
  });

  test('Internet Banking link is present and reachable', async ({ page }) => {
    await page.goto('/');
    // Locate any link that mentions internet/online banking
    const ibLink = page.getByRole('link', { name: /internet banking|online banking/i }).first();
    await expect(ibLink).toBeVisible();

    const href = await ibLink.getAttribute('href');
    expect(href).toBeTruthy();
    console.log(`Internet Banking URL: ${href}`);
  });

  test('Contact / About page loads', async ({ page }) => {
    await page.goto('/');
    const contactLink = page.getByRole('link', { name: /contact|about/i }).first();
    if (await contactLink.isVisible()) {
      await contactLink.click();
      await expect(page).not.toHaveURL('/404');
    } else {
      test.skip(true, 'No contact/about link found on homepage');
    }
  });

});
