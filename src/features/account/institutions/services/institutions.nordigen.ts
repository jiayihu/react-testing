import { v4 as uuid } from 'uuid';
import { requestAuthenticatedNordigen } from '../../../../services/nordigen';
import { Institution, Requisition } from '../institution.types';

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
