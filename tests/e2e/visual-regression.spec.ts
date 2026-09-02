import {expect, test} from '@playwright/test';

test.skip(
  process.platform !== 'win32',
  'Visual baselines are generated and compared in the Windows CI environment.',
);

test('key public screens retain their approved visual hierarchy', async ({browserName, page}) => {
  test.skip(browserName !== 'chromium', 'Canonical visual baselines use Chromium.');
  await page.emulateMedia({reducedMotion: 'reduce'});

  await page.goto('/');
  await expect(page).toHaveScreenshot('landing.png', {
    animations: 'disabled',
    fullPage: true,
    maxDiffPixelRatio: 0.002,
  });

  await page.goto('/demo');
  await expect(page.getByText('The Quiet Builder', {exact: true})).toBeVisible({timeout: 15_000});
  await expect(page.locator('main svg.recharts-surface')).toBeVisible({timeout: 15_000});
  await expect(page.getByRole('main')).toHaveScreenshot('demo-result.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.002,
    timeout: 15_000,
  });
});
