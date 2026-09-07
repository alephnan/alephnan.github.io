import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

process.env.FONTCONFIG_FILE = resolve('tests/fontconfig.conf');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  snapshotPathTemplate: '{testDir}/snapshots/{projectName}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixels: 0 } },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'dark',
    deviceScaleFactor: 1,
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'mobile', testMatch: ['**/visual.spec.js', '**/behavior.spec.js'], use: { viewport: { width: 390, height: 844 } } },
    { name: 'tablet', testMatch: ['**/visual.spec.js', '**/behavior.spec.js'], use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } }
  ],
  webServer: {
    command: 'node tests/server.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false
  }
});
