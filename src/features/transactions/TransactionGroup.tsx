import { formatRelative, startOfDay } from 'date-fns';
import { cloneElement, ReactElement } from 'react';
import { Box, Flex, Text, ThemeUICSSObject } from 'theme-ui';
import { relativeDateLocale } from '../../utils';
import { Currency } from '../misc/currency/Currency';
import { Transaction } from './transaction.types';

type Props = {
  date: string;
  transactions: Transaction[];
  renderTransaction: (transaction: Transaction) => ReactElement;
};

export function TransactionGroup({ date, transactions, renderTransaction }: Props) {
  return (
    <Box>
      <Flex sx={transactionGroupHeaderStyle}>
        <Text>
          {formatRelative(startOfDay(new Date(date)), new Date(), {
            locale: relativeDateLocale,
          })}
        </Text>
        <Text>
          <Currency
            amount={transactions.reduce((sum, t) => sum + Number(t.transactionAmount.amount), 0)}
            currency={transactions[0].transactionAmount.currency}
          />
        </Text>
      </Flex>
      <Box sx={transactionsStyle}>
        {transactions.map((transaction) => {
          const element = renderTransaction(transaction);

          return cloneElement(element, {
            ...element.props,
            key: transaction.transactionId,
          });
        })}
      </Box>
    </Box>
  );
}

const transactionGroupHeaderStyle: ThemeUICSSObject = {
  alignItems: 'center',
  borderBottom: '1px solid',
  borderColor: 'gray.2',
  fontSize: [0],
  justifyContent: 'space-between',
  pb: [2],
  textTransform: 'uppercase',
};

const transactionsStyle: ThemeUICSSObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: [4],
  my: [4],
};
