import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { BankAccount } from '../account.types';
import { addSavedAccount, getSavedAccounts } from '../services/accounts.firebase';
import { getInstitutionAccount } from '../services/accounts.nordigen';
import { getRequisition } from './services/institutions.nordigen';
import { getUserRequisitions } from './services/requisitions.firebase';

export const saveRequisitionAccounts = async (uid: string) => {
  const userRequisitions = await getUserRequisitions(uid);
  const requisitions = await Promise.all(
    userRequisitions.map((requisition) => getRequisition(requisition.id)),
  );

  const getAccountReqs = requisitions.flatMap((requisition) =>
    requisition.accounts.map((accountId) => getInstitutionAccount(accountId)),
  );
  const institutionAccounts = await Promise.all(getAccountReqs);

  const savedAccounts = await getSavedAccounts(uid);
  const savedAccountIds = savedAccounts.map((account) => account.id);

  const saveAccountsReqs = institutionAccounts
    .filter((account) => !savedAccountIds.includes(account.id))
    .map((account) => addSavedAccount(uid, account));

  return Promise.all(saveAccountsReqs);
};

export const useRequisition = (uid: string) => {
  const queryClient = useQueryClient();

  const { data: userRequisitions = [], isSuccess: requisitionsSuccess } = useQuery(
    ['userRequisitions'],
    () => getUserRequisitions(uid),
  );

  const requisitionQueryResults = useQueries({
    queries: userRequisitions.map((userRequisition) => {
      return {
        queryKey: ['userRequisition', userRequisition.id],
        queryFn: () => getRequisition(userRequisition.id),
        enabled: requisitionsSuccess,
      };
    }),
  });
  const requisitions = requisitionQueryResults.map((result) => result.data);

  const institutionAccountsQueryResults = useQueries({
    queries: requisitions.flatMap((requisition) => {
      if (!requisition) {
        return [];
      }

      return requisition.accounts.flatMap((accountId) => {
        const query = {
          queryKey: ['institutionAccount', accountId],
          queryFn: () => getInstitutionAccount(accountId),
          enabled: !!requisition,
        };

        return query;
      });
    }),
  });

  const savedAccountIdsResult = useQuery(['savedAccounts'], () => getSavedAccounts(uid), {
    select: (accounts) => accounts.map((account) => account.id),
  });

  const { mutateAsync, isLoading, isSuccess, error } = useMutation((account: BankAccount) =>
    addSavedAccount(uid, account),
  );

  useEffect(() => {
    const areInstitutionAccountsLoaded = institutionAccountsQueryResults.every(
      (result) => result.isSuccess,
    );

    if (areInstitutionAccountsLoaded && savedAccountIdsResult.isSuccess) {
      const institutionAccounts = institutionAccountsQueryResults.map((result) => result.data!);
      const savedAccountIds = savedAccountIdsResult.data;

      const unsavedAccounts = institutionAccounts.filter(
        (account) => !savedAccountIds.includes(account.id),
      );

      if (unsavedAccounts.length) {
        return;
      }

      const mutationReqs = unsavedAccounts.map((account) => mutateAsync(account));

      Promise.all(mutationReqs).then(() => queryClient.invalidateQueries(['savedAccounts']));
    }
  }, [mutateAsync, institutionAccountsQueryResults, savedAccountIdsResult, queryClient]);

  return {
    isLoading,
    isSuccess,
    error,
  };
};
