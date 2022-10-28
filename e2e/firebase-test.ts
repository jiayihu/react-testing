import { faker } from '@faker-js/faker';
import { Page, test as base } from '@playwright/test';

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/authenticate');

    const email = faker.internet.email();
    await page.getByRole('textbox', { name: /email/i }).fill(email);

    const password = faker.internet.password();
    await page.getByLabel(/password/i).fill(password);

    await page.getByRole('button', { name: /register/i }).click();

    await page.getByRole('heading', { name: /expenses/i });

    await use(page);

    await page.close();
  },
});

export { expect } from '@playwright/test';
