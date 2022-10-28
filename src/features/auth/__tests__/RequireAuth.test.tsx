import { render, screen } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, AuthState } from '../AuthContext';
import { RequireAuth } from '../RequireAuth';
import { createUser } from '../services/mocks/auth.fixtures';

function LocationDisplay() {
  const location = useLocation();

  return <div data-testid="location-display">{location.pathname}</div>;
}

function App(props: PropsWithRequiredChildren<unknown>) {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/authenticate' && props.children}
      <LocationDisplay />
    </>
  );
}

function renderWithWrapper(initialAuthState: AuthState) {
  function Wrapper(props: PropsWithRequiredChildren<unknown>) {
    return (
      <BrowserRouter>
        <AuthProvider initialState={initialAuthState}>
          <App>{props.children}</App>
        </AuthProvider>
      </BrowserRouter>
    );
  }

  render(<RequireAuth>Protected content</RequireAuth>, {
    wrapper: Wrapper,
  });
}

describe('RequireAuth', () => {
  it('Should render the children if signed in', () => {
    renderWithWrapper({ kind: 'SIGNED_IN', user: createUser() });

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });

  it('Should be loading while assessing if the user is signed in', () => {
    renderWithWrapper({ kind: 'UNINITIALIZED' });

    expect(screen.getByRole('heading', { name: /skei/i })).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('Should redirect to /authenticate if not signed in', () => {
    renderWithWrapper({ kind: 'SIGNED_OUT', user: null });

    expect(screen.getByText(/authenticate/i)).toBeInTheDocument();
  });
});
