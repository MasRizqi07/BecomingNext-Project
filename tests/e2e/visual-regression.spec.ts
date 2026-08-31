import {expect, test} from '@playwright/test';

test('key public screens retain their approved visual hierarchy', async ({browserName, page}) => {
  test.skip(browserName !== 'chromium', 'Canonical visual baselines use Chromium.');
  await page.emulateMedia({reducedMotion: 'reduce'});

  await page.goto('/');
  await expect(page).toHaveScreenshot('landing-dark.png', {
    animations: 'disabled',
    fullPage: true,
  });

  await page.getByRole('button', {name: /switch to light mode/i}).click();
  await expect(page).toHaveScreenshot('landing-light.png', {
    animations: 'disabled',
    fullPage: true,
  });

  await page.goto('/demo');
  await expect(page.getByRole('heading', {name: /quiet builder/i})).toBeVisible();
  await expect(page).toHaveScreenshot('demo-result.png', {
    animations: 'disabled',
    fullPage: true,
  });
});
