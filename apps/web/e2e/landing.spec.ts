import { expect, test } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero section with branding', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /identity on kite ai/i })).toBeVisible();
    await expect(
      page
        .locator(
          '[data-testid="search-bar"], input[placeholder*="search" i], input[placeholder*="name" i]',
        )
        .first(),
    ).toBeVisible();
  });

  test('search bar is auto-focused', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeFocused();
  });

  test('stats section displays correctly', async ({ page }) => {
    await expect(page.getByText(/names available/i)).toBeVisible();
    await expect(page.getByText(/block time/i)).toBeVisible();
    await expect(page.getByText(/gas cost/i)).toBeVisible();
  });

  test('search input accepts text and submits', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('myname');
    await searchInput.press('Enter');
    // Navigation happens — URL should change (page may SSR-error in CI)
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
