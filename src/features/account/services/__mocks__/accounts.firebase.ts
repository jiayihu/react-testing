import { range } from 'lodash';
import { Account } from '../../account.types';
import { createBankAccount } from '../mocks/accounts.fixtures';

export const getSavedAccounts = jest.fn((uid: string): Promise<Account[]> => {
  return Promise.resolve(range(0, 2).map(() => createBankAccount()));
});

export const getSavedAccount = jest.fn(
  (uid: string, accountId: string): Promise<Account | undefined> => {
    return Promise.resolve(createBankAccount());
  },
);

export const addSavedAccount = jest.fn((uid: string, account: Account): Promise<void> => {
  return Promise.resolve();
});

export const updateSavedAccount = jest.fn(
  (uid: string, accountId: string, account: Partial<Account>): Promise<void> => {
    return Promise.resolve();
  },
);
