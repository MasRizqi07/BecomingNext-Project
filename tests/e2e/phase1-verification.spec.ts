import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';

test.describe('Phase 1 component evidence', () => {
  test('verifies tokens, primitives, keyboard behavior, timers, and visual evidence', async ({
    page,
  }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.emulateMedia({reducedMotion: 'reduce'});
    await page.goto('/test-showcase.html');
    await expect(page.getByRole('heading', {name: /phase 1 primitives showcase/i})).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('radio', {name: 'Dark'})).toHaveAttribute('aria-checked', 'true');

    await expect(page.locator('#section-radar svg.recharts-surface')).toBeVisible();
    await page.screenshot({
      path: testInfo.outputPath('full-showcase-dark.png'),
      fullPage: true,
      animations: 'disabled',
    });

    await page.getByRole('radio', {name: 'Light'}).click();
    await expect(page.locator('html')).toHaveClass(/light/);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('radio', {name: 'Light'})).toHaveAttribute('aria-checked', 'true');
    await page.screenshot({
      path: testInfo.outputPath('full-showcase-light.png'),
      fullPage: true,
      animations: 'disabled',
    });

    const lightAccessibility = await new AxeBuilder({page})
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(lightAccessibility.violations).toEqual([]);
    await page.locator('#section-buttons').screenshot({
      path: testInfo.outputPath('button-variants.png'),
      animations: 'disabled',
    });
    await page.locator('#section-cards').screenshot({
      path: testInfo.outputPath('card-variants.png'),
      animations: 'disabled',
    });
    await page.locator('#section-fields').screenshot({
      path: testInfo.outputPath('field-variants.png'),
      animations: 'disabled',
    });

    const interactiveCard = page.locator('#card-interactive');
    await interactiveCard.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status')).toContainText('Interactive card activated');
    await page.getByRole('button', {name: /close notification/i}).click();

    const scoreSeven = page.getByRole('radio', {name: /score 7 of 10/i});
    await scoreSeven.focus();
    await page.keyboard.press('ArrowRight');
    const scoreEight = page.getByRole('radio', {name: /score 8 of 10/i});
    await expect(scoreEight).toBeChecked();
    await expect(scoreEight).toBeFocused();

    const radarSection = page.locator('#section-radar');
    await expect(radarSection.locator('svg.recharts-surface')).toBeVisible();
    await radarSection.screenshot({
      path: testInfo.outputPath('radar-semantics.png'),
      animations: 'disabled',
    });

    await page.locator('#btn-trigger-toast').click();
    const toast = page.getByRole('status');
    await expect(toast).toContainText('Analysis exported');
    await toast.hover();
    await page.waitForTimeout(4200);
    await expect(toast).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(toast).toBeHidden({timeout: 4500});

    const dialogTrigger = page.locator('#btn-open-dialog');
    await dialogTrigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', {name: /delete reflection record/i});
    await expect(dialog).toBeVisible();
    await expect(page.locator('#btn-dialog-cancel')).toBeFocused();

    for (let index = 0; index < 6; index += 1) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(
        true,
      );
    }

    const dialogAccessibility = await new AxeBuilder({page})
      .include('dialog')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(dialogAccessibility.violations).toEqual([]);
    await page.screenshot({path: testInfo.outputPath('native-dialog.png')});

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(dialogTrigger).toBeFocused();

    await dialogTrigger.click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(4, 4);
    await expect(dialog).toBeHidden();
    await expect(dialogTrigger).toBeFocused();

    const accessibility = await new AxeBuilder({page})
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});
