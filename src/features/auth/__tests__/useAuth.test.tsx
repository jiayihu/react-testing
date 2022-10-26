import { act, renderHook, waitFor } from '@testing-library/react';
import { onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter } from 'react-router-dom';
import { AuthUser } from '../auth.types';
import { AuthProvider, isSignedIn, useAuth } from '../AuthContext';
import { createUser } from '../services/mocks/auth.fixtures';
import { usePersistedAuth } from '../usePersistedAuth';

jest.mock('firebase/auth');

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
  it('Should sign in the user', async () => {
    let callback = null as ((user: AuthUser | null) => void) | null;

    (onAuthStateChanged as jest.Mock).mockImplementation((_auth, fn) => {
      callback = fn;
    });

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => expect(callback).not.toBe(null));

    act(() => {
      if (!callback) {
        throw new Error('Undefined callback');
      }

      callback(createUser());
    });

    expect(isSignedIn(result.current.authState)).toBe(true);
  });
});
