import { CategoryName } from '../category/category.types';
import { CurrencyValue } from '../misc/currency/currency.types';

export enum TransactionKind {
  Payment = 'Payment',
  Transfer = 'Transfer',
  Unknown = 'Unknown',
}

export type BaseTransaction = {
  transactionId: string;
  bookingDate: string;
  transactionAmount: CurrencyValue;
  valueDate: string;
  category: CategoryName | null;
  exclude: boolean;
  information: { description: string | null };
};

export enum IdentityName {
  Unknown = 'Unknown',
}

export type PaymentTransaction = BaseTransaction & {
  kind: TransactionKind.Payment;
  creditorName: string;
};

export type TransferTransaction = BaseTransaction & {
  kind: TransactionKind.Transfer;
  debtorName: string;
};

export type UnknownTransaction = BaseTransaction & {
  kind: TransactionKind.Unknown;
};

export type Transaction = PaymentTransaction | TransferTransaction | UnknownTransaction;
