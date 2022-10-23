import { omit } from 'lodash';
import { ReactElement, useCallback } from 'react';
import { Box, BoxProps, Button } from 'theme-ui';
import {
  clickableOptions,
  ClickableOptions,
  ClickableProps,
  useClickable,
} from '../abstract/Clickable';
import { DisclosureStateReturn, discosureStateProps } from './useDisclosureState';

export type DisclosureOptions = ClickableOptions &
  Pick<Partial<DisclosureStateReturn>, 'visible'> &
  Pick<DisclosureStateReturn, 'toggle' | 'id'>;

export type DisclosureProps = ClickableProps;

export const useDisclosure = (options: DisclosureOptions): DisclosureProps => {
  const clickableProps = useClickable(options);
  const toggle = options.toggle;

  const onClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.defaultPrevented) return;
      toggle?.();
    },
    [toggle],
  );

  return {
    ...clickableProps,
    'aria-expanded': !!options.visible,
    'aria-controls': options.id,
    onClick,
  };
};

export const disclosureOptions: Array<keyof DisclosureOptions> = [...clickableOptions];
const excludedDisclosureProps = Array.from(new Set([...disclosureOptions, ...discosureStateProps]));

export function Disclosure(props: DisclosureOptions & BoxProps): ReactElement {
  const disclosureProps = useDisclosure(props);

  return (
    <Box as={Button} {...disclosureProps} {...omit(props, excludedDisclosureProps)}>
      {props.children}
    </Box>
  );
}
