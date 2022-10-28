/* eslint-disable */

import { faker } from '@faker-js/faker';
import { test } from '@playwright/test';

test('should register the user', async ({ page }) => {
  await page.goto('/authenticate');

  const email = faker.internet.email();
  await page.getByRole('textbox', { name: /email/i }).fill(email);

  const password = faker.internet.password();
  await page.getByLabel(/password/i).fill(password);

  await page.getByRole('button', { name: /register/i }).click();
});
