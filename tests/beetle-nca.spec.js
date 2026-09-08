import { test, expect } from './fixtures.js';

const route = '/projects/beetle-nca/';

test('the R&D Index opens the case study in the same site and tab', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/projects/');
  await expect(page.locator('.console-note')).toHaveText('8 projects tracked');
  const card = page.locator('.project-feature').filter({ has: page.getByRole('heading', { name: 'Beetle — Neural Cellular Automaton', exact: true }) });
  await expect(page.locator('.project-feature')).toHaveCount(1);
  await expect(card.getByRole('link', { name: 'Repository' })).toHaveAttribute('href', 'https://github.com/alephnan/beetle-nca');
  const gridCards = page.locator('.projects-grid .project-card');
  await expect(gridCards.nth(0).getByRole('heading')).toHaveText('Flowfield ‐ Strange Attractor Visualizer');
  await expect(gridCards.nth(1).getByRole('heading')).toHaveText('MCP Virus Total Server');
  const featuredBox = await card.boundingBox();
  const flowfieldBox = await gridCards.nth(0).boundingBox();
  const virusTotalBox = await gridCards.nth(1).boundingBox();
  expect(flowfieldBox.y).toBeGreaterThanOrEqual(featuredBox.y + featuredBox.height);
  if (page.viewportSize().width > 992) {
    expect(virusTotalBox.y).toBeCloseTo(flowfieldBox.y, 0);
    expect(virusTotalBox.x).toBeGreaterThan(flowfieldBox.x);
  } else {
    expect(virusTotalBox.y).toBeGreaterThan(flowfieldBox.y);
  }
  await card.locator('img').evaluate(image => image.decode());
  await expect(card.locator('img')).toHaveAccessibleName(/Concept illustration/);
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: testInfo.outputPath('beetle-project-card.png'), animations: 'disabled' });
  await page.evaluate(async () => {
    for (const image of document.images) {
      image.loading = 'eager';
      await image.decode();
    }
    await document.fonts.ready;
    window.scrollTo(0, 0);
  });
  await page.screenshot({ path: testInfo.outputPath('projects-page.png'), fullPage: true, animations: 'disabled' });
  const link = card.getByRole('link', { name: 'Case Study' });
  await expect(link).toHaveAttribute('href', `http://127.0.0.1:4173${route}`);
  await expect(link).not.toHaveAttribute('target', '_blank');
  await link.click();
  await expect(page).toHaveURL(`http://127.0.0.1:4173${route}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Beetle NCA');
  await expect(page.locator('.site-header nav [aria-current="page"]')).toHaveText('Projects');
  await expect(page.locator('.site-footer .footer-name')).toHaveText('Rafael Guevara Hernández');
  await page.getByRole('link', { name: 'Back to R&D Index', exact: false }).click();
  await expect(page).toHaveURL('http://127.0.0.1:4173/projects/');
});

test('the specimen switches between the trained state and original target', async ({ page }) => {
  await page.goto(route);
  const target = page.getByRole('button', { name: 'Target', exact: true });
  const grown = page.getByRole('button', { name: 'Grown', exact: true });
  await target.click();
  await expect(target).toHaveAttribute('aria-pressed', 'true');
  await expect(grown).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#nca-specimen-image')).toHaveAttribute('src', /\/target\.png$/);
  await expect(page.locator('#nca-state-label')).toHaveText('Training target');
  await grown.click();
  await expect(page.locator('#nca-specimen-image')).toHaveAttribute('src', /\/grown\.png$/);
  await expect(page.locator('#nca-state-detail')).toContainText('seed 30012');
});

test('recording tabs support keyboard navigation and pause hidden playback', async ({ page }) => {
  await page.goto(route);
  const growth = page.getByRole('tab', { name: '01 / Growth' });
  const repair = page.getByRole('tab', { name: '02 / Regeneration' });
  await growth.click();
  await page.locator('#nca-panel-growth video').evaluate(video => video.play());
  await growth.press('ArrowRight');
  await expect(repair).toBeFocused();
  await expect(repair).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#nca-panel-growth')).toBeHidden();
  await expect(page.locator('#nca-panel-repair')).toBeVisible();
  expect(await page.locator('#nca-panel-growth video').evaluate(video => video.paused)).toBe(true);
  await repair.press('Home');
  await expect(growth).toBeFocused();
  await expect(page.locator('#nca-panel-growth')).toBeVisible();
});

test('charts agree with the downloadable held-out evaluation', async ({ page, request }) => {
  await page.goto(route);
  const report = await (await request.get('/assets/projects/beetle-nca/evaluation.json')).json();
  await expect(page.locator('#nca-growth-chart circle')).toHaveCount(report.growth.trials);
  await expect(page.locator('.nca-repair-cell')).toHaveCount(report.repair.trials);
  await expect(page.locator('.nca-repair-cell.is-failed')).toHaveCount(report.repair.trials - report.repair.successes);
  await expect(page.locator('#nca-growth-chart svg')).toHaveAccessibleName(/All 16 growth trials exceed the 0.80 IoU threshold/);
  const colors = await page.evaluate(() => ({
    actual: getComputedStyle(document.querySelector('#nca-growth-chart circle')).fill,
    expected: getComputedStyle(document.querySelector('.nca-hero-copy h2 span')).color
  }));
  expect(colors.actual).toBe(colors.expected);
});

test('the case study stays within the viewport and loads its local assets', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(route);
  await page.evaluate(async () => {
    for (const image of document.images) {
      image.loading = 'eager';
      await image.decode();
    }
    await document.fonts.ready;
  });
  const { width } = page.viewportSize();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  expect(await page.evaluate(() => [...document.querySelectorAll('[id]')].length === new Set([...document.querySelectorAll('[id]')].map(node => node.id)).size)).toBe(true);
  await expect(page.locator('.site-header')).toBeVisible();
  await expect(page.locator('#particles-js canvas')).toHaveCount(0);
  await expect(page).toHaveTitle('Beetle NCA — Rafael Guevara Hernández');
  expect(errors).toEqual([]);
  // Review artifacts only; existing page comparisons retain their original baselines.
  await page.screenshot({ path: testInfo.outputPath('beetle-case-study.png'), fullPage: true, animations: 'disabled' });
});

test('the experiment is a valid download and the command can be copied', async ({ page, request }) => {
  const response = await request.get('/assets/projects/beetle-nca/experiment.zip');
  expect(response.ok()).toBe(true);
  expect((await response.body()).subarray(0, 4).toString('hex')).toBe('504b0304');
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(route);
  const command = await page.locator('#nca-command').textContent();
  await expect(page.locator('#reproduce').getByRole('link', { name: 'Repository' })).toHaveAttribute('href', 'https://github.com/alephnan/beetle-nca');
  await page.getByRole('button', { name: 'Copy', exact: true }).click();
  await expect(page.locator('#nca-copy-status')).toHaveText('Evaluation command copied to clipboard.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(command.trim());
});

test('without JavaScript the evidence and both recordings remain reachable', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.route('https://fonts.googleapis.com/**', route => route.abort());
  await context.route('https://fonts.gstatic.com/**', route => route.abort());
  await context.route('https://cdn.jsdelivr.net/**', route => route.abort());
  const page = await context.newPage();
  await page.goto(`${baseURL}${route}`);
  await expect(page.locator('.nca-metrics')).toContainText('81.25');
  await expect(page.locator('noscript a')).toHaveAttribute('href', /\/regeneration\.mp4$/);
  await expect(page.getByRole('link', { name: 'Download experiment' })).toBeVisible();
  await context.close();
});
