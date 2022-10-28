import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../../../test-utils/msw';
import { SignedInApplicationProviders } from '../../../test-utils/providers';
import { Transactions } from '../Transactions';

jest.mock('../services/transactions.firebase');
jest.mock('../../account/services/accounts.firebase');
jest.mock('@nivo/calendar', () => {
  return {
    ResponsiveTimeRange: () => null,
  };
});

describe('Transactions', () => {
  beforeAll(() => server.listen());

  afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
  });

  afterAll(() => server.close());

  it('Should render the list of user transactions', async () => {
    render(<Transactions />, { wrapper: SignedInApplicationProviders });

    // await screen.findAllByLabelText(/transaction/i);
    await waitFor(() => {
      expect(screen.queryAllByRole('button', { name: /transaction/i }).length).toBeGreaterThan(0);
    });
  });

  it('Should open the transaction details when clicking on a transaction', async () => {
    render(<Transactions />, { wrapper: SignedInApplicationProviders });

    await waitFor(() => {
      expect(screen.queryAllByRole('button', { name: /transaction/i }).length).toBeGreaterThan(0);
    });

    const transactions = await screen.findAllByLabelText(/transaction/i);

    userEvent.click(transactions[0]);

    const dialog = screen.getByRole('dialog', { name: /transaction details/i });

    await waitFor(() => expect(dialog).toHaveAttribute('data-enter'), { timeout: 2000 });

    expect(dialog).toBeVisible();
  });
});
