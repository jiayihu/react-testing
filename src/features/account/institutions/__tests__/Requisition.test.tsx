import { render, screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/lib/node';
import { nordigenTokenHandlers } from '../../../../services/mocks/nordigen.handlers';
import { NordigenErrorResponse } from '../../../../services/nordigen';
import { SignedInApplicationProviders } from '../../../../test-utils/providers';
import { accountHandlers } from '../../services/mocks/accounts.handlers';
import { Requisition } from '../Requisition';
import { institutionHandlers } from '../services/mocks/institutions.handlers';

jest.mock('../services/requisitions.firebase');
jest.mock('../../services/accounts.firebase');

describe('Requisition', () => {
  const server = setupServer(
    ...[...nordigenTokenHandlers, ...institutionHandlers, ...accountHandlers],
  );

  beforeAll(() => server.listen());

  afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
  });

  afterAll(() => server.close());

  it('Should add the requisition accounts to the APIs', async () => {
    render(<Requisition />, { wrapper: SignedInApplicationProviders });

    await waitFor(() => {
      expect(
        screen.getByRole('alert', { description: /accounts successfully connected/i }),
      ).toBeInTheDocument();
    });
  });

  it('Should display the error if the API continuously fails', async () => {
    server.use(
      rest.get('/nordigen/api/v2/requisitions/:id/', (req, res, ctx) => {
        const error: NordigenErrorResponse = {
          summary: 'Internal server error',
          detail: 'Internal server error',
          status_code: 500,
        };
        return res(ctx.status(500), ctx.json(error));
      }),
    );

    render(<Requisition />, { wrapper: SignedInApplicationProviders });

    await waitFor(
      () => {
        expect(
          screen.getByRole('alert', { description: /internal server error/i }),
        ).toBeInTheDocument();
      },
      { timeout: 10000 },
    );
  });
});
