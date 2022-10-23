import { FieldPath, FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { Alert, Grid, Radio, RadioProps } from 'theme-ui';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName> & RadioProps;

export function RadioField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, control, rules, ...inputProps }: Props<TFieldValues, TName>) {
  const { field, fieldState } = useController({ name, control, rules });
  return (
    <Grid>
      <Radio
        {...inputProps}
        checked={field.value === inputProps.value}
        ref={field.ref}
        onChange={(event) => field.onChange(inputProps.value)}
        onBlur={() => field.onBlur()}
      />
      {fieldState.error && (
        <Alert role="alert" variant="error">
          {fieldState.error.message}
        </Alert>
      )}
    </Grid>
  );
}
