import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { test, expect, pages, routeFor } from './fixtures.js';

const root = resolve(process.env.SITE_ROOT || '.tools/test-site');

test('CSS, images, and the PDF remain byte-identical', async () => {
  const baseline = JSON.parse(await readFile('tests/asset-baseline.json', 'utf8'));
  for (const [file, hash] of Object.entries(baseline)) {
    expect(createHash('sha256').update(await readFile(resolve(root, file))).digest('hex'), file).toBe(hash);
  }
});

test('generated pages preserve content and metadata and have valid local references', async ({ page }) => {
  for (const name of pages) {
    await page.goto(routeFor(name));
    const actual = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
      const parts = [];
      while (walker.nextNode()) {
        const text = walker.currentNode.parentElement.matches('[data-utc-clock]')
          ? '--:--:--'
          : walker.currentNode.textContent.trim().replace(/\s+/g, ' ');
        if (text) parts.push(text);
      }
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]').content,
        text: parts.join(' '),
        ids: [...document.querySelectorAll('[id]')].map(node => node.id),
        refs: [...document.querySelectorAll('[href], [src]')].map(node => node.getAttribute('href') || node.getAttribute('src'))
      };
    });
    const snapshot = { title: actual.title, description: actual.description, text: actual.text };
    expect(JSON.stringify(snapshot, null, 2) + '\n').toMatchSnapshot(`${name}.json`);
    expect(new Set(actual.ids).size, `${name}: duplicate ids`).toBe(actual.ids.length);
    for (const ref of actual.refs) {
      const url = new URL(ref, page.url());
      if (url.origin !== 'http://127.0.0.1:4173') continue;
      let file = resolve(root, `.${decodeURIComponent(url.pathname)}`);
      const info = await stat(file);
      if (info.isDirectory()) file = resolve(file, 'index.html');
      const bytes = await readFile(file);
      if (url.hash) {
        const ids = await page.evaluate(html => [...new DOMParser().parseFromString(html, 'text/html').querySelectorAll('[id]')].map(node => node.id), bytes.toString());
        expect(ids, `${name}: ${ref}`).toContain(decodeURIComponent(url.hash.slice(1)));
      }
    }
  }
});
