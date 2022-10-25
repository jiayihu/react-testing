import { faker } from '@faker-js/faker';
import { format } from 'date-fns';
import { merge } from 'lodash';
import { psd2DateFormat } from '../../../../services/nordigen';
import { Balance, BankAccount } from '../../account.types';
import { GetAccountResponse } from '../accounts.nordigen';

export function createInstitutionAccount(
  overrides: Partial<GetAccountResponse> = {},
): GetAccountResponse {
  return merge(
    {
      id: faker.datatype.uuid(),
      created: faker.date.past().toISOString(),
      last_accessed: faker.date.recent().toISOString(),
      iban: faker.finance.iban(),
      institution_id: faker.company.name().toUpperCase(),
      owner_name: faker.name.fullName(),
    },
    overrides,
  );
}

export function createBalance(overrides: Partial<Balance> = {}): Balance {
  return merge(
    {
      balanceAmount: {
        amount: String(faker.datatype.number({ min: 0, max: 100000 })),
        currency: 'EUR',
      },
      balanceType: 'interimAvailable',
      referenceDate: format(new Date(), psd2DateFormat),
    },
    overrides,
  );
}

export function createBankAccount(overrides: Partial<BankAccount> = {}): BankAccount {
  return merge(
    {
      kind: 'Bank',
      id: faker.datatype.uuid(),
      iban: faker.finance,
      institutionId: faker.datatype.uuid(),
      ownerName: faker.name.fullName(),
      lastUpdate: faker.date.past().toISOString(),
    },
    overrides,
  );
}
