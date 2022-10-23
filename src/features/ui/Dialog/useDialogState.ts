import {
  DisclosureActions,
  DisclosureInitialState,
  DisclosureState,
  DisclosureStateReturn,
  discosureStateProps,
  useDisclosureState,
} from '../Disclosure/useDisclosureState';

export type DialogState = DisclosureState;

export type DialogActions = DisclosureActions;

export type DialogInitialState = DisclosureInitialState;

export type DialogStateReturn = DisclosureStateReturn & DialogState & DialogActions;

export function useDialogState(initialState: DialogInitialState): DialogStateReturn {
  const disclosure = useDisclosureState(initialState);

  return {
    ...disclosure,
  };
}

export const dialogStateProps = [...discosureStateProps];
