import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  { path: '/', name: 'Landing' },
  { path: '/search?name=alice', name: 'Search' },
  { path: '/names', name: 'My Names' },
  { path: '/activity', name: 'Activity' },
  { path: '/profile', name: 'Profile' },
  { path: '/about', name: 'About' },
  { path: '/ecosystem', name: 'Ecosystem' },
];

for (const { path, name } of PAGES) {
  test(`${name} page has no critical a11y violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .exclude('[data-radix-popper-content-wrapper]')
      .analyze();

    const critical = results.violations.filter((v) => v.impact === 'critical');
    const serious = results.violations.filter((v) => v.impact === 'serious');

    if (critical.length + serious.length > 0) {
      const report = [...critical, ...serious]
        .map((v) => `[${v.impact}] ${v.id}: ${v.description}\n  ${v.helpUrl}`)
        .join('\n');
      console.error(`A11y violations on ${path}:\n${report}`);
    }

    expect(critical, 'Critical a11y violations found').toHaveLength(0);
    expect(serious, 'Serious a11y violations found').toHaveLength(0);
  });
}
