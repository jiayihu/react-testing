import { startOfMonth } from 'date-fns';
import { range } from 'lodash';
import { Transaction } from '../../transaction.types';
import { createAccountTransaction } from '../mocks/transactions.fixtures';

export const getAccountTransactions = jest.fn(
  (
    uid: string,
    accountId: string,
    {
      fromDate = startOfMonth(new Date()),
      toDate = new Date(),
    }: { fromDate?: Date; toDate?: Date } = {},
  ): Promise<Transaction[]> => {
    return Promise.resolve(range(0, 10).map(() => createAccountTransaction()));
  },
);

export const addAccountTransactions = jest.fn(
  (uid: string, accountId: string, transactions: Transaction[]) => {
    return Promise.resolve();
  },
);

export const addAccountTransaction = jest.fn(
  (uid: string, accountId: string, transaction: Transaction): Promise<void> => {
    return Promise.resolve();
  },
);

export const updateAccountTransaction = jest.fn(
  (
    uid: string,
    accountId: string,
    transactionId: string,
    transaction: Partial<Transaction>,
  ): Promise<void> => {
    return Promise.resolve();
  },
);
