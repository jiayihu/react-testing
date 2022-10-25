import { faker } from '@faker-js/faker';
import { merge, range } from 'lodash';
import { Institution, Requisition, UserRequisition } from '../../institution.types';

export function createInstitution(overrides: Partial<Institution> = {}): Institution {
  return merge(
    {
      bic: faker.finance.bic(),
      countries: range(0, 2).map(() => faker.address.countryCode()),
      id: faker.company.name().toUpperCase(),
      logo: faker.image.business(),
      name: faker.company.name(),
      payments: false,
      transaction_total_days: 90,
    },
    overrides,
  );
}

export function createRequisition(overrides: Partial<Requisition> = {}): Requisition {
  return merge(
    {
      id: faker.datatype.uuid(),
      status: 'LN', // Linked
      agreements: faker.datatype.uuid(),
      accounts: range(0, 1).map(() => faker.datatype.uuid()),
      reference: faker.datatype.uuid(),
    },
    overrides,
  );
}

export function createUserRequisition(overrides: Partial<UserRequisition> = {}): UserRequisition {
  return merge(
    {
      id: faker.datatype.uuid(),
      link: faker.internet.url(),
    },
    overrides,
  );
}
