/**
 * Server nodejs json-server
 * Database vero => DevOps
 * Firebase
 *
 * beforeEach
 * Database REST => playwright.request
 *
 * test("Should add an account")
 */

/* eslint-disable */

import { expect, test } from './firebase-test';

test.describe.configure({ mode: 'serial' });

/**
 * beforeEach(() => cy.login())
 */

test('should link a new institution account', async ({ authenticatedPage }) => {
  await authenticatedPage.getByRole('button', { name: /accounts/i }).click();

  await authenticatedPage.getByRole('button', { name: /add new account/i }).click();

  await authenticatedPage.getByRole('combobox', { name: /select a country/i }).selectOption('it');

  await authenticatedPage
    .getByRole('list', { name: /institutions/i })
    .getByRole('button')
    .first()
    .click();

  await expect(authenticatedPage).toHaveURL(/requisition/);

  await expect(authenticatedPage.getByText(/accounts successfully connected/i)).toBeVisible();

  await expect(authenticatedPage).toHaveScreenshot();
});
