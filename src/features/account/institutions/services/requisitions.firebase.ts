import { collection, CollectionReference, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../../services/firestore';
import { UserRequisition } from '../institution.types';
import { PostRequisitionResponse } from './institutions.nordigen';

export async function getUserRequisitions(uid: string): Promise<UserRequisition[]> {
  const collectionRef = collection(
    db,
    'users',
    uid,
    'requisitions',
  ) as CollectionReference<UserRequisition>;
  const collectionSnap = await getDocs<UserRequisition>(collectionRef);

  return collectionSnap.docs.map((doc) => doc.data());
}

export function addUserRequisition(uid: string, requisition: PostRequisitionResponse) {
  const docRef = doc(db, 'users', uid, 'requisitions', requisition.id);
  const userRequisition: UserRequisition = {
    id: requisition.id,
    link: requisition.link,
  };

  return setDoc(docRef, userRequisition);
}
