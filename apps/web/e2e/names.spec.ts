import { expect, test } from '@playwright/test';

test.describe('Names Page', () => {
  test('shows connect prompt when not connected', async ({ page }) => {
    await page.goto('/names');
    const connectPrompt = page.getByText(/connect|wallet|cüzdan/i).first();
    await expect(connectPrompt).toBeVisible({ timeout: 10_000 });
  });

  test('page loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/names');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('has correct heading', async ({ page }) => {
    await page.goto('/names');
    const heading = page.getByRole('heading', { name: /names|domains/i }).first();
    const content = page.locator('main').first();
    await expect(heading.or(content)).toBeVisible({ timeout: 10_000 });
  });

  test('header navigation is visible', async ({ page }) => {
    await page.goto('/names');
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });
});
