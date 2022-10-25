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
import { db } from '../../../services/firestore';
import { psd2DateFormat } from '../../../services/nordigen';
import { Transaction } from '../transaction.types';

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
