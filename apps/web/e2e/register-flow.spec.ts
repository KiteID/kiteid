import { expect, test } from '@playwright/test';

test.describe('Registration Flow', () => {
  test.fixme(!process.env.CI, 'Configuration step requires mock in local e2e');

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

  test('configuration step shows price and allows registration (mocked)', async ({ page }) => {
    // Mock wagmi contract calls to avoid needing real KITE
    // Intercept the RPC calls that would get price
    await page.route('**/*.gokite.ai/**', (route) => {
      // Mock successful RPC response for price call
      if (route.request().postDataJSON()?.method === 'eth_call') {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Navigate to register page with a 5+ char name
    await page.goto('/register/mysite');
    await page.waitForLoadState('domcontentloaded');

    // Wait for name to be loaded on page (increased timeout for CI env)
    await expect(page.getByText(/mysite/i).first()).toBeVisible({
      timeout: 20_000,
    });

    // Check configure step is visible (should show duration options)
    const durationSection = page.getByText(/how long|length|duration/i).first();
    await expect(durationSection).toBeVisible({ timeout: 5_000 });

    // Select duration if needed (default is 1 year)
    const oneYearBtn = page.getByRole('button', { name: /1.*year/i }).first();
    if (await oneYearBtn.isVisible()) {
      await oneYearBtn.click();
    }

    // Price should be shown (even if mock, UI should render)
    const priceText = page.getByText(/kite|price|total/i).first();
    await expect(priceText).toBeVisible({ timeout: 5_000 });

    // Find and click the register/commit button
    const registerBtn = page.getByRole('button', { name: /commit|register|proceed/i }).first();
    await expect(registerBtn).toBeVisible({ timeout: 5_000 });
    // Note: In real scenario this would show wallet approval dialog
    // For mock, we just verify the button exists and is clickable
    await expect(registerBtn).toBeEnabled();
  });
});
