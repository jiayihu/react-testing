import { Navigate, useLocation } from 'react-router-dom';
import { Box, ThemeUICSSObject } from 'theme-ui';
import { Logo } from '../navigation/Logo';
import { Spinner } from '../ui/Spinner/Spinner';
import { isSignedIn, isSignedOut, useAuth } from './AuthContext';

export function RequireAuth(props: PropsWithRequiredChildren<unknown>) {
  const { authState } = useAuth();
  const location = useLocation();

  if (isSignedOut(authState)) {
    return <Navigate to="/authenticate" state={{ from: location }} replace />;
  }

  if (!isSignedIn(authState)) {
    // Automatic authentication in progress
    return (
      <Box sx={fullPageStyle}>
        <Logo />
        <Spinner />
      </Box>
    );
  }

  return <>{props.children}</>;
}

const fullPageStyle: ThemeUICSSObject = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  height: '100vh',
};
