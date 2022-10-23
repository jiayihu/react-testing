import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../services/firestore';
import { requestAuthenticatedNordigen } from '../../services/nordigen';
import { Account, Balance, BankAccount } from './account.types';

export type GetAccountResponse = {
  id: string;
  created: string;
  last_accessed: string;
  iban: string;
  institution_id: string;
  owner_name: string;
};

export async function getInstitutionAccount(accountId: string): Promise<BankAccount> {
  const account = await requestAuthenticatedNordigen<GetAccountResponse>(`accounts/${accountId}/`);

  return {
    kind: 'Bank',
    id: account.id,
    iban: account.iban,
    institutionId: account.institution_id,
    ownerName: account.owner_name,
    lastUpdate: null,
  };
}

export function getAccountBalances(accountId: string) {
  return requestAuthenticatedNordigen<{ balances: Balance[] }>(
    `accounts/${accountId}/balances/`,
  ).then((response) => response.balances);
}

export async function getSavedAccounts(uid: string): Promise<Account[]> {
  const collectionRef = collection(db, 'users', uid, 'accounts') as CollectionReference<Account>;
  const collectionSnap = await getDocs<Account>(collectionRef);

  return collectionSnap.docs.map((doc) => doc.data());
}

export async function getSavedAccount(
  uid: string,
  accountId: string,
): Promise<BankAccount | undefined> {
  const docRef = doc(db, 'users', uid, 'accounts', accountId) as DocumentReference<BankAccount>;
  const docSnap = await getDoc<BankAccount>(docRef);

  return docSnap.data();
}

export async function addSavedAccount(uid: string, account: Account): Promise<void> {
  const docRef = doc(db, 'users', uid, 'accounts', account.id) as DocumentReference<Account>;

  return setDoc(docRef, account);
}

export async function updateSavedAccount(
  uid: string,
  accountId: string,
  account: Partial<Account>,
): Promise<void> {
  const docRef = doc(db, 'users', uid, 'accounts', accountId) as DocumentReference<Account>;

  return updateDoc(docRef, account);
}
