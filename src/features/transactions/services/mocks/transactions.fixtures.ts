import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { merge } from 'lodash';
import { psd2DateFormat } from '../../../../services/nordigen';
import { BaseTransaction, Transaction, TransactionKind } from '../../transaction.types';
import { PSD2Transaction } from '../transactions.nordigen';

export function createTransaction(overrides: Partial<PSD2Transaction> = {}): PSD2Transaction {
  return merge(
    {
      transactionId: faker.datatype.uuid(),
      bookingDate: format(
        faker.date.recent(faker.datatype.number({ min: 0, max: 30 })),
        psd2DateFormat,
      ),
      transactionAmount: {
        amount: String(faker.datatype.number({ min: -100, max: 100 })),
        currency: 'EUR',
      },
      valueDate: format(
        faker.date.recent(faker.datatype.number({ min: 0, max: 7 })),
        psd2DateFormat,
      ),
      remittanceInformationUnstructured: faker.commerce.productName(),
    },
    overrides,
  );
}

export function createAccountTransaction(overrides: Partial<Transaction> = {}): Transaction {
  const transactionKind: TransactionKind = faker.helpers.arrayElement(
    Object.values(TransactionKind),
  );

  const baseInfo: BaseTransaction = {
    transactionId: faker.datatype.uuid(),
    bookingDate: format(
      faker.date.recent(faker.datatype.number({ min: 0, max: 30 })),
      psd2DateFormat,
    ),
    transactionAmount: {
      amount: String(faker.datatype.number({ min: -100, max: 100 })),
      currency: 'EUR',
    },
    valueDate: format(faker.date.recent(faker.datatype.number({ min: 0, max: 7 })), psd2DateFormat),
    category: null,
    exclude: false,
    information: { description: faker.commerce.productName() },
  };
  let transaction: Transaction;

  switch (transactionKind) {
    case TransactionKind.Payment:
      transaction = {
        kind: TransactionKind.Payment,
        ...baseInfo,
        creditorName: faker.company.name(),
      };
      break;
    case TransactionKind.Transfer:
      transaction = {
        kind: TransactionKind.Transfer,
        ...baseInfo,
        debtorName: faker.company.name(),
      };
      break;
    case TransactionKind.Unknown:
      transaction = {
        kind: TransactionKind.Unknown,
        ...baseInfo,
      };
  }

  return merge(transaction, overrides);
}
