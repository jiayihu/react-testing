import { RootState } from '../../../store/store';
import { RequisitionAction, RequisitionActionType } from './requisitions.actions';

export type RequisitionsState =
  | {
      isLoading: false;
      isSuccess: false;
      error: null;
    }
  | {
      isLoading: true;
      isSuccess: false;
      error: null;
    }
  | {
      isLoading: false;
      isSuccess: true;
      error: null;
    }
  | {
      isLoading: false;
      isSuccess: false;
      error: Error;
    };

const getInitialState = (): RequisitionsState => {
  return {
    isLoading: false,
    isSuccess: false,
    error: null,
  };
};

export function requisitionsReducer(
  state: RequisitionsState = getInitialState(),
  action: RequisitionAction,
): RequisitionsState {
  switch (action.type) {
    case RequisitionActionType.SAVE_REQUISITION_ACCOUNTS: {
      return {
        isLoading: true,
        isSuccess: false,
        error: null,
      };
    }
    case RequisitionActionType.SAVE_REQUISITION_ACCOUNTS_SUCCESS: {
      return {
        isLoading: false,
        isSuccess: true,
        error: null,
      };
    }
    case RequisitionActionType.SAVE_REQUISITION_ACCOUNTS_ERROR: {
      return {
        isLoading: false,
        isSuccess: false,
        error: action.payload.error,
      };
    }
    default:
      return state;
  }
}

export const selectIsSavingAccountsState = (state: RootState) => state.requisitions;
