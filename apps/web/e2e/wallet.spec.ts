import { expect, test } from '@playwright/test';

test.describe('Wallet Connection', () => {
  test.fixme(!!process.env.CI, 'SSR WagmiProvider issue in standalone mode');

  test('connect wallet button is visible in header', async ({ page }) => {
    await page.goto('/');
    const connectButton = page.getByRole('button', { name: /connect|wallet/i }).first();
    await expect(connectButton).toBeVisible();
  });

  test('clicking connect opens RainbowKit modal', async ({ page }) => {
    await page.goto('/');
    const connectButton = page.getByRole('button', { name: /connect|wallet/i }).first();
    await connectButton.click();

    // RainbowKit modal should appear
    const modal = page.locator('[data-rk], [role="dialog"], [aria-modal="true"]').first();
    await expect(modal).toBeVisible({ timeout: 5_000 });
  });

  test('RainbowKit modal shows wallet options', async ({ page }) => {
    await page.goto('/');
    const connectButton = page.getByRole('button', { name: /connect|wallet/i }).first();
    await connectButton.click();

    // Should see wallet options
    const walletOption = page.getByText(/metamask|walletconnect|coinbase|rainbow/i).first();
    await expect(walletOption).toBeVisible({ timeout: 5_000 });
  });

  test('modal can be closed', async ({ page }) => {
    await page.goto('/');
    const connectButton = page.getByRole('button', { name: /connect|wallet/i }).first();
    await connectButton.click();

    const modal = page.locator('[data-rk], [role="dialog"], [aria-modal="true"]').first();
    await expect(modal).toBeVisible({ timeout: 5_000 });

    // Close via escape or close button
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible({ timeout: 3_000 });
  });
});
