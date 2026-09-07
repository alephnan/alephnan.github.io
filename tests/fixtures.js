import { test as base, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

export const pages = ['index', 'resume', 'projects', 'certifications', 'contact', '404', 'thank-you'];
export function routeFor(name) {
  return process.env.LEGACY_SITE || name === '404'
    ? `/${name}.html`
    : name === 'index' ? '/' : `/${name}/`;
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('https://cdn.jsdelivr.net/npm/tsparticles@2.12.0/tsparticles.bundle.min.js', route =>
      route.fulfill({ path: 'node_modules/tsparticles/tsparticles.bundle.min.js', contentType: 'text/javascript' }));
    await page.route('https://fonts.googleapis.com/**', async route =>
      route.fulfill({ body: await readFile('tests/fonts/jetbrains.css'), contentType: 'text/css' }));
    await page.route('https://fonts.gstatic.com/**', route =>
      route.fulfill({ path: `tests/fonts/${new URL(route.request().url()).pathname.split('/').pop()}`, contentType: 'font/ttf' }));
    // Every submission must be explicitly mocked by its test.
    await page.route('https://formsubmit.co/**', route => route.abort());
    await use(page);
  }
});

export { expect };
