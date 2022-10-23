import { CurrencyValue } from '../misc/currency/currency.types';

export type BankAccount = {
  kind: 'Bank';
  id: string;
  iban: string;
  institutionId: string;
  ownerName: string;
  lastUpdate: string | null;
};

export type CashAccount = {
  kind: 'Cash';
  id: string;
  name: string;
  amount: number;
};

export type Account = BankAccount;

export function isBankAccount(account: Account): account is BankAccount {
  return account.kind === 'Bank';
}

export type Balance = {
  balanceAmount: CurrencyValue;
  balanceType: 'expected' | 'interimAvailable';
  referenceDate: string;
};
