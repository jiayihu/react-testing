import { act, renderHook, waitFor } from '@testing-library/react';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { AuthUser } from '../auth.types';
import { AuthProvider, isSignedIn, isSignedOut, useAuth } from '../AuthContext';
import { createUser } from '../services/mocks/auth.fixtures';
import { usePersistedAuth } from '../usePersistedAuth';

jest.mock('firebase/auth');
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');

  return {
    __esModule: true,
    ...originalModule,
    useLocation: jest.fn(() => {
      return {};
    }),
    useNavigate: jest.fn().mockReturnValue(jest.fn()),
  };
});

function App(props: PropsWithRequiredChildren<unknown>) {
  usePersistedAuth();

  return <>{props.children}</>;
}

function Wrapper(props: PropsWithRequiredChildren<unknown>) {
  return (
    <BrowserRouter>
      <AuthProvider initialState={{ kind: 'UNINITIALIZED' }}>
        <App>{props.children}</App>
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('usePersistedAuth + useAuth', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should sign in the user', async () => {
    const onAuthStateChangedRef = setupOnAuthStateChanged();

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(onAuthStateChangedRef.current).not.toBe(null));

    act(() => {
      onAuthStateChangedRef.current && onAuthStateChangedRef.current(createUser());
    });

    expect(isSignedIn(result.current.authState)).toBe(true);
  });

  it('Should redirect the user to the original route on sign-in', async () => {
    const onAuthStateChangedRef = setupOnAuthStateChanged();

    const previousRoute = '/originalRoute';
    (useLocation as jest.Mock).mockReturnValue({ state: { from: { pathname: previousRoute } } });

    const navigateSpy = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateSpy);

    renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(onAuthStateChangedRef.current).not.toBe(null));

    act(() => {
      onAuthStateChangedRef.current && onAuthStateChangedRef.current(createUser());
    });

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(previousRoute);
  });

  it('Should redirect to homepage if landed on /authenticate directly', async () => {
    const onAuthStateChangedRef = setupOnAuthStateChanged();

    (useLocation as jest.Mock).mockReturnValue({ pathname: '/authenticate' });

    const navigateSpy = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateSpy);

    renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(onAuthStateChangedRef.current).not.toBe(null));

    act(() => {
      onAuthStateChangedRef.current && onAuthStateChangedRef.current(createUser());
    });

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith('/');
  });

  it('Should remain in the current route if landing on authenticated route', async () => {
    const onAuthStateChangedRef = setupOnAuthStateChanged();

    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });

    const navigateSpy = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateSpy);

    renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(onAuthStateChangedRef.current).not.toBe(null));

    act(() => {
      onAuthStateChangedRef.current && onAuthStateChangedRef.current(createUser());
    });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('Should sign out and redirect to /authenticate', async () => {
    const onAuthStateChangedRef = setupOnAuthStateChanged();

    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });

    const navigateSpy = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateSpy);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(onAuthStateChangedRef.current).not.toBe(null));

    act(() => {
      onAuthStateChangedRef.current && onAuthStateChangedRef.current(null);
    });

    expect(isSignedOut(result.current.authState)).toBe(true);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith('/authenticate');
  });
});

function setupOnAuthStateChanged() {
  const ref: { current: ((user: AuthUser | null) => void) | null } = { current: null };

  (onAuthStateChanged as jest.Mock).mockImplementation((_auth, fn) => {
    ref.current = fn;
  });

  return ref;
}
