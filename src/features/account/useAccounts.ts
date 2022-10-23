import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Account } from './account.types';
import { getSavedAccounts } from './accounts.service';

export const accountsQueryKey = 'accounts';

export const useAccounts = (uid: string): UseQueryResult<Account[], unknown> => {
  return useQuery([accountsQueryKey], () => getSavedAccounts(uid), {
    // Avoid considering the data as stale as soon as fetched
    staleTime: Infinity,
  });
};
