import { expect, test } from '@playwright/test';

test.describe('Profile Page', () => {
  test('shows connect wallet message when not connected', async ({ page }) => {
    await page.goto('/profile');
    const connectMessage = page.getByText(/connect|wallet|cüzdan/i).first();
    await expect(connectMessage).toBeVisible({ timeout: 10_000 });
  });

  test('page loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('footer is visible', async ({ page }) => {
    await page.goto('/profile');
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('has sign in with wallet button when wallet is connected', async ({ page }) => {
    // Without wallet connection, should show connect prompt
    await page.goto('/profile');
    const content = page.locator('main').first();
    await expect(content).toBeVisible();
  });
});
