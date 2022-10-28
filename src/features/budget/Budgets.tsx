import { useQueryClient } from '@tanstack/react-query';
import { MouseEvent, useCallback, useMemo, useState } from 'react';
import { Alert, Box, Button, Divider, Grid, Heading } from 'theme-ui';
import { v4 as uuidv4 } from 'uuid';
import { useAccounts } from '../account/useAccounts';
import { useSignedInUser } from '../auth/AuthContext';
import { Transaction } from '../transactions/transaction.types';
import { useTransactions } from '../transactions/useTransactions';
import { Clickable } from '../ui/abstract/Clickable';
import { DialogDisclosure } from '../ui/Dialog/DialogDisclosure';
import { useDialogState } from '../ui/Dialog/useDialogState';
import { Modal } from '../ui/Modal';
import { Spinner } from '../ui/Spinner/Spinner';
import { Budget } from './budget.types';
import { BudgetDetails } from './BudgetDetails';
import { BudgetForm, FormValues } from './BudgetForm';
import { BudgetInfo } from './BudgetInfo';
import { addBudget, deleteBudget, updateBudget } from './services/budgets.firebase';
import { budgetsQueryKey, useBudgets } from './useBudgets';

export function Budgets() {
  const user = useSignedInUser();
  const queryClient = useQueryClient();
  const { data: accounts = [] } = useAccounts(user.uid);
  const {
    isLoading: isLoadingTransactions,
    transactionsByAccount,
    isSuccess: isSuccessLoadingTransactions,
    error: transactionsError,
  } = useTransactions(user.uid, accounts);
  const {
    isLoading: isLoadingBudgets,
    data: budgets = [],
    isSuccess: isSuccessLoadingBudgets,
    error: budgetsError,
  } = useBudgets(user.uid);

  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const selectedBudget = useMemo(
    () => budgets.find((budget) => budget.id === selectedBudgetId),
    [budgets, selectedBudgetId],
  );
  const budgetDetailsDialog = useDialogState({ animated: true });

  const budgetFormDialog = useDialogState({ animated: true });

  const transactionsByBudget = useMemo(() => {
    return budgets.reduce((map, budget) => {
      const budgetTransactions = budget.accountIds.flatMap((accountId) => {
        const transactions = transactionsByAccount[accountId] ?? [];
        return transactions.filter((transaction) => {
          return (
            !transaction.exclude &&
            Number(transaction.transactionAmount.amount) < 0 &&
            transaction.category &&
            budget.categories.includes(transaction.category)
          );
        });
      });
      map.set(budget.id, budgetTransactions);

      return map;
    }, new Map<string, Transaction[]>());
  }, [budgets, transactionsByAccount]);

  const transactionsWithoutCategory = useMemo(() => {
    return Object.values(transactionsByAccount)
      .flat()
      .filter((transaction) => !transaction.category);
  }, [transactionsByAccount]);

  const handleBudgetSave = async (values: FormValues) => {
    budgetFormDialog.hide();

    await addBudget(user.uid, {
      id: uuidv4(),
      ...values,
    });

    queryClient.invalidateQueries([budgetsQueryKey]);
  };

  const handleBudgetDialogClose = useCallback(() => {
    setSelectedBudgetId(null);
  }, []);

  const handleBudgetDelete = async (budget: Budget) => {
    budgetDetailsDialog.hide();
    setSelectedBudgetId(null);

    await deleteBudget(user.uid, budget.id);
    queryClient.invalidateQueries([budgetsQueryKey]);
  };

  const handleBudgetEdit = async (budget: Budget) => {
    await updateBudget(user.uid, budget.id, budget);
    queryClient.invalidateQueries([budgetsQueryKey]);
  };

  return (
    <Box>
      <Heading as="h2">Budgets</Heading>

      {isLoadingTransactions || isLoadingBudgets ? (
        <Spinner />
      ) : isSuccessLoadingTransactions && isSuccessLoadingBudgets ? (
        <>
          <Grid gap={[3]} sx={{ my: [3] }}>
            {budgets.map((budget) => (
              <DialogDisclosure {...budgetDetailsDialog} key={budget.id}>
                {(props) => (
                  <Clickable
                    {...props}
                    onClick={(e: MouseEvent<HTMLDivElement>) => {
                      setSelectedBudgetId(budget.id);
                      props.onClick && props.onClick(e);
                    }}
                    aria-label={`Budget ${budget.name}`}
                  >
                    <BudgetInfo
                      budget={budget}
                      transactions={transactionsByBudget.get(budget.id) ?? []}
                      key={budget.id}
                    />
                  </Clickable>
                )}
              </DialogDisclosure>
            ))}
          </Grid>
          <Box sx={{ color: 'muted' }}>
            {transactionsWithoutCategory.length} transactions without category.
          </Box>
        </>
      ) : transactionsError ?? budgetsError ? (
        <Alert role="alert" variant="error">{`${transactionsError ?? budgetsError}`}</Alert>
      ) : null}

      {selectedBudget && (
        <Modal
          level="base"
          aria-label="Budget details"
          onClose={handleBudgetDialogClose}
          {...budgetDetailsDialog}
        >
          <BudgetDetails
            budget={selectedBudget}
            transactions={transactionsByBudget.get(selectedBudget.id) ?? []}
            onDelete={handleBudgetDelete}
            onEdit={handleBudgetEdit}
          />
        </Modal>
      )}

      <Divider />

      <DialogDisclosure as={Button} variant="secondary" {...budgetFormDialog}>
        Add new budget
      </DialogDisclosure>
      <Modal level="base" aria-label="Add new budget" {...budgetFormDialog}>
        <BudgetForm budget={null} onSave={handleBudgetSave} />
      </Modal>
    </Box>
  );
}
