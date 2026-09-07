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

test('scroll reveals and hover treatment still work', async ({ page }) => {
  await page.goto(routeFor('projects'));
  const last = page.locator('[data-reveal]').last();
  await expect(last).not.toHaveClass(/revealed/);
  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveClass(/revealed/);
  await last.hover();
  await expect(last).toHaveCSS('border-top-color', 'rgb(26, 188, 156)');
});

test('reduced motion keeps content visible without particles', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(routeFor('index'));
  await expect(page.locator('#particles-js canvas')).toHaveCount(0);
  await expect(page.locator('.typing-text')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.ticker-track')).toHaveCSS('animation-name', 'none');
  for (const element of await page.locator('[data-reveal]').all()) {
    await expect(element).toHaveCSS('opacity', '1');
  }
});

test('keyboard users can skip navigation and see focus', async ({ page }) => {
  await page.goto(routeFor('index'));
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('resume print view keeps the document and removes navigation', async ({ page }) => {
  await page.goto(routeFor('resume'));
  await expect(page.locator('.resume-sheet')).toHaveClass(/revealed/);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('.resume-sheet')).toBeVisible();
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.site-footer')).toBeHidden();
  await expect(page.locator('.resume-rail')).toBeHidden();
  await expect(page.locator('.resume-name')).toHaveCSS('color', 'rgb(0, 0, 0)');
});
