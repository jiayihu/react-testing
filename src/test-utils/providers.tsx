import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'theme-ui';
import { AuthProvider, AuthState, SignedIn, UninitializedAuth } from '../features/auth/AuthContext';
import { createUser } from '../features/auth/services/mocks/auth.fixtures';
import { store } from '../features/store/store';
import theme from '../theme';

export function QueryProvider(props: PropsWithRequiredChildren<unknown>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
}

type Props = {
  initialAuthState: AuthState;
};

export function ApplicationProviders(props: PropsWithRequiredChildren<Props>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      }),
  );

  return (
    <BrowserRouter>
      <Provider store={store}>
        <AuthProvider initialState={props.initialAuthState}>
          <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
          </ThemeProvider>
        </AuthProvider>
      </Provider>
    </BrowserRouter>
  );
}

export function SignedInApplicationProviders(props: PropsWithRequiredChildren<unknown>) {
  const authState: SignedIn = useMemo(() => {
    const user = createUser();
    return {
      kind: 'SIGNED_IN',
      user,
    };
  }, []);

  return <ApplicationProviders initialAuthState={authState}>{props.children}</ApplicationProviders>;
}

export function SignedOutApplicationProviders(props: PropsWithRequiredChildren<unknown>) {
  const authState: UninitializedAuth = useMemo(() => {
    return {
      kind: 'UNINITIALIZED',
    };
  }, []);

  return <ApplicationProviders initialAuthState={authState}>{props.children}</ApplicationProviders>;
}
