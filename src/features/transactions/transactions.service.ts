import { format, startOfMonth } from 'date-fns';
import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../services/firestore';
import { psd2DateFormat, requestAuthenticatedNordigen } from '../../services/nordigen';
import { BankAccount } from '../account/account.types';
import { CurrencyValue } from '../misc/currency/currency.types';
import { BaseTransaction, IdentityName, Transaction, TransactionKind } from './transaction.types';

export type PSD2Transaction = {
  transactionId: string;
  bankTransactionCode?: TransactionKind;
  bookingDate: string;
  bookingDateTime?: string;
  valueDate: string;
  valueDateTime?: string;
  transactionAmount: CurrencyValue;
  creditorName?: string;
  debtorName?: string;
  debtorAccount?: { iban: string };
  proprietaryBankTransactionCode?: string;
  remittanceInformationUnstructured?: string;
  remittanceInformationUnstructuredArray?: string[];
};

export type GetTransactionsResponse = {
  transactions: { booked: PSD2Transaction[]; pending: PSD2Transaction[] };
};

const mappers: Partial<
  Record<string, (transaction: PSD2Transaction, index: number) => Transaction>
> = {
  ING_INGBITMM: (t): Transaction => {
    const bankTransactionCodeMap: Partial<Record<string, TransactionKind>> = {
      'PAGAMENTO CARTA': TransactionKind.Payment,
      'PAGAMENTO I24': TransactionKind.Payment,
      'VS.DISPOSIZIONE': TransactionKind.Transfer,
    };

    const transactionKind =
      (t.proprietaryBankTransactionCode &&
        bankTransactionCodeMap[t.proprietaryBankTransactionCode]) ||
      TransactionKind.Unknown;

    const baseTransaction: BaseTransaction = {
      transactionId: t.transactionId,
      bookingDate: t.bookingDate,
      transactionAmount: t.transactionAmount,
      valueDate: t.valueDate,
      category: null,
      exclude: false,
      information: { description: t.remittanceInformationUnstructured ?? null },
    };

    if (transactionKind === TransactionKind.Payment) {
      return {
        kind: transactionKind,
        ...baseTransaction,
        creditorName:
          t.creditorName ?? baseTransaction.information.description ?? IdentityName.Unknown,
      };
    }

    if (transactionKind === TransactionKind.Transfer) {
      return {
        kind: transactionKind,
        ...baseTransaction,
        debtorName: t.debtorName ?? baseTransaction.information.description ?? IdentityName.Unknown,
      };
    }

    return {
      kind: TransactionKind.Unknown,
      ...baseTransaction,
    };
  },
  REVOLUT_REVOGB21: (t): Transaction => {
    const bankTransactionCodeMap: Partial<Record<string, TransactionKind>> = {
      CARD_PAYMENT: TransactionKind.Payment,
      TOPUP: TransactionKind.Transfer,
    };

    const transactionKind =
      (t.proprietaryBankTransactionCode &&
        bankTransactionCodeMap[t.proprietaryBankTransactionCode]) ||
      TransactionKind.Unknown;

    const baseTransaction: BaseTransaction = {
      transactionId: t.transactionId,
      bookingDate: t.bookingDate,
      transactionAmount: t.transactionAmount,
      valueDate: t.valueDate,
      category: null,
      exclude: false,
      information: { description: t.remittanceInformationUnstructuredArray?.[0] ?? null },
    };

    if (transactionKind === TransactionKind.Payment) {
      return {
        kind: transactionKind,
        ...baseTransaction,
        creditorName:
          t.creditorName ?? baseTransaction.information.description ?? IdentityName.Unknown,
      };
    }

    if (transactionKind === TransactionKind.Transfer) {
      return {
        kind: transactionKind,
        ...baseTransaction,
        debtorName: t.debtorName ?? baseTransaction.information.description ?? IdentityName.Unknown,
      };
    }

    return {
      kind: TransactionKind.Unknown,
      ...baseTransaction,
    };
  },
};

