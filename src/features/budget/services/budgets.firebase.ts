import {
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentReference,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../../services/firestore';
import { Budget } from '../budget.types';

export async function getBudgets(uid: string): Promise<Budget[]> {
  const collectionRef = collection(db, 'users', uid, 'budgets') as CollectionReference<Budget>;
  const collectionSnap = await getDocs<Budget>(collectionRef);

  return collectionSnap.docs.map((doc) => doc.data());
}

export async function addBudget(uid: string, budget: Budget): Promise<void> {
  const docRef = doc(db, 'users', uid, 'budgets', budget.id) as DocumentReference<Budget>;

  return setDoc(docRef, budget);
}

export async function updateBudget(
  uid: string,
  budgetId: string,
  budget: Partial<Budget>,
): Promise<void> {
  const docRef = doc(db, 'users', uid, 'budgets', budgetId) as DocumentReference<Budget>;

  return updateDoc(docRef, budget);
}

export async function deleteBudget(uid: string, budgetId: string): Promise<void> {
  const docRef = doc(db, 'users', uid, 'budgets', budgetId);

  return deleteDoc(docRef);
}
