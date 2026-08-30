import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
});

test('landing page communicates the product and exposes a safe demo', async ({page}) => {
  await page.goto('/');

  await expect(page.getByRole('heading', {name: /future version/i})).toBeVisible();
  await expect(page.getByRole('link', {name: /view a safe demo/i})).toBeVisible();

  const accessibility = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('demo result is complete and all public actions are reachable', async ({page}) => {
  await page.goto('/demo');

  await expect(page.getByRole('heading', {name: /evolution of/i})).toBeVisible();
  await expect(page.getByRole('region', {name: /two possible paths/i})).toBeVisible();
  await expect(page.getByText('The Quiet Builder', {exact: true})).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', {name: /download letter/i}).click();
  await expect((await downloadPromise).suggestedFilename()).toBe('becoming-future-letter.txt');
  await expect(page.getByRole('link', {name: /create my own/i})).toBeVisible();

  const accessibility = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(accessibility.violations).toEqual([]);
});
