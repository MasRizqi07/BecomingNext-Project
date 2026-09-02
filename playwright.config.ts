import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: '**/phase1-verification.spec.ts',
  fullyParallel: true,
  workers: 2,
  timeout: 60_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', {open: 'never'}]],
  expect: {timeout: 15_000},
  use: {
    baseURL: 'http://127.0.0.1:4173',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {browserName: 'chromium', viewport: {width: 1440, height: 1000}},
    },
    {
      name: 'chromium-mobile',
      use: {browserName: 'chromium', viewport: {width: 390, height: 844}, hasTouch: true},
    },
    {
      name: 'firefox-desktop',
      use: {browserName: 'firefox', viewport: {width: 1440, height: 1000}},
    },
    {
      name: 'firefox-mobile',
      use: {browserName: 'firefox', viewport: {width: 390, height: 844}, hasTouch: true},
    },
    {
      name: 'webkit-desktop',
      use: {browserName: 'webkit', viewport: {width: 1440, height: 1000}},
    },
    {
      name: 'webkit-mobile',
      use: {browserName: 'webkit', viewport: {width: 390, height: 844}, hasTouch: true},
    },
  ],
  webServer: {
    command: 'npm run build:web && npm run preview',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
