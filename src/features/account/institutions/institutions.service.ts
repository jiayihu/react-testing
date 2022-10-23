import { collection, CollectionReference, doc, getDocs, setDoc } from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import { db } from '../../../services/firestore';
import { requestAuthenticatedNordigen } from '../../../services/nordigen';
import { Institution, Requisition, UserRequisition } from './institution.types';

export function getInstitutions(country: string): Promise<Institution[]> {
  return requestAuthenticatedNordigen<Institution[]>(`institutions/?country=${country}`);
}

export function getInstitution(institutionId: string): Promise<Institution> {
  return requestAuthenticatedNordigen<Institution>(`institutions/${institutionId}/`);
}

export async function getRequisition(requisitionId: string) {
  return requestAuthenticatedNordigen<Requisition>(`requisitions/${requisitionId}/`);
}

export type PostRequisitionResponse = Requisition & {
  redirect: string;
  user_language: string;
  link: string;
};

export function postRequisition(uid: string, institutionId: string) {
  return requestAuthenticatedNordigen<PostRequisitionResponse>('requisitions/', {
    redirect: `${window.location.origin}/requisition`,
    institution_id: institutionId,
    reference: `${uid}-${institutionId}-${uuid()}`,
  });
}

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
