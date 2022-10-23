import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Box } from 'theme-ui';
import { useSignedInUser } from '../../auth/AuthContext';
import { Spinner } from '../../ui/Spinner/Spinner';
import { accountsQueryKey } from '../useAccounts';
import { saveRequisitionAccounts } from './store/requisitions.actions';
import { selectIsSavingAccountsState } from './store/requisitions.reducer';

export function Requisition() {
  const user = useSignedInUser();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { isLoading, isSuccess, error } = useSelector(selectIsSavingAccountsState);

  useEffect(() => {
    dispatch(saveRequisitionAccounts(user.uid));
  }, [dispatch, user.uid]);

  useEffect(() => {
    isSuccess && queryClient.invalidateQueries([accountsQueryKey]);
  }, [isSuccess, queryClient]);

  return (
    <Box>
      {isLoading ? (
        <Spinner />
      ) : isSuccess ? (
        <Box>
          <Alert role="alert">Accounts successfully connected</Alert>
        </Box>
      ) : error ? (
        <Box>
          <Alert role="alert" variant="error">{`${error}`}</Alert>
        </Box>
      ) : null}
    </Box>
  );
}
