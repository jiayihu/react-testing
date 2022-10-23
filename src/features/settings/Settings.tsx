import { Box, Button } from 'theme-ui';
import { signOutUser } from '../auth/auth.service';

export function Settings() {
  const handleSignOut = () => {
    signOutUser();
  };

  return (
    <Box>
      <Button variant="secondary" onClick={handleSignOut}>
        Sign out
      </Button>
    </Box>
  );
}
