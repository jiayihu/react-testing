import { omit } from 'lodash';
import { MutableRefObject, ReactElement, useEffect, useRef, useState } from 'react';
import { Box, BoxProps, Button } from 'theme-ui';
import {
  disclosureOptions,
  DisclosureOptions,
  DisclosureProps,
  useDisclosure,
} from '../Disclosure/Disclosure';
import { dialogStateProps, DialogStateReturn } from './useDialogState';

export type DialogDisclosureOptions = DisclosureOptions & Pick<DialogStateReturn, 'toggle'>;

export type DialogDisclosureProps = DisclosureProps;

export const useDialogDisclosure = (options: DialogDisclosureOptions): DialogDisclosureProps => {
  const ref = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);

  const { ref: disclosureRef, ...disclosureProps } = useDisclosure(options);

  useEffect(() => {
    const element = ref.current;

    if (!disclosureRef.current) {
      (disclosureRef as MutableRefObject<HTMLElement | null>).current = element;
    }

    setExpanded(!!options.visible);
  }, [options.visible, disclosureRef]);

  return {
    ref,
    'aria-haspopup': 'dialog',
    'aria-expanded': expanded,
    ...disclosureProps,
  };
};

export const dialogDisclosureOptions: Array<keyof DisclosureOptions> = [
  ...disclosureOptions,
  'toggle',
];
const excludedDialogDisclosureProps = Array.from(
  new Set([...disclosureOptions, ...dialogStateProps]),
);

export function DialogDisclosure({
  children,
  ...props
}: PropsWithFunctionAsChildren<
  DialogDisclosureOptions & BoxProps,
  DialogDisclosureProps
>): ReactElement {
  const dialogDisclosureProps = useDialogDisclosure(props);

  return typeof children === 'function' ? (
    children(dialogDisclosureProps)
  ) : (
    <Box as={Button} {...dialogDisclosureProps} {...omit(props, excludedDialogDisclosureProps)}>
      {children}
    </Box>
  );
}
