import { useMemo } from 'react';
import { Card, Flex, Heading, Progress, Text, ThemeUICSSObject } from 'theme-ui';
import { Currency } from '../misc/currency/Currency';
import { Transaction } from '../transactions/transaction.types';
import { Budget } from './budget.types';

type Props = {
  budget: Budget;
  transactions: Transaction[];
};

export function BudgetInfo({ budget, transactions }: Props) {
  const { amount } = budget;
  const usedAmount = useMemo(() => {
    return transactions.reduce(
      (sum, transaction) => sum + Math.abs(Number(transaction.transactionAmount.amount)),
      0,
    );
  }, [transactions]);

  const percentage = usedAmount / amount;

  return (
    <Card sx={cardStyle}>
      <Flex sx={{ justifyContent: 'space-between', fontWeight: 'bold' }}>
        <Heading as="h3">{budget.name}</Heading>
        <Text sx={{ fontSize: [2] }}>
          <Currency amount={usedAmount} currency="EUR" />
        </Text>
      </Flex>
      <Flex sx={{ justifyContent: 'center' }}>
        <Progress value={Math.min(percentage, 1)} />
      </Flex>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Text>{Math.round(percentage * 100)}%</Text>
        <Currency amount={amount - usedAmount} currency="EUR" /> remaining
      </Flex>
    </Card>
  );
}

const cardStyle: ThemeUICSSObject = {
  display: 'grid',
  gap: [3],
  py: [4],
};
