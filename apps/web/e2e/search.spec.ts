import { expect, test } from '@playwright/test';

// These tests require (app) layout which uses Wagmi hooks server-side.
// Skipped in CI until SSR hydration is fixed. Run locally with `pnpm dev`.
test.describe('Search Page', () => {
  test.fixme(!!process.env.CI, 'SSR WagmiProvider issue in standalone mode');

  test('displays search bar with query parameter', async ({ page }) => {
    await page.goto('/search?name=testdomain');
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toHaveValue('testdomain');
  });

  test('shows prompt when no name entered', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByText(/enter a name/i)).toBeVisible();
  });

  test('shows loading state during search', async ({ page }) => {
    await page.goto('/search?name=longdomainname');
    const result = page
      .locator('[data-testid="name-card"], [data-testid="availability-badge"]')
      .first();
    const loadingOrResult = page.getByText(/loading|searching|available|taken|reserved/i).first();
    await expect(result.or(loadingOrResult)).toBeVisible({ timeout: 15_000 });
  });

  test('search bar allows new search', async ({ page }) => {
    await page.goto('/search?name=test');
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.clear();
    await searchInput.fill('newsearch');
    await searchInput.press('Enter');
    await expect(page).toHaveURL(/name=newsearch/);
  });

  test('rejects names shorter than 3 characters', async ({ page }) => {
    await page.goto('/search?name=ab');
    const errorOrEmpty = page.getByText(/too short|at least 3|invalid|enter a name/i).first();
    await expect(errorOrEmpty).toBeVisible({ timeout: 10_000 });
  });
});
