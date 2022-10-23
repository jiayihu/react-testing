import { Alert, Box, Button, Divider } from 'theme-ui';
import { useSignedInUser } from '../auth/AuthContext';
import { DialogDisclosure } from '../ui/Dialog/DialogDisclosure';
import { useDialogState } from '../ui/Dialog/useDialogState';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner/Spinner';
import { isBankAccount } from './account.types';
import { AddBankAccount } from './AddBankAccount';
import { BankAccountInfo } from './institutions/BankAccountInfo';
import { useAccounts } from './useAccounts';

export function Accounts() {
  const dialog = useDialogState({ animated: true });
  const user = useSignedInUser();
  const { isLoading, data: accounts, error } = useAccounts(user.uid);

  return (
    <Box>
      {isLoading ? (
        <Spinner />
      ) : accounts ? (
        <Box>
          {accounts.filter(isBankAccount).map((account) => (
            <BankAccountInfo account={account} key={account.id} />
          ))}
        </Box>
      ) : (
        <Alert role="alert" variant="error">{`${error}`}</Alert>
      )}

      <Divider />

      <DialogDisclosure as={Button} variant="secondary" {...dialog}>
        Add new account
      </DialogDisclosure>
      <Modal level="base" aria-label="Add bank account" {...dialog}>
        <AddBankAccount />
      </Modal>
    </Box>
  );
}
