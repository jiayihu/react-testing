import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Account } from '../account/account.types';
import { requestAccountTransactions } from './store/transactions.actions';
import {
  selectAccountTransactionsState,
  selectAllAccountTransactions,
} from './store/transactions.reducer';

export function useTransactions(uid: string, accounts: Account[]) {
  const { isLoading, isSuccess, error } = useSelector(selectAccountTransactionsState);
  const transactionsByAccount = useSelector(selectAllAccountTransactions);

  const dispatch = useDispatch();

  useEffect(() => {
    accounts.forEach((account) =>
      dispatch(requestAccountTransactions(uid, account.id, { skipUpdate: false })),
    );
  }, [uid, accounts, dispatch]);

  const transactions = useMemo(
    () => Object.values(transactionsByAccount).flat(),
    [transactionsByAccount],
  );

  return {
    isLoading,
    transactionsByAccount,
    transactions,
    isSuccess,
    error,
  };
}
