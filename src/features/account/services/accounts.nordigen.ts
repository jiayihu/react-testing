import { requestAuthenticatedNordigen } from '../../../services/nordigen';
import { Balance, BankAccount } from '../account.types';

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
