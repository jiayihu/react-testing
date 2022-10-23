import { Box } from 'theme-ui';

export function FormField(props: PropsWithRequiredChildren<unknown>) {
  return <Box sx={{ my: [3] }}>{props.children}</Box>;
}
