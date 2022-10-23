import { Toaster } from 'react-hot-toast';
import { Outlet, Route, Routes } from 'react-router-dom';
import { Box, Container, ThemeUICSSObject } from 'theme-ui';
import { Accounts } from './features/account/Accounts';
import { Requisition } from './features/account/institutions/Requisition';
import { LoginPage } from './features/auth/LoginPage';
import { RequireAuth } from './features/auth/RequireAuth';
import { usePersistedAuth } from './features/auth/usePersistedAuth';
import { Budgets } from './features/budget/Budgets';
import { Navigation } from './features/navigation/Navigation';
import { Settings } from './features/settings/Settings';
import { Transactions } from './features/transactions/Transactions';

function App() {
  usePersistedAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <Box sx={containerStyle}>
              <Container sx={{ flex: 1, overflow: 'auto', py: [3] }}>
                <Outlet />
              </Container>
              <Navigation />
              <Toaster />
            </Box>
          </RequireAuth>
        }
      >
        <Route index element={<Transactions />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="accounts" element={<Accounts />} />
        <Route path="settings" element={<Settings />} />

        <Route path="requisition" element={<Requisition />} />
      </Route>
      <Route
        path="/authenticate"
        element={
          <Container>
            <LoginPage />
            <Toaster />
          </Container>
        }
      />
      <Route path="*" element={<Container>404 Not found</Container>} />
    </Routes>
  );
}

const containerStyle: ThemeUICSSObject = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
};

export default App;
