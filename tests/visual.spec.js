import { test, expect, pages, routeFor } from './fixtures.js';
import { readFile } from 'node:fs/promises';

for (const name of pages) {
  test(`${name} appearance`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-07T12:00:00Z'));
    // Serve the test-only mask through an allowed stylesheet URL, respecting CSP.
    await page.route('**/assets/css/styles.css', async route => {
      const response = await route.fetch();
      await route.fulfill({ response, body: await response.text() + await readFile('tests/screenshot.css', 'utf8') });
    });
    await page.goto(routeFor(name));
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (const element of document.querySelectorAll('[data-reveal]')) {
        element.scrollIntoView();
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      for (const img of document.images) await img.decode();
      window.scrollTo(0, 0);
    });
    await expect(page.locator('[data-reveal]:not(.revealed)')).toHaveCount(0);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      animations: 'disabled'
    });
  });
}
