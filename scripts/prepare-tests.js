import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { runZola } from './zola.js';

const revision = readFileSync('tests/visual-reference.txt', 'utf8').trim();
if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Visual reference must be a full Git commit SHA.');
try {
  execFileSync('git', ['cat-file', '-e', `${revision}^{commit}`], { stdio: 'pipe' });
} catch {
  throw new Error(`Visual reference ${revision} is unavailable. Use a full Git checkout; for a shallow clone, run git fetch --unshallow.`);
}

runZola(['build', '--base-url', 'http://127.0.0.1:4173', '--output-dir', '.tools/test-site', '--force']);

// Rebuild expectations from the original source on every run, never from the candidate site.
const root = resolve('.tools/visual-reference');
const archive = resolve('.tools/visual-reference.tar');
rmSync(root, { recursive: true, force: true });
rmSync('.tools/visual-baselines', { recursive: true, force: true });
mkdirSync(root, { recursive: true });
try {
  execFileSync('git', ['archive', '--format=tar', `--output=${archive}`, revision], { stdio: 'inherit' });
  execFileSync('tar', ['-xf', archive, '-C', root], { stdio: 'inherit' });
} finally {
  rmSync(archive, { force: true });
}

execFileSync(process.execPath, [
  'node_modules/@playwright/test/cli.js', 'test', 'tests/visual.spec.js', '--update-snapshots=all'
], {
  stdio: 'inherit',
  env: { ...process.env, LEGACY_SITE: '1', SITE_ROOT: root }
});
