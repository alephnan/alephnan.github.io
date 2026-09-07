import { test, expect } from './fixtures.js';

async function expectColumns(page, selector, columns) {
  const first = await page.locator(selector).nth(0).boundingBox();
  const second = await page.locator(selector).nth(1).boundingBox();
  if (columns === 1) {
    expect(second.y).toBeGreaterThan(first.y);
    expect(second.x).toBeCloseTo(first.x, 0);
  } else {
    expect(second.x).toBeGreaterThan(first.x);
    expect(second.y).toBeCloseTo(first.y, 0);
  }
}

for (const width of [639, 640, 641, 767, 768, 769, 991, 992, 993]) {
  test(`layouts remain intact at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    // Reveal transforms are removed through the site's own accessibility preference.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const route of ['/', '/projects/', '/certifications/', '/contact/', '/resume/']) {
      await page.goto(route);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (route === '/') {
        await expectColumns(page, '.module-card', width <= 992 ? 1 : 3);
        await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ visible: width <= 768 });
      } else if (route === '/projects/') {
        await expectColumns(page, '.projects-grid .project-card', width <= 992 ? 1 : 2);
      } else if (route === '/certifications/') {
        await expectColumns(page, '.cert-card', width <= 768 ? 1 : 2);
      } else if (route === '/contact/') {
        await expectColumns(page, '.contact-grid > div', width <= 992 ? 1 : 2);
      } else {
        await expect(page.locator('.resume-rail')).toBeVisible({ visible: width > 992 });
      }
    }
  });
}
