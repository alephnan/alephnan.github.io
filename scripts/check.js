import { runZola } from './zola.js';

runZola(['check', '--skip-external-links']);
runZola(['build']);
