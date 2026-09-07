import { test, expect, pages, routeFor } from './fixtures.js';

test('native pages, index.html, and legacy redirects remain accessible', async ({ page }) => {
  for (const name of pages.filter(name => name !== '404')) {
    const response = await page.goto(routeFor(name));
    expect(response.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    const active = page.locator('.nav-links [aria-current="page"]');
    await expect(active).toHaveCount(name === 'thank-you' ? 0 : 1);
    if (name !== 'thank-you') await expect(active).toHaveAttribute('href', `http://127.0.0.1:4173${routeFor(name)}`);
    await page.goto(`/${name}.html`);
    await expect(page).toHaveURL(name === 'index' ? /\/index\.html$/ : new RegExp(`/${name}/$`));
    await expect(page.locator('main h1')).toBeVisible();
  }
});

test('legacy resume links preserve their fragment', async ({ page }) => {
  await page.goto('/resume.html#experience');
  await expect(page).toHaveURL(/\/resume\/#experience$/);
  await expect(page.locator('#experience')).toBeInViewport();
});

test('nested unknown URLs use the styled 404 with working assets and navigation', async ({ page }) => {
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  const response = await page.goto('/unknown/nested/page');
  expect(response.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(10, 20, 31)');
  await page.getByRole('link', { name: 'Return to Index' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  expect(failures).toEqual([]);
});

test('PDF export keeps its original filename and content', async ({ page }) => {
  await page.goto('/resume/');
  const pending = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Export PDF' }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('Rafael_Guevara_Resume.pdf');
  expect(await download.failure()).toBeNull();
});
