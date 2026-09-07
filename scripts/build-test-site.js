import { runZola } from './zola.js';

if (!process.env.LEGACY_SITE) {
  runZola(['build', '--base-url', 'http://127.0.0.1:4173', '--output-dir', '.tools/test-site', '--force']);
}
