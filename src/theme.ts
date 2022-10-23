import { makeTheme } from '@theme-ui/css/utils';
import { ThemeUICSSObject } from 'theme-ui';

const heading = {
  color: 'text',
  fontFamily: 'heading',
  lineHeight: 'heading',
  fontWeight: 'heading',
};

const buttonSvg: ThemeUICSSObject = {
  marginInlineEnd: [1],
  verticalAlign: 'bottom',
};

export const theme = makeTheme({
  breakpoints: ['576px', '768px', '992px', '1200px'],
  space: [0, 4, 8, 16, 24, 32, 64, 128, 256, 512],
  fonts: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
    montserrat: "'Montserrat', sans-serif",
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 600,
    bold: 600,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  sizes: {
    sm: 540,
    md: 720,
    lg: 960,
    xl: 1140,
    container: 768,
  },
  colors: {
    text: '#222',
    textInverse: '#fff',
    background: '#fff',
    backgroundInverse: '#222',
    primary: '#CDE713',
    secondary: '#024750',
    error: '#FA6F68',
    muted: '#6c757d',

    gray: [
      '#fff',
      '#f8f9fa',
      '#e9ecef',
      '#dee2e6',
      '#ced4da',
      '#adb5bd',
      '#6c757d',
      '#495057',
      '#343a40',
      '#212529',
    ],
  },
  shadows: {
    default: '0 .5rem 1rem rgba(0, 0, 0, .15)',
    sm: '0 .125rem .25rem rgba(0, 0, 0, .075)',
    lg: '0 1rem 3rem rgba(0, 0, 0, .175)',
  },
  radii: {
    default: '0.5rem',
    sm: '0.25rem',
    lg: '0.875rem',
    pill: '50rem',
  },
  zIndices: [-1, 0, 1, 9, 99, 999],
  alerts: {
    primary: {
      color: 'backgroundInverse',
      bg: 'primary',
    },
    error: {
      color: 'background',
      bg: 'error',
    },
  },
  cards: {
    primary: {
      bg: 'gray.1',
      padding: 2,
      borderRadius: 4,
      boxShadow: 'sm',
    },
    compact: {
      padding: 1,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'muted',
    },
  },
  buttons: {
    primary: {
      color: 'text',
      borderRadius: 'lg',
      display: 'block',
      fontWeight: 'bold',
      py: 12,
      textTransform: 'uppercase',
      width: '100%',

      svg: buttonSvg,
    },
    secondary: {
      bg: 'secondary',
      color: 'textInverse',
      borderRadius: 'lg',
      display: 'block',
      fontWeight: 'bold',
      py: 12,
      textTransform: 'uppercase',
      width: '100%',

      svg: buttonSvg,
    },
    link: {
      backgroundColor: 'transparent',
      color: 'secondary',
      fontWeight: 'bold',
      p: [0],
      textDecoration: 'none',

      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
  forms: {
    checkbox: {
      '&:focus': {
        borderColor: 'secondary',
      },
    },
    input: {
      borderRadius: 'default',
      '&:focus': {
        borderColor: 'secondary',
      },
      '&:invalid': {
        borderColor: 'error',
      },
    },
    label: {
      fontWeight: 'bold',
      mb: [2],
    },
    select: {
      width: 'max-content',
    },
  },
  images: {
    background: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: -1,
    },
  },
  layout: {
    container: {
      px: 3,
    },
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      fontSize: [1],
    },
    h1: {
      ...heading,
      fontSize: 5,
    },
    h2: {
      ...heading,
      fontSize: 4,
    },
    h3: {
      ...heading,
      fontSize: 3,
    },
    h4: {
      ...heading,
      fontSize: 2,
    },
    h5: {
      ...heading,
      fontSize: 1,
    },
    h6: {
      ...heading,
      fontSize: 0,
    },
    p: {
      color: 'text',
      fontFamily: 'body',
      fontWeight: 'body',
      lineHeight: 'body',
    },
    a: {
      color: 'secondary',
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      code: {
        color: 'inherit',
      },
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    th: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
    td: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
    img: {
      maxWidth: '100%',
    },
    hr: {
      borderColor: 'gray.2',
      my: [4],
    },
  },
});

export default theme;
