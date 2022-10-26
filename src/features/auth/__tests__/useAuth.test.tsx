import { act, renderHook, waitFor } from '@testing-library/react';
import { onAuthStateChanged } from 'firebase/auth';
import { MutableRefObject } from 'react';
import { BrowserRouter, Location, useLocation, useNavigate } from 'react-router-dom';
import { AuthUser } from '../auth.types';
import { AuthProvider, isSignedIn, useAuth } from '../AuthContext';
import { createUser } from '../services/mocks/auth.fixtures';
import { usePersistedAuth } from '../usePersistedAuth';

jest.mock('firebase/auth');
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');

  return {
    __esModule: true,
    ...originalModule,
    useLocation: jest.fn().mockReturnValue({}),
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
      if (!onAuthStateChangedRef.current) {
        throw new Error('Undefined callback');
      }

      onAuthStateChangedRef.current(createUser());
    });

    expect(isSignedIn(result.current.authState)).toBe(true);
  });

  it('Should redirect the user to the original route on sign-in', async () => {
    const previousRoute = '/originalRoute';

    const onAuthStateChangedRef = setupOnAuthStateChanged();
    const navigate = setupRouteLocation({
      state: { from: { pathname: previousRoute } },
    } as Location);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(onAuthStateChangedRef.current).not.toBe(null));

    act(() => {
      if (!onAuthStateChangedRef.current) {
        throw new Error('Undefined callback');
      }

      onAuthStateChangedRef.current(createUser());
    });

    expect(isSignedIn(result.current.authState)).toBe(true);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(previousRoute);
  });

  it('Should redirect to homepage if landed on /authenticate directly', async () => {
    const onAuthStateChangedRef = setupOnAuthStateChanged();
    const navigate = setupRouteLocation({ pathname: '/authenticate' } as Location);

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(onAuthStateChangedRef.current).not.toBe(null));

    act(() => {
      if (!onAuthStateChangedRef.current) {
        throw new Error('Undefined callback');
      }

      onAuthStateChangedRef.current(createUser());
    });

    expect(isSignedIn(result.current.authState)).toBe(true);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/');
  });
});

function setupOnAuthStateChanged() {
  const ref: MutableRefObject<((user: AuthUser | null) => void) | null> = { current: null };

  (onAuthStateChanged as jest.Mock).mockImplementation((_auth, fn) => {
    ref.current = fn;
  });

  return ref;
}

function setupRouteLocation(initialLocation: Location) {
  (useLocation as jest.Mock).mockReturnValue(initialLocation);

  const navigateSpy = jest.fn();
  (useNavigate as jest.Mock).mockReturnValue(navigateSpy);

  return navigateSpy;
}
