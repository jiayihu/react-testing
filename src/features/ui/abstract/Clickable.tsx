import { omit } from 'lodash';
import { forwardRef, ReactElement, useCallback } from 'react';
import { Box, BoxProps } from 'theme-ui';
import { isButton } from '../../../utils/reakit';
import { useMergeRef } from '../../misc/useMergeRef';
import { tabbableOptions, TabbableOptions, TabbableProps, useTabbable } from './Tabbable';

function isNativeClick(event: React.KeyboardEvent) {
  const element = event.currentTarget;
  if (!event.isTrusted) return false;
  // istanbul ignore next: can't test trusted events yet
  return (
    isButton(element) ||
    element.tagName === 'INPUT' ||
    element.tagName === 'TEXTAREA' ||
    element.tagName === 'A' ||
    element.tagName === 'SELECT'
  );
}

export type ClickableOptions = TabbableOptions;

export type ClickableProps = TabbableProps;

export const useClickable = (options: ClickableOptions): ClickableProps => {
  const tabbableProps = useTabbable(options);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (
        options.disabled ||
        event.defaultPrevented ||
        event.metaKey ||
        event.currentTarget !== event.target
      ) {
        return;
      }

      const isEnter = event.key === 'Enter';

      if (isEnter) {
        if (isNativeClick(event)) {
          return;
        }

        event.preventDefault();
        event.currentTarget.click();
      }
    },
    [options.disabled],
  );

  const onKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (options.disabled || event.defaultPrevented || event.metaKey) {
        return;
      }

      const isSpace = event.key === ' ';

      if (isSpace) {
        event.currentTarget.click();
      }
    },
    [options.disabled],
  );

  return {
    ...tabbableProps,
    role: tabbableProps.ref.current && !isButton(tabbableProps.ref.current) ? 'button' : undefined,
    onKeyDown,
    onKeyUp,
  };
};

export const clickableOptions: Array<keyof ClickableOptions> = [...tabbableOptions];

export const Clickable = forwardRef((props: ClickableOptions & BoxProps, ref): ReactElement => {
  const { children, ...boxProps } = props;
  const { ref: internalRef, ...clickableProps } = useClickable(props);
  const finalRef = useMergeRef(ref, internalRef);

  return (
    <Box ref={finalRef} {...clickableProps} {...omit(boxProps, clickableOptions)}>
      {children}
    </Box>
  );
});
