import { omit } from 'lodash';
import { KeyboardEvent, ReactElement, RefObject, useCallback, useRef } from 'react';
import { Box, BoxProps } from 'theme-ui';
import {
  disclosureContentOptions,
  DisclosureContentOptions,
  DisclosureContentProps,
  useDisclosureContent,
} from '../Disclosure/DisclosureContent';
import { useFocusOnShow } from './reakit/useFocusOnShow';
import { dialogStateProps, DialogStateReturn } from './useDialogState';

export type DialogOptions = DisclosureContentOptions &
  Pick<Partial<DialogStateReturn>, 'hide'> &
  Pick<DialogStateReturn, 'id'> & {
    hideOnEsc?: boolean;
  };

export type DialogProps = DialogOptions &
  DisclosureContentProps & {
    ref: RefObject<HTMLElement>;
  };

export const useDialog = (options: DialogOptions): DialogProps => {
  const disclosureContentProps = useDisclosureContent(options);

  const { hide } = options;
  const dialog = useRef<HTMLElement>(null);

  useFocusOnShow(dialog, options);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.defaultPrevented || event.key !== 'Escape' || !options.hideOnEsc || !hide) {
        return;
      }

      event.stopPropagation();
      hide();
    },
    [options.hideOnEsc, hide],
  );

  return {
    ref: dialog,
    role: 'dialog',
    tabIndex: -1,
    'aria-modal': true,
    onKeyDown,
    id: options.id,
    ...disclosureContentProps,
  };
};

export const dialogOptions: Array<keyof DialogOptions> = [
  ...disclosureContentOptions,
  'hide',
  'hideOnEsc',
];

const excludedDialogProps = Array.from(new Set([...dialogOptions, ...dialogStateProps]));

export function Dialog(props: DialogOptions & BoxProps): ReactElement {
  const dialogProps = useDialog(props);

  return (
    <Box {...dialogProps} {...omit(props, excludedDialogProps)}>
      {props.children}
    </Box>
  );
}
