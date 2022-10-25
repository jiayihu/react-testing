import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Card, Flex, Text, ThemeUICSSObject } from 'theme-ui';
import { Currency } from '../../misc/currency/Currency';
import { Icons } from '../../ui/Icons';
import { Spinner } from '../../ui/Spinner/Spinner';
import { BankAccount } from '../account.types';
import { getAccountBalances } from '../services/accounts.nordigen';
import background from './background.png';
import { getInstitution } from './services/institutions.nordigen';

type Props = {
  account: BankAccount;
};

export function BankAccountInfo({ account }: Props) {
  const {
    isLoading: isLoadingInstitution,
    data: institution,
    error: institutionError,
  } = useQuery(['getInstitution', account.institutionId], () =>
    getInstitution(account.institutionId),
  );
  const {
    isLoading: isLoadingBalances,
    data: balance,
    error: balancesError,
  } = useQuery(['getAccountBalances', account.id], () => getAccountBalances(account.id), {
    select: (balances) =>
      balances.find((balance) => balance.balanceType === 'interimAvailable') ?? balances[0] ?? null,
  });

  return (
    <Card sx={cardStyle}>
      {isLoadingInstitution || isLoadingBalances ? (
        <Spinner />
      ) : institution ? (
        <>
          <Box sx={{ flex: 1, p: [3] }}>{institution.name}</Box>
          <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', p: [3] }}>
            <Box sx={ibanStyle}>{account.iban}</Box>
            <Icons name="bank" />
          </Flex>
          {balance && (
            <Box sx={{ bg: 'whitesmoke', borderRadius: 'default', p: [3] }}>
              <Text sx={{ fontSize: [0], marginInlineEnd: [2] }}>Balance</Text>
              <Text>
                <Currency {...balance.balanceAmount} />
              </Text>
            </Box>
          )}
        </>
      ) : (
        <Alert role="alert" variant="error">{`${institutionError ?? balancesError}`}</Alert>
      )}
    </Card>
  );
}

const cardStyle: ThemeUICSSObject = {
  backgroundImage: `url(${background})`,
  backgroundSize: 'cover',
  border: '1px solid',
  borderColor: 'gray.3',
  borderRadius: 'default',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  height: ['14rem', '16rem'],
  overflow: 'hidden',
  position: 'relative',
  mb: [3],
  textTransform: 'uppercase',
};

const ibanStyle: ThemeUICSSObject = {};
