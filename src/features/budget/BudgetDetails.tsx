import { ResponsiveStream } from '@nivo/stream';
import { format } from 'date-fns';
import { groupBy } from 'lodash';
import { useMemo } from 'react';
import { Box, Button, Container, Flex, Grid, Heading, Text, ThemeUICSSObject } from 'theme-ui';
import { noop } from '../../utils';
import { categoryMap, CategoryName } from '../category/category.types';
import { Currency } from '../misc/currency/Currency';
import { Transaction } from '../transactions/transaction.types';
import { TransactionGroup } from '../transactions/TransactionGroup';
import { TransactionInfo } from '../transactions/TransactionInfo';
import { Confirmation, useConfirmDialog } from '../ui/Confirmation';
import { useDialogState } from '../ui/Dialog/useDialogState';
import { Modal } from '../ui/Modal';
import { Budget } from './budget.types';
import { BudgetForm, FormValues } from './BudgetForm';

type Props = {
  budget: Budget;
  transactions: Transaction[];
  onDelete: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
};

export function BudgetDetails({ budget, transactions, onDelete, onEdit }: Props) {
  const deleteConfirmDialog = useConfirmDialog({});
  const editingDialog = useDialogState({ animated: true });

  const { amount } = budget;
  const usedAmount = useMemo(() => {
    return transactions.reduce(
      (sum, transaction) => sum + Math.abs(Number(transaction.transactionAmount.amount)),
      0,
    );
  }, [transactions]);

  const transactionsByDate = useMemo(
    () => groupBy(transactions, (t) => t.bookingDate),
    [transactions],
  );

  const transactionDatesAsc = useMemo(
    () =>
      Object.keys(transactionsByDate)
        .reverse()
        .map((date) => format(new Date(date), 'd')),
    [transactionsByDate],
  );
  const categorizedAmountsForEachDay: Array<Partial<Record<CategoryName, number>>> = useMemo(() => {
    return Object.entries(transactionsByDate)
      .reverse() // Transactions are by most recent
      .map(([date, transactions]) => {
        const transactionsByCategory = groupBy(transactions, (t) => t.category);
        const totalAmountByCategory = Object.fromEntries(
          budget.categories.map((category) => {
            const transactions = transactionsByCategory[category] ?? [];
            const totalAmount = transactions.reduce(
              (sum, t) => sum + Math.abs(Number(t.transactionAmount.amount)),
              0,
            );
            return [category, totalAmount];
          }),
        );

        return totalAmountByCategory;
      });
  }, [transactionsByDate, budget.categories]);

  const chartColors = useMemo(
    () => budget.categories.map((category) => categoryMap[category].color),
    [budget.categories],
  );

  const handleDelete = () => {
    deleteConfirmDialog.show({
      onCancel: noop,
      onConfirm: () => onDelete(budget),
    });
  };

  const handleEditSave = (values: FormValues) => {
    editingDialog.hide();
    onEdit({ ...budget, ...values });
  };

  return (
    <Container sx={cardStyle}>
      <Heading as="h2">{budget.name}</Heading>
      <Flex sx={{ gap: [3] }}>
        <Button type="button" variant="link" onClick={handleDelete}>
          Delete
        </Button>
        <Button type="button" variant="link" onClick={editingDialog.show}>
          Edit
        </Button>
      </Flex>

      <Heading sx={{ fontSize: [4], fontWeight: 'normal', my: [5], textAlign: 'center' }}>
        <Currency amount={amount - usedAmount} currency="EUR" /> remaining
      </Heading>
      <Box>
        <Currency amount={usedAmount} currency="EUR" /> /{' '}
        <Currency amount={amount} currency="EUR" /> used
      </Box>

      {categorizedAmountsForEachDay.length && (
        <Box sx={{ height: '16rem', my: [4] }}>
          <ResponsiveStream
            data={categorizedAmountsForEachDay}
            keys={budget.categories}
            offsetType="none"
            colors={chartColors}
            enableGridY={false}
            enableGridX
            margin={{ top: 0, right: 5, bottom: 30, left: 5 }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              format: (i) => transactionDatesAsc[i],
            }}
            axisLeft={null}
          />
        </Box>
      )}

      <Heading as="h3" sx={{ mb: [3] }}>
        Transactions
      </Heading>

      <Grid>
        {Object.entries(transactionsByDate).map(([date, transactions]) => (
          <TransactionGroup
            date={date}
            transactions={transactions}
            renderTransaction={(transaction) => <TransactionInfo transaction={transaction} />}
            key={date}
          />
        ))}
      </Grid>

      <Confirmation {...deleteConfirmDialog}>
        <Text>Do you want to delete this Budget? The action is irreversible.</Text>
      </Confirmation>

      <Modal level="nested" aria-label="Edit budget" {...editingDialog}>
        <BudgetForm budget={budget} onSave={handleEditSave} />
      </Modal>
    </Container>
  );
}

const cardStyle: ThemeUICSSObject = {
  display: 'grid',
  gap: [3],
};
