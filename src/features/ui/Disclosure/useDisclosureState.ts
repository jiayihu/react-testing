import { useCallback, useEffect, useId, useState } from 'react';
import { isDefined } from '../../../utils';
import { usePrevious } from '../../misc/usePrevious';

export type DisclosureState = {
  visible: boolean;
  animated: boolean | number;
  animating: boolean;
};

export type DisclosureActions = {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  setVisible: React.Dispatch<React.SetStateAction<DisclosureState['visible']>>;
  setAnimated: React.Dispatch<React.SetStateAction<DisclosureState['animated']>>;
  stopAnimation: () => void;
};

export type DisclosureInitialState = Partial<Pick<DisclosureState, 'visible' | 'animated'>>;

export type DisclosureStateReturn = DisclosureState &
  DisclosureActions & {
    id: string;
  };

export function useDisclosureState(
  initialState: DisclosureInitialState = {},
): DisclosureStateReturn {
  const id = useId();

  const [visible, setVisible] = useState(initialState.visible ?? false);
  const [animated, setAnimated] = useState(initialState.animated ?? false);
  const [animating, setAnimating] = useState(false);
  const previousVisible = usePrevious(visible);

  const visibleHasChanged = isDefined(previousVisible) && previousVisible !== visible;

  if (animated && !animating && visibleHasChanged) {
    // Sets animating to true when when visible is updated
    setAnimating(true);
  }

  useEffect(() => {
    if (typeof animated === 'number' && animating) {
      const timeout = setTimeout(() => setAnimating(false), animated);
      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [animated, animating]);

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible((v) => !v), []);
  const stopAnimation = useCallback(() => setAnimating(false), []);

  return {
    id,
    visible,
    animated,
    animating,
    show,
    hide,
    toggle,
    setVisible,
    setAnimated,
    stopAnimation,
  };
}

export const discosureStateProps: Array<keyof DisclosureStateReturn> = [
  'id',
  'visible',
  'animated',
  'animating',
  'show',
  'hide',
  'toggle',
  'setVisible',
  'setAnimated',
  'stopAnimation',
];
