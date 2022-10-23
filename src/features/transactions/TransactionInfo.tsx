import { darken } from '@theme-ui/color';
import { Box, ThemeUICSSObject } from 'theme-ui';
import { categoryMap } from '../category/category.types';
import { CategoryIcon } from '../category/CategoryIcon';
import { Currency } from '../misc/currency/Currency';
import { Transaction, TransactionKind } from './transaction.types';

type Props = { transaction: Transaction };

export function TransactionInfo({ transaction }: Props) {
  const category = transaction.category ? categoryMap[transaction.category] : null;

  if (transaction.kind === TransactionKind.Payment) {
    return (
      <Box sx={containerStyle}>
        <CategoryIcon category={category} defaultIcon="plus-slash-minus" />
        <Box sx={{ flex: 1 }}>
          <Box>{transaction.creditorName}</Box>
        </Box>
        <Box sx={{ fontWeight: 'bold' }}>
          <Currency {...transaction.transactionAmount} />
        </Box>
      </Box>
    );
  }

  if (transaction.kind === TransactionKind.Transfer) {
    return (
      <Box sx={containerStyle}>
        <CategoryIcon category={category} defaultIcon="arrow-left-right" />
        <Box sx={{ flex: 1 }}>
          <Box>{transaction.debtorName}</Box>
        </Box>
        <Box sx={{ color: darken('primary', 0.1), fontWeight: 'bold' }}>
          <Currency {...transaction.transactionAmount} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={containerStyle}>
      <CategoryIcon category={category} defaultIcon="plus-slash-minus" />
      <Box sx={{ flex: 1 }}>
        <Box sx={{ fontWeight: 'bold' }}>{transaction.information.description ?? 'Unknown'}</Box>
      </Box>
      <Box>
        <Currency {...transaction.transactionAmount} />
      </Box>
    </Box>
  );
}

const containerStyle: ThemeUICSSObject = {
  alignItems: 'center',
  display: 'flex',
  gap: [3],
};
