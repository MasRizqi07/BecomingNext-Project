import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Page} from '@playwright/test';

import {REFLECTION_QUESTIONS} from '../../src/data/questions';

const ANSWERS = [
  'I worry that I will keep postponing meaningful work until the opportunity has passed.',
  'I wait for perfect clarity and then avoid beginning small experiments.',
  'I feel disconnected when I consume ideas all day but create nothing tangible.',
  'I would build useful products with a calm weekly rhythm and enough time for family.',
  'I am avoiding publishing the first deliberately small version of my portfolio.',
  'I want to become a reliable builder who learns openly and finishes useful work.',
  '6',
  'I want to create a sustainable independent product studio and commit to it.',
] as const;

async function expectNoWcagViolations(page: Page) {
  const accessibility = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(accessibility.violations).toEqual([]);
}

async function openEmulatorAccountForm(popup: Page) {
  await popup.waitForLoadState('networkidle');
  const addAccount = popup.getByRole('button', {name: /add new account/i});
  const emailInput = popup.locator('#email-input');

  await expect(async () => {
    if (!(await emailInput.isVisible())) await addAccount.click();
    await expect(emailInput).toBeVisible({timeout: 2_000});
  }).toPass({timeout: 15_000, intervals: [500, 1_000, 2_000]});
}

test('authenticated reflection can be created, resumed, deleted, and erased', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/');

  await page.getByRole('button', {name: /start reflection/i}).click();
  await expect(page.getByRole('dialog', {name: /your reflection is private/i})).toBeVisible();
  await expectNoWcagViolations(page);
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', {name: /continue with google/i}).click();
  const popup = await popupPromise;
  await openEmulatorAccountForm(popup);
  await popup.locator('#email-input').fill('builder@example.test');
  await popup.locator('#display-name-input').fill('Builder Test');
  await popup.locator('#sign-in').click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', {name: /welcome back/i})).toBeVisible();
  await page.getByRole('button', {name: 'Switch to light mode'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expectNoWcagViolations(page);
  await page.getByRole('button', {name: /begin first reflection|new reflection/i}).click();
  await page.getByRole('button', {name: /begin reflection/i}).click();
  await expect(page.getByRole('textbox', {name: /future are you most afraid/i})).toBeVisible();
  await expectNoWcagViolations(page);

  for (const [index, question] of REFLECTION_QUESTIONS.entries()) {
    const textbox = page.getByRole('textbox', {name: question.prompt});
    await expect(textbox).toBeVisible();
    const answer = ANSWERS[index]!;
    await textbox.fill(answer);
    await page
      .getByRole('button', {name: index === ANSWERS.length - 1 ? /review answers/i : /continue/i})
      .click();
  }

  await expect(page.getByRole('heading', {name: /review your reflection/i})).toBeVisible();
  await expectNoWcagViolations(page);
  await page.getByRole('button', {name: /create trajectory analysis/i}).click();

  await expect(page).toHaveURL(/\/results\/[0-9a-f-]{36}$/, {timeout: 60_000});
  await expect(page.getByText('The Quiet Builder', {exact: true})).toBeVisible();
  await expectNoWcagViolations(page);

  await page.getByRole('link', {name: /open habit check-in/i}).click();
  await expect(page.getByRole('heading', {name: /daily habit check-in/i})).toBeVisible();
  await page.getByRole('button', {name: 'Completed'}).first().click();
  await page.getByRole('button', {name: /complete check-in/i}).click();
  await expect(page.getByRole('heading', {name: /progress recorded/i})).toBeVisible();
  await expect(page.getByText(/saved securely/i)).toBeVisible();
  await expectNoWcagViolations(page);

  await page.getByRole('link', {name: /view full trajectory/i}).click();

  await page.getByRole('link', {name: /archive history/i}).click();
  await expect(page.getByRole('heading', {name: /reflection history/i})).toBeVisible();
  await expect(page.getByText('The Quiet Builder', {exact: true})).toBeVisible();

  await page.getByRole('button', {name: /delete reflection/i}).click();
  const deleteAnalysisDialog = page.getByRole('alertdialog', {name: /delete this analysis/i});
  await expect(deleteAnalysisDialog).toBeVisible();
  await expect(deleteAnalysisDialog.getByText(/other reflections remain untouched/i)).toBeVisible();
  await expectNoWcagViolations(page);
  await deleteAnalysisDialog.getByRole('button', {name: /^delete analysis$/i}).click();
  await expect(page.getByRole('heading', {name: /no archived reflections/i})).toBeVisible();

  await page.getByRole('link', {name: /account settings/i}).click();
  await expect(page.getByRole('heading', {name: /settings & privacy/i})).toBeVisible();
  await expectNoWcagViolations(page);
  await page.getByRole('button', {name: /delete account permanently/i}).click();
  await expect(page.getByRole('alertdialog', {name: /permanently delete account/i})).toBeVisible();
  await page.getByLabel(/type delete to confirm/i).fill('DELETE');
  await page.getByRole('button', {name: /delete forever/i}).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', {name: /future version/i})).toBeVisible();
});
