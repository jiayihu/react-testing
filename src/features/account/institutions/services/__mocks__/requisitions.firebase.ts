import { UserRequisition } from '../../institution.types';
import { PostRequisitionResponse } from '../institutions.nordigen';
import { createUserRequisition } from '../mocks/institutionts.fixtures';

export const getUserRequisitions = jest.fn((uid: string): Promise<UserRequisition[]> => {
  return Promise.resolve([createUserRequisition()]);
});

export const addUserRequisition = jest.fn((uid: string, requisition: PostRequisitionResponse) => {
  return Promise.resolve();
});
