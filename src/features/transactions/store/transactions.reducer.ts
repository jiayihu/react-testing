import { isAfter } from 'date-fns';
import { memoize } from 'lodash';
import { Selector } from 'react-redux';
import { createSelector } from 'reselect';
import type { RootState } from '../../store/store';
import { Transaction } from '../transaction.types';
import { TransactionAction, TransactionActionType } from './transactions.actions';

export type TransactionsState =
  | {
      isLoading: false;
      data: Record<string, Record<string, Transaction>>;
      isSuccess: false;
      error: null;
    }
  | {
      isLoading: true;
      data: Record<string, Record<string, Transaction>>;
      isSuccess: false;
      error: null;
    }
  | {
      isLoading: false;
      data: Record<string, Record<string, Transaction>>;
      isSuccess: true;
      error: null;
    }
  | {
      isLoading: false;
      data: Record<string, Record<string, Transaction>>;
      isSuccess: false;
      error: Error;
    };

const getInitialState = (): TransactionsState => {
  return {
    isLoading: false,
    data: {},
    isSuccess: false,
    error: null,
  };
};

export function transactionsReducer(
  state: TransactionsState = getInitialState(),
  action: TransactionAction,
): TransactionsState {
  switch (action.type) {
    case TransactionActionType.REQUEST_TRANSACTIONS: {
      return {
        isLoading: true,
        isSuccess: false,
        error: null,
        data: state.data,
      };
    }
    case TransactionActionType.REQUEST_TRANSACTIONS_ERROR: {
      return {
        isLoading: false,
        isSuccess: false,
        error: action.payload.error,
        data: state.data,
      };
    }
    case TransactionActionType.SAVE_TRANSACTIONS: {
      const { account, transactions } = action.payload;
      const existingTransactions = state.data[account.id] ?? {};

      if (!transactions.length) {
        return {
          isLoading: false,
          isSuccess: true,
          error: null,
          data: state.data,
        };
      }

      const transactionsById = Object.fromEntries(transactions.map((t) => [t.transactionId, t]));

      return {
        isLoading: false,
        isSuccess: true,
        error: null,
        data: {
          ...state.data,
          [account.id]: {
            ...existingTransactions,
            ...transactionsById,
          },
        },
      };
    }
    default:
      return state;
  }
}

const flattenTransactionsMap = (transactionsMap: Record<string, Transaction>): Transaction[] => {
  return Object.values(transactionsMap).sort((t1, t2) =>
    isAfter(new Date(t1.bookingDate), new Date(t2.bookingDate)) ? -1 : +1,
  );
};

export const selectAccountTransactionsState = (state: RootState) => state.transactions;

export const selectAccountTransactions = memoize((accountId: string) =>
  createSelector((state: RootState) => state.transactions.data[accountId], flattenTransactionsMap),
);

export const selectAllAccountTransactions: Selector<
  RootState,
  Record<string, Transaction[]>
> = createSelector(
  (state: RootState) => state.transactions.data,
  (transactionsByAccountId) => {
    return Object.fromEntries(
      Object.entries(transactionsByAccountId).map(([accountId, transactionsMap]) => {
        const transactions = flattenTransactionsMap(transactionsMap);
        return [accountId, transactions];
      }),
    );
  },
);
