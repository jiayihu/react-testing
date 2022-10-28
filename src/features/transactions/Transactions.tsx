import { ResponsiveTimeRange } from '@nivo/calendar';
import { endOfMonth, startOfMonth } from 'date-fns';
import { groupBy } from 'lodash';
import { MouseEvent, useMemo, useState } from 'react';
import { Alert, Box, Grid, Heading } from 'theme-ui';
import { useAccounts } from '../account/useAccounts';
import { useSignedInUser } from '../auth/AuthContext';
import { Clickable } from '../ui/abstract/Clickable';
import { DialogDisclosure } from '../ui/Dialog/DialogDisclosure';
import { useDialogState } from '../ui/Dialog/useDialogState';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner/Spinner';
import { Transaction } from './transaction.types';
import { TransactionDetails } from './TransactionForm';
import { TransactionGroup } from './TransactionGroup';
import { TransactionInfo } from './TransactionInfo';
import { useTransactions } from './useTransactions';

export function Transactions() {
  const user = useSignedInUser();
  const { data: accounts = [] } = useAccounts(user.uid);
  const { isLoading, transactionsByAccount, transactions } = useTransactions(user.uid, accounts);

  const dialog = useDialogState({ animated: true });
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    Transaction['transactionId'] | null
  >(null);

  const selectedTransaction = useMemo(
    () => transactions.find((transaction) => transaction.transactionId === selectedTransactionId),
    [transactions, selectedTransactionId],
  );
  const selectedTransactionAccount = useMemo(() => {
    if (!selectedTransactionId) {
      return null;
    }

    const accountEntry = Object.entries(transactionsByAccount).find(([accountId, transactions]) => {
      return transactions.find((t) => t.transactionId === selectedTransactionId);
    });
    const [accountId] = accountEntry ?? [];

    return (!!accountId && accounts.find((account) => account.id === accountId)) || null;
  }, [accounts, transactionsByAccount, selectedTransactionId]);

  const transactionsByDate = useMemo(
    () => groupBy(transactions, (t) => t.bookingDate),
    [transactions],
  );

  const usedAmountForEachDay: Array<{ value: number; day: string }> = useMemo(
    () =>
      Object.entries(transactionsByDate).map(([date, transactions]) => {
        const usedAmount = transactions
          .filter(
            (transaction) =>
              !transaction.exclude && Number(transaction.transactionAmount.amount) < 0,
          )
          .reduce((sum, t) => sum + Number(t.transactionAmount.amount), 0);

        return {
          value: Math.abs(usedAmount),
          day: date,
        };
      }),
    [transactionsByDate],
  );

  const now = new Date();

  return (
    <Box>
      <Heading as="h2">Expenses</Heading>

      <Box sx={{ height: '16rem' }}>
        <ResponsiveTimeRange
          data={usedAmountForEachDay}
          from={startOfMonth(now)}
          to={endOfMonth(now)}
          emptyColor="#eeeeee"
          colors={['#D2DDAF', '#B3C824', '#79834E']}
          margin={{ top: 40, right: 0, bottom: 40, left: 40 }}
          dayBorderWidth={2}
          dayBorderColor="#ffffff"
        />
      </Box>

      {isLoading ? (
        <Spinner />
      ) : (
        <Grid>
          {Object.entries(transactionsByDate).map(([date, transactions]) => (
            <TransactionGroup
              date={date}
              transactions={transactions}
              renderTransaction={(transaction) => (
                <DialogDisclosure {...dialog} key={transaction.transactionId}>
                  {(props) => (
                    <Clickable
                      {...props}
                      onClick={(e: MouseEvent<HTMLDivElement>) => {
                        setSelectedTransactionId(transaction.transactionId);
                        props.onClick && props.onClick(e);
                      }}
                      aria-label={`Transaction ${transaction.information.description}`}
                    >
                      <TransactionInfo transaction={transaction} />
                    </Clickable>
                  )}
                </DialogDisclosure>
              )}
              key={date}
            />
          ))}
        </Grid>
      )}

      <Modal level="base" aria-label="Transaction details" {...dialog}>
        {selectedTransaction ? (
          selectedTransactionAccount ? (
            <TransactionDetails
              transaction={selectedTransaction}
              account={selectedTransactionAccount}
              onSave={dialog.hide}
            />
          ) : (
            <Alert>Cannot find account related to the selected transaction</Alert>
          )
        ) : null}
      </Modal>
    </Box>
  );
}
