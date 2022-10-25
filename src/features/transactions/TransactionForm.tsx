import { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import {
  Box,
  Card,
  Container,
  Flex,
  Heading,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
  ThemeUICSSObject,
} from 'theme-ui';
import { Account } from '../account/account.types';
import { useSignedInUser } from '../auth/AuthContext';
import { categories, CategoryName } from '../category/category.types';
import { Currency } from '../misc/currency/Currency';
import { SubmitButton } from '../ui/SubmitButton';
import { updateAccountTransaction } from './services/transactions.firebase';
import { requestAccountTransactions } from './store/transactions.actions';
import { IdentityName, Transaction, TransactionKind } from './transaction.types';

type Props = {
  transaction: Transaction;
  account: Account;
  onSave: () => void;
};

const getDestinationName = (t: Transaction): string => {
  switch (t.kind) {
    case TransactionKind.Payment:
      return t.creditorName;
    case TransactionKind.Transfer:
      return t.debtorName;
    case TransactionKind.Unknown:
      return IdentityName.Unknown;
  }
};

type FormValues = {
  categoryName: CategoryName;
  exclude: boolean;
  description: string;
};

export function TransactionDetails({ transaction, account, onSave }: Props) {
  const dispatch = useDispatch();
  const user = useSignedInUser();
  const switchId = useId();
  const descriptionId = useId();
  const { register, handleSubmit, formState, reset } = useForm<FormValues>();

  useEffect(() => {
    reset({
      categoryName: transaction.category ?? undefined,
      exclude: transaction.exclude ?? false,
      description: transaction.information.description ?? '',
    });
  }, [reset, transaction]);

  const onSubmit = async (form: FormValues) => {
    await updateAccountTransaction(user.uid, account.id, transaction.transactionId, {
      information: {
        ...transaction.information,
        description: form.description,
      },
      category: form.categoryName ?? null,
      exclude: form.exclude,
    });

    dispatch(requestAccountTransactions(user.uid, account.id, { skipUpdate: true }));

    onSave();
  };

  return (
    <Container>
      <Heading as="h3">{getDestinationName(transaction)}</Heading>
      <Box>
        {new Date(transaction.bookingDate).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <dl>
          <Flex sx={detailsGridStyle}>
            <Card sx={dataGroupStyle}>
              <Box sx={dataLineStyle}>
                <dt>Account</dt>
                <dd>{account.institutionId}</dd>
              </Box>
              <Box sx={dataLineStyle}>
                <dt>IBAN</dt>
                <dd>{account.iban}</dd>
              </Box>
            </Card>

            <Card sx={dataGroupStyle}>
              <Box sx={dataLineStyle}>
                <dt>Amount</dt>
                <dd>
                  <Text sx={{ fontWeight: 'bold', fontSize: [2] }}>
                    <Currency {...transaction.transactionAmount} />
                  </Text>
                </dd>
              </Box>
              <Box sx={dataLineStyle}>
                <dt>Value date</dt>
                <dd>
                  {new Date(transaction.valueDate).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </dd>
              </Box>
            </Card>

            <Card sx={dataGroupStyle}>
              <Box sx={dataLineStyle}>
                <dt>Category</dt>
                <dd>
                  <Select {...register('categoryName')}>
                    <option disabled value="choose">
                      Choose a category
                    </option>
                    {categories.map((cat) => (
                      <option value={cat.name} key={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </dd>
              </Box>
              <Box sx={dataLineStyle}>
                <Label htmlFor={switchId} sx={{ flex: 1 }}>
                  Exclude from statistics
                </Label>
                <Box>
                  <Switch {...register('exclude')} id={switchId} />
                </Box>
              </Box>
            </Card>

            <Card sx={dataGroupStyle}>
              <Box>
                <Label htmlFor={descriptionId} sx={{ pb: [2] }}>
                  Description
                </Label>
                <Textarea
                  {...register('description')}
                  id={descriptionId}
                  rows={2}
                  sx={{ resize: 'vertical' }}
                />
              </Box>
            </Card>
          </Flex>
        </dl>

        {formState.isDirty && (
          <Box>
            <SubmitButton isSubmitting={formState.isSubmitting} variant="secondary">
              Save
            </SubmitButton>
          </Box>
        )}
      </form>
    </Container>
  );
}

const detailsGridStyle: ThemeUICSSObject = {
  flexDirection: 'column',
  gap: [4],
};

const dataGroupStyle: ThemeUICSSObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: [3],
  p: [3],
};

const dataLineStyle: ThemeUICSSObject = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
};
