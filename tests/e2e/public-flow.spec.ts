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

test('theme toggle switches between dark and light modes seamlessly', async ({page}) => {
  await page.goto('/');

  // Find theme toggle button (first instance in header)
  const themeToggle = page.getByRole('button', {name: /switch to (light|dark) mode/i}).first();
  await expect(themeToggle).toBeVisible();

  // Toggle to light mode
  await themeToggle.click();
  await expect(page.locator('html')).toHaveClass(/light/);

  // Check light mode accessibility
  const lightA11y = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(lightA11y.violations).toEqual([]);

  // Toggle back to dark mode
  await themeToggle.click();
  await expect(page.locator('html')).toHaveClass(/dark/);
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
