import { omit } from 'lodash';
import {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Box, BoxProps } from 'theme-ui';
import { useMergeRef } from '../../misc/useMergeRef';

function isNativeTabbable(element: Element) {
  return ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'A'].includes(element.tagName);
}

function supportsDisabledAttribute(element: Element) {
  return ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
}

function getTabIndex(element: HTMLElement, options: TabbableOptions) {
  if (options.disabled && !options.focusable) {
    if (isNativeTabbable(element) && !supportsDisabledAttribute(element)) {
      // Anchor, audio and video tags don't support the `disabled` attribute.
      // We must pass tabIndex={-1} so they don't receive focus on tab.
      return -1;
    }

    // Elements that support the `disabled` attribute don't need tabIndex.
    return undefined;
  }

  if (isNativeTabbable(element)) {
    // If the element is enabled and it's natively tabbable, we don't need to
    // specify a tabIndex attribute unless it's explicitly set by the user.
    return undefined;
  }

  // If the element is enabled and is not natively tabbable, we have to
  // fallback tabIndex={0}.
  return element.tabIndex || 0;
}

export type TabbableOptions = {
  disabled?: boolean;
  focusable?: boolean;
};

export type TabbableProps = HTMLAttributes<HTMLElement> & {
  ref: RefObject<HTMLElement>;
  disabled?: boolean;
};

export const useTabbable = (options: TabbableOptions): TabbableProps => {
  const ref = useRef<HTMLElement>(null);
  const [, forceRender] = useState(0);

  useEffect(() => {
    // Force render to re-evaluate ref.current
    forceRender((i) => i + 1);
  }, []);

  return ref.current
    ? {
        ref,
        disabled:
          options.disabled && !options.focusable && supportsDisabledAttribute(ref.current)
            ? true
            : undefined,
        'aria-disabled': options.disabled,
        tabIndex: getTabIndex(ref.current, options),
      }
    : { ref };
};

export const tabbableOptions: Array<keyof TabbableOptions> = ['disabled', 'focusable'];

export const Tabbable = forwardRef((props: TabbableOptions & BoxProps, ref): ReactElement => {
  const { children, ...boxProps } = props;
  const { ref: internalRef, ...tabbableProps } = useTabbable(props);
  const finalRef = useMergeRef(ref, internalRef);

  return (
    <Box ref={finalRef} {...tabbableProps} {...omit(boxProps, tabbableOptions)}>
      {children}
    </Box>
  );
});
