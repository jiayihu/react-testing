import { render, screen } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, AuthState } from '../AuthContext';
import { RequireAuth } from '../RequireAuth';
import { createUser } from '../services/mocks/auth.fixtures';

function App(props: PropsWithRequiredChildren<unknown>) {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/authenticate' && props.children}
      <LocationDisplay />
    </>
  );
}

function LocationDisplay() {
  const location = useLocation();

  return <div>{location.pathname}</div>;
}

function renderWithAuthState(initialAuthState: AuthState) {
  function Wrapper(props: PropsWithRequiredChildren<unknown>) {
    return (
      <BrowserRouter>
        <AuthProvider initialState={initialAuthState}>
          <App>{props.children}</App>
        </AuthProvider>
      </BrowserRouter>
    );
  }

  render(<RequireAuth>Protected content</RequireAuth>, { wrapper: Wrapper });
}

describe('RequireAuth', () => {
  it('Should render the children if signed in', () => {
    renderWithAuthState({ kind: 'SIGNED_IN', user: createUser() });

    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });

  it('Should be loading while assessing if the user is signed in', () => {
    renderWithAuthState({ kind: 'UNINITIALIZED' });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('Should redirect to /authenticate if not signed in', () => {
    renderWithAuthState({ kind: 'SIGNED_OUT', user: null });

    expect(screen.getByText(/authenticate/i)).toBeInTheDocument();
  });
});

// function Wrapper(props: PropsWithRequiredChildren<Props>) {
//   return (
//     <BrowserRouter>
//       <AuthProvider initialState={props.initialAuthState}>
//         <App>{props.children}</App>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// function SignedInWrapper(props: PropsWithRequiredChildren<unknown>) {
//   return (
//     <Wrapper initialAuthState={{ kind: 'SIGNED_IN', user: createUser() }}>{props.children}</Wrapper>
//   );
// }

// function UninitializedWrapper(props: PropsWithRequiredChildren<unknown>) {
//   return <Wrapper initialAuthState={{ kind: 'UNINITIALIZED' }}>{props.children}</Wrapper>;
// }

// function SignedOutWrapper(props: PropsWithRequiredChildren<unknown>) {
//   return <Wrapper initialAuthState={{ kind: 'SIGNED_OUT', user: null }}>{props.children}</Wrapper>;
// }
