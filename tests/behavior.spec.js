import { test, expect, routeFor } from './fixtures.js';

test('mobile navigation supports toggle, Escape, and outside clicks', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop');
  await page.goto(routeFor('index'));
  const toggle = page.getByRole('button', { name: 'Menu' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await page.locator('main').dispatchEvent('click');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('clock and particles initialize with normal motion', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-07T12:34:56Z'));
  await page.goto(routeFor('index'));
  await expect(page.locator('[data-utc-clock]')).toHaveText('12:34:56');
  await expect(page.locator('#current-year')).toHaveText('2026');
  await expect.poll(() => page.evaluate(() => window.tsParticles?.domItem(0)?.particles.count ?? 0)).toBeGreaterThan(0);
  await expect(page.locator('#particles-js canvas')).toBeVisible();
});
