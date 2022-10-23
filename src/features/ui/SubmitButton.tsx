import { Button, ButtonProps, Spinner } from 'theme-ui';

type Props = { isSubmitting: boolean } & ButtonProps;

export function SubmitButton({ isSubmitting, disabled, children, variant, ...buttonProps }: Props) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting || disabled}
      variant={variant ?? 'primary'}
      {...buttonProps}
    >
      {isSubmitting ? <Spinner variant={variant} size="1em" title="Submitting" /> : children}
    </Button>
  );
}
