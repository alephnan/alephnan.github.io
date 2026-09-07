import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

export function runZola(args) {
  const executable = process.env.ZOLA_BIN || 'zola';
  const expected = `zola ${readFileSync('.zola-version', 'utf8').trim()}`;
  const actual = execFileSync(executable, ['--version'], { encoding: 'utf8' }).trim();
  if (actual !== expected) throw new Error(`Expected ${expected}; found ${actual}. See README.md for setup.`);
  execFileSync(executable, args, { stdio: 'inherit' });
}
