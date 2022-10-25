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
import { db } from '../../../services/firestore';
import { Account } from '../account.types';

export async function getSavedAccounts(uid: string): Promise<Account[]> {
  const collectionRef = collection(db, 'users', uid, 'accounts') as CollectionReference<Account>;
  const collectionSnap = await getDocs<Account>(collectionRef);

  return collectionSnap.docs.map((doc) => doc.data());
}

export async function getSavedAccount(
  uid: string,
  accountId: string,
): Promise<Account | undefined> {
  const docRef = doc(db, 'users', uid, 'accounts', accountId) as DocumentReference<Account>;
  const docSnap = await getDoc<Account>(docRef);

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
