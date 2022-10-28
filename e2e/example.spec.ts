/* eslint-disable */

import { expect, test } from '@playwright/test';

test('homepage has Playwright in title and get started link linking to the intro page', async ({
  page,
}) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);

  // create a locator
  const getStarted = page.getByText('Get Started');

  // Expect an attribute "to be strictly equal" to the value.
  await expect(getStarted).toHaveAttribute('href', '/docs/intro');

  // Click the get started link.
  await getStarted.click();

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*intro/);
});

/**
 * const [count, setCount] = useState(0)
 * setCount(count => count + 1)
 * setCount(count => count + 1)
 *
 * render, React.render, setState, componentDidMount
 *
 *
 * useState, useEffect, useLayoutEffect, useMemo, useRef, useId, useTransition,
 * useSyncExternalStore,
 *
 * [1, 1]
 *
 * [count => count + 1, count => count + 1]
 * [0 => 0 + 1, 1 => 1 + 1]
 *
 * this.state = { count: 0 }
 *
 * this.setState({ count: this.state.count + 1 })
 * this.setState({ count: this.state.count + 1 })
 *
 * <div>{count}</div> // 1
 *
 * let pippo = 2;
 *
 * const button = cy.findByRole("button", { name: /add new account/ }).then($button => {
 *   cy.context.button = $button
 * })
 * const select = cy.findByRole("combobox", { name: /select a coountry/ })
 *
 * cy.get("@button")
 *
 * pippo = 4;
 *
 * [findByRoleCmd(buttonCmdThen), findByRoleCmd, (ctx) => ctx.button]
 *
 * expect(cy.get("button")).toHaveAttribute("disabled")
 *
 * button.
 */
