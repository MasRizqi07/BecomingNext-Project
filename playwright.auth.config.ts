import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e-auth',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', {open: 'never', outputFolder: 'playwright-report/auth'}]],
  outputDir: 'test-results/auth',
  preserveOutput: 'always',
  use: {
    baseURL: 'http://127.0.0.1:4174',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: {width: 1280, height: 900},
  },
  webServer: {
    command: 'vite build && vite preview --port=4174 --host=127.0.0.1',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
