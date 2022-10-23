import { omit } from 'lodash';
import { ReactElement, useId, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, BoxProps } from 'theme-ui';
import {
  disclosureContentOptions,
  DisclosureContentOptions,
  DisclosureContentProps,
  useDisclosureContent,
} from '../Disclosure/DisclosureContent';
import { dialogStateProps } from './useDialogState';

export type DialogBackdropOptions = DisclosureContentOptions;

export type DialogBackdropProps = DialogBackdropOptions & DisclosureContentProps;

export const useDialogBackdrop = (options: DialogBackdropOptions): DialogBackdropProps => {
  const disclosureContentProps = useDisclosureContent(options);

  return {
    ...disclosureContentProps,
    id: undefined,
  };
};

export const dialogBackdropOptions: Array<keyof DialogBackdropOptions> = [
  ...disclosureContentOptions,
];

const excludedDialogProps = Array.from(new Set([...dialogBackdropOptions, ...dialogStateProps]));

export function DialogBackdrop(props: DialogBackdropOptions & BoxProps): ReactElement {
  const backdropProps = useDialogBackdrop(props);
  const id = useId();
  const [hostNode] = useState(() => {
    const element = document.createElement('div');
    element.setAttribute('id', id);

    return element;
  });

  useLayoutEffect(() => {
    document.body.appendChild(hostNode);

    return () => {
      document.body.removeChild(hostNode);
    };
  }, [hostNode]);

  return createPortal(
    <Box {...backdropProps} {...omit(props, excludedDialogProps)}>
      {props.children}
    </Box>,
    hostNode,
  );
}
