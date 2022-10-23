import { Account } from '../../account/account.types';
import { Transaction } from '../transaction.types';

export enum TransactionActionType {
  REQUEST_TRANSACTIONS = 'REQUEST_TRANSACTIONS',
  SAVE_TRANSACTIONS = 'SAVE_TRANSACTIONS',
  REQUEST_TRANSACTIONS_ERROR = 'REQUEST_TRANSACTIONS_ERROR',
}

export function requestAccountTransactions(
  uid: string,
  accountId: string,
  config: { skipUpdate: boolean },
) {
  return {
    type: TransactionActionType.REQUEST_TRANSACTIONS,
    payload: { uid, accountId, config },
  } as const;
}

export function saveAccountTransactions(account: Account, transactions: Transaction[]) {
  return {
    type: TransactionActionType.SAVE_TRANSACTIONS,
    payload: { account, transactions },
  } as const;
}

export function requestAccountTransactionsError(error: Error) {
  return {
    type: TransactionActionType.REQUEST_TRANSACTIONS_ERROR,
    payload: { error },
  } as const;
}

export type RequestAccountTransactionsAction = ReturnType<typeof requestAccountTransactions>;
export type SaveAccountTransactionsAction = ReturnType<typeof saveAccountTransactions>;
export type RequestAccountTransactionsErrorAction = ReturnType<
  typeof requestAccountTransactionsError
>;

export type TransactionAction =
  | RequestAccountTransactionsAction
  | SaveAccountTransactionsAction
  | RequestAccountTransactionsErrorAction;
