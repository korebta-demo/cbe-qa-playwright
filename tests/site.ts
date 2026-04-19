import type { Page, Response } from '@playwright/test';

/**
 * Public site entry path (must match how the bank exposes the main page).
 * Origin comes from `baseURL` in playwright.config.ts.
 */
export const homePath = '/home';

/**
 * Opens /home with short retries when the edge returns 5xx (transient 502/503).
 */
export async function gotoPublicHome(page: Page): Promise<Response | null> {
  let last: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    last = await page.goto(homePath, { waitUntil: 'domcontentloaded' });
    const status = last?.status() ?? 0;
    if (status > 0 && status < 500) return last;
    await page.waitForTimeout(1500 * (attempt + 1));
  }
  return last;
}
