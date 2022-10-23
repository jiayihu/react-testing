import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { noop } from '../../utils';
import { AuthUser } from './auth.types';

type UninitializedAuth = {
  kind: 'UNINITIALIZED';
};
type SignedIn = {
  kind: 'SIGNED_IN';
  user: AuthUser;
};
type SignedOut = {
  kind: 'SIGNED_OUT';
  user: null;
};

type AuthState = UninitializedAuth | SignedIn | SignedOut;

export const isSignedIn = (authState: AuthState): authState is SignedIn => {
  return authState.kind === 'SIGNED_IN';
};

export const isSignedOut = (authState: AuthState): authState is SignedOut => {
  return authState.kind === 'SIGNED_OUT';
};

export type AuthContextValue = {
  authState: AuthState;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  authState: { kind: 'UNINITIALIZED' },
  signIn: noop,
  signOut: noop,
});

export function AuthProvider(props: PropsWithRequiredChildren<unknown>) {
  const [authState, setAuthState] = useState<AuthState>({ kind: 'UNINITIALIZED' });

  const signIn = useCallback((user: AuthUser) => {
    setAuthState({ kind: 'SIGNED_IN', user });
  }, []);

  const signOut = useCallback(() => {
    setAuthState({ kind: 'SIGNED_OUT', user: null });
  }, []);

  const value = useMemo(() => {
    return {
      authState,
      signIn,
      signOut,
    };
  }, [authState, signIn, signOut]);

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useSignedInUser() {
  const { authState } = useAuth();

  if (!isSignedIn(authState)) {
    throw new Error('Cannot useSignedInUser without being authenticated');
  }

  return authState.user;
}
