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
    // Compare the original project collection against the original revision.
    // The new featured project and reordered grid have separate integration tests.
    if (name === 'projects' && !process.env.LEGACY_SITE) {
      await page.locator('.project-feature').filter({ has: page.getByRole('heading', { name: 'Beetle — Neural Cellular Automaton', exact: true }) }).evaluate(node => node.remove());
      await page.locator('.project-card').filter({ has: page.getByRole('heading', { name: 'Flowfield ‐ Strange Attractor Visualizer', exact: true }) }).evaluate(node => {
        node.classList.remove('project-card');
        node.classList.add('project-feature', 'corner-ticks');
        node.querySelector('img').removeAttribute('loading');
        const grid = node.closest('.projects-grid');
        grid.before(node);
      });
      await page.locator('.console-note').evaluate(node => { node.textContent = '7 repositories tracked'; });
    }
    await page.evaluate(() => document.fonts.ready);
    for (const element of await page.locator('[data-reveal]').all()) {
      await element.scrollIntoViewIfNeeded();
      await expect(element).toHaveClass(/revealed/);
    }
    await page.evaluate(async () => {
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