const defaultMapper = (t: PSD2Transaction): Transaction => {
  const transactionKind =
    Number(t.transactionAmount.amount) < 0 ? TransactionKind.Payment : TransactionKind.Transfer;

  const baseTransaction: BaseTransaction = {
    transactionId: t.transactionId,
    bookingDate: t.bookingDate,
    transactionAmount: t.transactionAmount,
    valueDate: t.valueDate,
    category: null,
    exclude: false,
    information: { description: t.remittanceInformationUnstructured ?? null },
  };

  if (transactionKind === TransactionKind.Payment) {
    return {
      kind: transactionKind,
      ...baseTransaction,
      creditorName:
        t.creditorName ?? baseTransaction.information.description ?? IdentityName.Unknown,
    };
  }

  if (transactionKind === TransactionKind.Transfer) {
    return {
      kind: transactionKind,
      ...baseTransaction,
      debtorName: t.debtorName ?? baseTransaction.information.description ?? IdentityName.Unknown,
    };
  }

  return {
    kind: TransactionKind.Unknown,
    ...baseTransaction,
  };
};

export function getInstitutionAccountTransactions(
  { institutionId, id }: BankAccount,
  { dateFrom = startOfMonth(new Date()), dateTo = new Date() }: { dateFrom?: Date; dateTo?: Date },
): Promise<Transaction[]> {
  const queryParams = new URLSearchParams();

  const absoluteDateFrom = dateFrom
    ? dateFrom.valueOf() + dateFrom.getTimezoneOffset() * 60 * 1000
    : null;
  const absoluteDateTo = dateTo.valueOf() + dateTo.getTimezoneOffset() * 60 * 1000;

  absoluteDateFrom && queryParams.append('date_from', format(absoluteDateFrom, psd2DateFormat));
  dateTo && queryParams.append('date_to', format(absoluteDateTo, psd2DateFormat));

  return requestAuthenticatedNordigen<GetTransactionsResponse>(
    `accounts/${id}/transactions/?${queryParams.toString()}`,
  ).then((response) => {
    return response.transactions.booked.map((transaction, i) => {
      const mapper = mappers[institutionId] ?? defaultMapper;
      return mapper(transaction, i);
    });
  });
}

export async function getAccountTransactions(
  uid: string,
  accountId: string,
  {
    fromDate = startOfMonth(new Date()),
    toDate = new Date(),
  }: { fromDate?: Date; toDate?: Date } = {},
): Promise<Transaction[]> {
  const collectionRef = collection(
    db,
    'users',
    uid,
    'accounts',
    accountId,
    'transactions',
  ) as CollectionReference<Transaction>;
  const q = query<Transaction>(
    collectionRef,
    where('bookingDate', '>=', format(fromDate, psd2DateFormat)),
    where('bookingDate', '<=', format(toDate, psd2DateFormat)),
  );
  const querySnap = await getDocs(q);

  return querySnap.docs.map((doc) => doc.data());
}

export function addAccountTransactions(
  uid: string,
  accountId: string,
  transactions: Transaction[],
) {
  const batch = writeBatch(db);
  const docRefs = transactions.map((t) => {
    const docRef = doc(db, 'users', uid, 'accounts', accountId, 'transactions', t.transactionId);
    return [docRef, t] as const;
  });

  docRefs.forEach(([docRef, transaction]) => batch.set(docRef, transaction));

  return batch.commit();
}

export function addAccountTransaction(
  uid: string,
  accountId: string,
  transaction: Transaction,
): Promise<void> {
  const docRef = doc(
    db,
    'users',
    uid,
    'accounts',
    accountId,
    'transactions',
    transaction.transactionId,
  );

  return setDoc(docRef, transaction);
}

export async function updateAccountTransaction(
  uid: string,
  accountId: string,
  transactionId: string,
  transaction: Partial<Transaction>,
): Promise<void> {
  const docRef = doc(
    db,
    'users',
    uid,
    'accounts',
    accountId,
    'transactions',
    transactionId,
  ) as DocumentReference<Transaction>;

  return updateDoc(docRef, transaction);
}
