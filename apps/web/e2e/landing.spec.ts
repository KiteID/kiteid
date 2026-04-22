import { expect, test } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero with KiteID wordmark and search bar', async ({ page }) => {
    // Wordmark contains "Kite" and "ID" split across spans
    await expect(page.getByText('Kite', { exact: false }).first()).toBeVisible();
    // Search bar — match by placeholder (contains "kite")
    const searchInput = page.locator('input[placeholder*="kite" i]').first();
    await expect(searchInput).toBeVisible();
  });

  test('search bar is discoverable', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="kite" i]').first();
    await expect(searchInput).toBeVisible();
    // AutoFocus only reliable in headed mode
    if (!process.env.CI) {
      await expect(searchInput).toBeFocused();
    }
  });

  test('search input accepts text and navigates', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="kite" i]').first();
    await searchInput.fill('myname');
    await searchInput.press('Enter');
    await page.waitForURL(/\/search/, { timeout: 5_000 }).catch(() => {});
    expect(page.url()).toContain('/search');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/KiteID/i);
  });

  test('navigation link to /names exists', async ({ page }) => {
    const namesLink = page.getByRole('link', { name: /names/i }).first();
    await expect(namesLink).toBeVisible();
  });
});
