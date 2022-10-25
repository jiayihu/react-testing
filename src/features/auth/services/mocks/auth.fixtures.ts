import { faker } from '@faker-js/faker';
import { merge } from 'lodash';
import { AuthUser } from '../../auth.types';

export const createUser = (overrides: Partial<AuthUser> = {}): AuthUser => {
  return merge(
    {
      uid: faker.datatype.uuid(),
      displayName: faker.name.fullName(),
      email: faker.internet.email(),
      emailVerified: true,
      photoURL: null,
    },
    overrides,
  ) as AuthUser;
};
