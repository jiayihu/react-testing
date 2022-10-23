import { FieldPath, FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { Alert, Checkbox, CheckboxProps, Grid } from 'theme-ui';

type Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = UseControllerProps<TFieldValues, TName> & CheckboxProps;

export function CheckboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, control, rules, ...inputProps }: Props<TFieldValues, TName>) {
  const { field, fieldState } = useController({ name, control, rules });

  return (
    <Grid>
      <Checkbox
        type="checkbox"
        {...inputProps}
        checked={field.value.includes(inputProps.value)}
        ref={field.ref}
        onChange={(event) => {
          field.onChange(
            event.target.checked
              ? [...field.value, inputProps.value]
              : field.value.filter((x: string | number) => x !== inputProps.value),
          );
        }}
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
