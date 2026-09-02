import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/phase1-verification.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', {open: 'never', outputFolder: 'playwright-report/phase1'}]],
  outputDir: 'test-results/phase1',
  preserveOutput: 'always',
  expect: {timeout: 15_000},
  use: {
    baseURL: 'http://127.0.0.1:3100',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    browserName: 'chromium',
    viewport: {width: 1440, height: 1000},
  },
  webServer: {
    command: 'npx vite --host 127.0.0.1 --port 3100 --strictPort',
    url: 'http://127.0.0.1:3100/test-showcase.html',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
