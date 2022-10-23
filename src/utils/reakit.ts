const buttonInputTypes = ['button', 'color', 'file', 'image', 'reset', 'submit'];

export function isButton(element: Element): element is HTMLButtonElement | HTMLInputElement {
  if (element.tagName === 'BUTTON') return true;
  if (element.tagName === 'INPUT') {
    const input = element as HTMLInputElement;
    return buttonInputTypes.indexOf(input.type) !== -1;
  }
  return false;
}

const selector =
  "input:not([type='hidden']):not([disabled]), select:not([disabled]), " +
  'textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], ' +
  'iframe, object, embed, area[href], audio[controls], video[controls], ' +
  "[contenteditable]:not([contenteditable='false'])";

export function isFocusable(element: Element): boolean {
  return element.matches(selector);
}

function hasNegativeTabIndex(element: Element) {
  const tabIndex = parseInt(element.getAttribute('tabindex') || '0', 10);
  return tabIndex < 0;
}

export function isTabbable(element: Element): boolean {
  return isFocusable(element) && !hasNegativeTabIndex(element);
}

export function getAllTabbableIn<T extends Element>(container: T, fallbackToFocusable?: boolean) {
  const allFocusable = Array.from(container.querySelectorAll<T>(selector));
  const allTabbable = allFocusable.filter(isTabbable);

  if (isTabbable(container)) {
    allTabbable.unshift(container);
  }

  if (!allTabbable.length && fallbackToFocusable) {
    return allFocusable;
  }
  return allTabbable;
}

export function getFirstTabbableIn<T extends Element>(
  container: T,
  fallbackToFocusable?: boolean,
): T | null {
  const [first] = getAllTabbableIn(container, fallbackToFocusable);
  return first || null;
}
