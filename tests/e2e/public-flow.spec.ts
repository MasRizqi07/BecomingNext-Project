import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Page} from '@playwright/test';

async function waitForBrowserPaint(page: Page) {
  await page.evaluate(async () => {
    await Promise.allSettled(
      document
        .getAnimations()
        .filter((animation) => animation.playState === 'running')
        .map((animation) => animation.finished),
    );
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

test.beforeEach(async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
});

test('landing page communicates the product and exposes a safe demo', async ({page}) => {
  await page.goto('/');

  await expect(page.getByRole('heading', {name: /future version/i})).toBeVisible();
  await expect(page.getByRole('link', {name: /view a safe demo/i})).toBeVisible();
  await expect(page.getByRole('button', {name: /start reflection/i})).toBeEnabled();
  await waitForBrowserPaint(page);

  const accessibility = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('theme preference switches, persists, and remains accessible in light mode', async ({
  page,
}) => {
  await page.goto('/');

  const themeToggle = page.getByRole('button', {name: 'Switch to light mode'}).first();
  await expect(themeToggle).toBeVisible();
  await themeToggle.click();
  await expect(page.locator('html')).toHaveClass(/light/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await waitForBrowserPaint(page);

  const lightAccessibility = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(lightAccessibility.violations).toEqual([]);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', {name: 'Switch to dark mode'}).first().click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
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

test('public information and recovery routes remain accessible', async ({page}) => {
  const routes = [
    {path: '/how-it-works', heading: /eight prompts.*two paths/i},
    {path: '/privacy', heading: /privacy & ai boundaries/i},
    {path: '/a-route-that-does-not-exist', heading: /404/i},
  ];

  for (const route of routes) {
    await page.goto(route.path);
    await expect(page.getByRole('heading', {level: 1, name: route.heading})).toBeVisible();
    const accessibility = await new AxeBuilder({page})
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(accessibility.violations, route.path).toEqual([]);
  }
});

test('sign-in dialog is named, keyboard-contained, and restores focus', async ({page}) => {
  await page.goto('/');
  const trigger = page.getByRole('button', {name: /start reflection/i});
  await expect(trigger).toBeEnabled();
  await trigger.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', {name: /your reflection is private/i});
  await expect(dialog).toBeVisible();
  const accessibility = await new AxeBuilder({page})
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);

  for (let index = 0; index < 6; index += 1) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('mobile navigation isolates the page and restores its trigger', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');

  const trigger = page.getByRole('button', {name: /open navigation menu/i});
  await trigger.click();

  const drawer = page.getByRole('dialog', {name: /navigation menu/i});
  await expect(drawer).toBeVisible();
  await expect(page.locator('#main-content')).toHaveAttribute('inert', '');
  await expect(drawer.getByRole('button', {name: /close menu/i})).toBeFocused();

  const accessibility = await new AxeBuilder({page})
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(page.locator('#main-content')).not.toHaveAttribute('inert', '');
  await expect(trigger).toBeFocused();
});
