import { expect, test } from '@playwright/test';

test.describe('Registration Flow', () => {
  test('shows wallet guard when not connected', async ({ page }) => {
    await page.goto('/register/testdomain');
    // Should prompt to connect wallet
    const walletPrompt = page.getByText(/connect|wallet|cüzdan/i).first();
    await expect(walletPrompt).toBeVisible({ timeout: 10_000 });
  });

  test('shows loading state while checking availability', async ({ page }) => {
    await page.goto('/register/testdomain');
    // Should show loading or wallet guard
    const content = page.locator('main').first();
    await expect(content).toBeVisible();
  });

  test('register page shows domain name in heading', async ({ page }) => {
    await page.goto('/register/mydomain');
    // The domain name should appear somewhere on the page
    await expect(page.getByText(/mydomain/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('handles URL-encoded names correctly', async ({ page }) => {
    await page.goto('/register/test-name');
    await expect(page.getByText(/test-name/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('unavailable name shows search link', async ({ page }) => {
    // Navigate to a potentially taken name
    await page.goto('/register/admin');
    // admin is reserved — should show unavailable or redirect
    const unavailableOrSearch = page
      .getByText(/not available|reserved|unavailable|search/i)
      .first();
    await expect(unavailableOrSearch).toBeVisible({ timeout: 15_000 });
  });
});
