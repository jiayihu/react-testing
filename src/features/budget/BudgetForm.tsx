import { useCallback, useEffect, useId, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Card, Container, Grid, Label } from 'theme-ui';
import { useAccounts } from '../account/useAccounts';
import { useSignedInUser } from '../auth/AuthContext';
import { categories, CategoryName } from '../category/category.types';
import { FormField } from '../ui/FormField';
import { CheckboxField } from '../ui/forms/CheckboxField';
import { InputField } from '../ui/forms/InputField';
import { RadioField } from '../ui/forms/RadioField';
import { SubmitButton } from '../ui/SubmitButton';
import { Budget, BudgetPeriod } from './budget.types';

export type FormValues = {
  name: string;
  accountIds: string[];
  period: BudgetPeriod;
  amount: number;
  categories: CategoryName[];
};

type Props = {
  budget: Budget | null;
  onSave: (values: FormValues) => void;
};

export function BudgetForm({ budget, onSave }: Props) {
  const user = useSignedInUser();
  const { data: accounts = [] } = useAccounts(user.uid);
  const defaultValues: FormValues = useMemo(() => {
    return {
      name: '',
      accountIds: accounts.map((account) => account.id),
      period: BudgetPeriod.Monthly,
      amount: 0,
      categories: categories.map((category) => category.name),
    };
  }, [accounts]);
  const { control, handleSubmit, reset, formState, getValues } = useForm<FormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset({ ...getValues(), accountIds: accounts.map((account) => account.id) });
  }, [reset, accounts, getValues]);

  const nameId = useId();
  const accountIds = useId();
  const periodId = useId();
  const amountId = useId();
  const categoriesId = useId();

  const onSubmit = useCallback(async (values: FormValues) => onSave(values), [onSave]);

  useEffect(() => {
    if (budget) {
      reset({
        name: budget.name,
        accountIds: budget.accountIds,
        period: budget.period,
        amount: budget.amount,
        categories: budget.categories,
      });
    } else {
      reset(defaultValues);
    }
  }, [reset, budget, accounts, defaultValues]);

  return (
    <Container>
      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <FormField>
          <Label htmlFor={nameId}>Name</Label>
          <InputField
            name="name"
            id={nameId}
            control={control}
            rules={{ required: 'This field is required' }}
          />
        </FormField>

        <fieldset>
          <legend>Period</legend>
          <Card>
            <Grid columns={['1fr 1fr']}>
              {Object.values(BudgetPeriod).map((period) => (
                <Box key={period}>
                  <Label htmlFor={`${periodId}-${period}`}>{period}</Label>
                  <RadioField
                    name="period"
                    control={control}
                    rules={{ required: 'This field is required' }}
                    id={`${periodId}-${period}`}
                    value={period}
                  />
                </Box>
              ))}
            </Grid>
          </Card>
        </fieldset>

        <FormField>
          <Label htmlFor={amountId}>Amount</Label>
          <InputField
            type="number"
            name="amount"
            control={control}
            rules={{
              required: 'This field is required',
              min: { value: 1, message: 'The value must be greater than 0' },
            }}
            id={amountId}
          />
        </FormField>

        <fieldset>
          <legend>Accounts</legend>
          <Card>
            {accounts.map((account, i) => (
              <Box key={account.id}>
                <Label htmlFor={`${accountIds}-${account.id}`}>{account.iban}</Label>
                <CheckboxField
                  name="accountIds"
                  control={control}
                  id={`${accountIds}-${account.id}`}
                  value={account.id}
                />
              </Box>
            ))}
          </Card>
        </fieldset>

        <fieldset>
          <legend>Categories</legend>
          <Card>
            <Grid columns={['1fr 1fr 1fr']}>
              {categories.map((category, i) => (
                <Box key={category.name}>
                  <Label htmlFor={`${categoriesId}-${category.name}`}>{category.name}</Label>
                  <CheckboxField
                    name={'categories'}
                    control={control}
                    id={`${categoriesId}-${category.name}`}
                    value={category.name}
                  />
                </Box>
              ))}
            </Grid>
          </Card>
        </fieldset>

        <Box sx={{ my: [4] }}>
          <SubmitButton isSubmitting={formState.isSubmitting} variant="secondary">
            Save
          </SubmitButton>
        </Box>
      </Box>
    </Container>
  );
}
