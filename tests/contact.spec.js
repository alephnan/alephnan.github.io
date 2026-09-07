import { test, expect } from './fixtures.js';

const endpoint = 'https://formsubmit.co/b1588a5c6cf6dbc7596769f7495eedfe';

async function fillContact(page) {
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('  Jane    Doe  ');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('jane@example.com');
  await page.getByRole('textbox', { name: 'Subject', exact: true }).fill('  Portfolio   inquiry  ');
  await page.getByRole('textbox', { name: 'Message', exact: true }).fill('Hello from the portfolio.  \n\n\nThank you!\u0007');
}

test('invalid contact input cannot submit', async ({ page }) => {
  let submitted = false;
  await page.route(endpoint, route => { submitted = true; return route.abort(); });
  await page.goto('/contact/');
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.locator('#name')).toBeFocused();
  await expect(page.locator('form:invalid')).toHaveCount(1);
  expect(submitted).toBe(false);
});

test('localhost submission sanitizes input and uses the generated success URL', async ({ page }) => {
  let submitted;
  await page.route(endpoint, async route => {
    submitted = route.request();
    await route.fulfill({ json: { success: true } });
  });
  await page.goto('/contact/');
  await fillContact(page);
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/thank-you/');
  expect(submitted.isNavigationRequest()).toBe(false);
  expect(submitted.headers().accept).toBe('application/json');
  const fields = await new Response(submitted.postDataBuffer(), {
    headers: { 'Content-Type': submitted.headers()['content-type'] }
  }).formData();
  expect(fields.get('name')).toBe('Jane Doe');
  expect(fields.get('subject')).toBe('Portfolio inquiry');
  expect(fields.get('message')).toBe('Hello from the portfolio.\r\n\r\nThank you!');
  expect(fields.get('_next')).toBe('http://127.0.0.1:4173/thank-you/');
  expect(fields.get('_captcha')).toBe('true');
  expect(fields.get('_honey')).toBe('');
});

test('localhost network failure displays the existing form error', async ({ page }) => {
  await page.goto('/contact/');
  await fillContact(page);
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.locator('#form-error')).toBeVisible();
  await expect(page).toHaveURL(/\/contact\/$/);
});

test('production hostname keeps native FormSubmit POST behavior', async ({ page }) => {
  // Serve the local build under a non-localhost origin without contacting that host.
  await page.route('http://portfolio.test/**', async route => {
    const response = await route.fetch({ url: route.request().url().replace('http://portfolio.test', 'http://127.0.0.1:4173') });
    if (response.headers()['content-type']?.includes('text/html')) {
      await route.fulfill({ response, body: (await response.text()).replaceAll('http://127.0.0.1:4173', 'http://portfolio.test') });
    } else await route.fulfill({ response });
  });
  let submitted;
  await page.route(endpoint, async route => {
    submitted = route.request();
    await route.fulfill({ contentType: 'text/html', body: '<p>Submission intercepted</p>' });
  });
  await page.goto('http://portfolio.test/contact/');
  await fillContact(page);
  await page.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByText('Submission intercepted')).toBeVisible();
  expect(submitted.isNavigationRequest()).toBe(true);
  expect(submitted.method()).toBe('POST');
  const fields = new URLSearchParams(submitted.postData());
  expect(fields.get('name')).toBe('Jane Doe');
  expect(fields.get('_next')).toBe('http://portfolio.test/thank-you/');
  expect(fields.get('_captcha')).toBe('true');
});
