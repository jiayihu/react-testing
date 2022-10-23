import { Heading, Text, ThemeUICSSObject } from 'theme-ui';

export function Logo() {
  return (
    <Heading as="h1" sx={style}>
      Skei
      <Text sx={{ color: 'primary' }}>.</Text>
    </Heading>
  );
}

const style: ThemeUICSSObject = {
  fontFamily: 'montserrat',
  fontWeight: 'heading',
  fontSize: [6],
  my: [3],
};
