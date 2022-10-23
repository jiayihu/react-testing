import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import { auth } from './auth.service';
import { useAuth } from './AuthContext';

export function usePersistedAuth() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to the previous route if any
  const location = useLocation();
  const from: Location | undefined = location.state?.from;
  const previousRoute = from ? from.pathname : null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        signIn(user);
        if (previousRoute) {
          // Redirected to /authenticate
          navigate(previousRoute);
        } else if (location.pathname === '/authenticate') {
          // Directly landing on /authenticate
          navigate('/');
        } else {
          // Authenticated route load, noop. Remain in the current route
        }
      } else {
        signOut();
        navigate('/authenticate');
      }
    });

    return unsubscribe;
  }, [signIn, signOut]); // eslint-disable-line react-hooks/exhaustive-deps
}
