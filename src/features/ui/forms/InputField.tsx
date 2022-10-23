import { FieldPath, FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { Alert, Grid, Input, InputProps } from 'theme-ui';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName> & InputProps;

export function InputField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, control, rules, ...inputProps }: Props<TFieldValues, TName>) {
  const { field, fieldState } = useController({ name, control, rules });
  return (
    <Grid gap={[1]}>
      <Input {...inputProps} {...field} />
      {fieldState.error && (
        <Alert role="alert" variant="error">
          {fieldState.error.message}
        </Alert>
      )}
    </Grid>
  );
}
