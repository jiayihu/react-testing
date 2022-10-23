import { omit } from 'lodash';
import { HTMLAttributes, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Box, BoxProps } from 'theme-ui';
import { DisclosureStateReturn, discosureStateProps } from './useDisclosureState';

export type DisclosureContentOptions = Pick<
  Partial<DisclosureStateReturn>,
  'id' | 'visible' | 'animating' | 'animated' | 'stopAnimation'
>;

export type DisclosureContentProps = HTMLAttributes<HTMLElement> & {
  'data-enter': string | undefined;
  'data-leave': string | undefined;
} & Pick<DisclosureContentOptions, 'id'>;

type TransitionState = 'enter' | 'leave' | null;

export const useDisclosureContent = (options: DisclosureContentOptions): DisclosureContentProps => {
  const { stopAnimation } = options;
  const animating = options.animated && options.animating;
  const [transition, setTransition] = useState<TransitionState>(null);
  const hidden = !options.visible && !animating;
  const style = hidden ? { display: 'none' } : undefined;
  const raf = useRef(0);

  useEffect(() => {
    if (!options.animated) {
      return undefined;
    }

    // Double RAF is needed so the browser has enough time to paint the
    // default styles before processing the `data-enter` attribute. Otherwise
    // it wouldn't be considered a transition.
    // See https://github.com/reakit/reakit/issues/643
    raf.current = window.requestAnimationFrame(() => {
      raf.current = window.requestAnimationFrame(() => {
        if (options.visible) {
          setTransition('enter');
        } else if (animating) {
          setTransition('leave');
        } else {
          setTransition(null);
        }
      });
    });
    return () => window.cancelAnimationFrame(raf.current);
  }, [options.animated, options.visible, animating]);

  const onEnd = useCallback(
    (event: React.SyntheticEvent) => {
      if (event.target !== event.currentTarget || !animating) {
        return;
      }

      // No animation duration
      if (options.animated === true) {
        stopAnimation?.();
      }
    },
    [options.animated, animating, stopAnimation],
  );

  const onTransitionEnd = useCallback(
    (event: React.TransitionEvent) => {
      onEnd(event);
    },
    [onEnd],
  );

  const onAnimationEnd = useCallback(
    (event: React.AnimationEvent) => {
      onEnd(event);
    },
    [onEnd],
  );

  return {
    id: options.id,
    'data-enter': transition === 'enter' ? '' : undefined,
    'data-leave': transition === 'leave' ? '' : undefined,
    onTransitionEnd,
    onAnimationEnd,
    hidden,
    style,
  };
};

export const disclosureContentOptions: Array<keyof DisclosureContentOptions> = [
  'visible',
  'animating',
  'animated',
  'stopAnimation',
];
const excludedDisclosureProps = Array.from(
  new Set([...disclosureContentOptions, ...discosureStateProps]),
);

export function DisclosureContent(props: DisclosureContentOptions & BoxProps): ReactElement {
  const disclosureContentProps = useDisclosureContent(props);

  return (
    <Box {...disclosureContentProps} {...omit(props, excludedDisclosureProps)}>
      {props.children}
    </Box>
  );
}
