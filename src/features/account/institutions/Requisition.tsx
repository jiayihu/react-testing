import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useId } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Box, Text } from 'theme-ui';
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

  const alertDescriptionId = useId();

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
          <Alert role="alert" aria-describedby={alertDescriptionId}>
            <Text id={alertDescriptionId}>Accounts successfully connected</Text>
          </Alert>
        </Box>
      ) : error ? (
        <Box>
          <Alert role="alert" variant="error" aria-describedby={alertDescriptionId}>
            <Text id={alertDescriptionId}>{error.message}</Text>
          </Alert>
        </Box>
      ) : null}
    </Box>
  );
}
