import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { SignedOutApplicationProviders } from './test-utils/providers';

describe('App', () => {
  it('Should redirect to authenticate page', async () => {
    render(<App />, { wrapper: SignedOutApplicationProviders });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });
});
