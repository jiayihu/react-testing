import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/lib/node';
import { nordigenTokenHandlers } from '../../../services/mocks/nordigen.handlers';
import { setupWindowLocation } from '../../../test-utils/jest.utils';
import { SignedInApplicationProviders } from '../../../test-utils/providers';
import { AddBankAccount } from '../AddBankAccount';
import { PostRequisitionResponse } from '../institutions/services/institutions.nordigen';
import { institutionHandlers } from '../institutions/services/mocks/institutions.handlers';
import { addUserRequisition } from '../institutions/services/requisitions.firebase';

jest.mock('../institutions/services/requisitions.firebase', () => {
  const originalModule = jest.requireActual('../institutions/services/requisitions.firebase');

  return {
    __esModule: true,
    ...originalModule,
    addUserRequisition: jest.fn().mockResolvedValue(undefined),
  };
});

describe('AddBankAccount', () => {
  const server = setupServer(...[...nordigenTokenHandlers, ...institutionHandlers]);

  beforeAll(() => server.listen());

  afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
  });

  afterAll(() => server.close());

  test('It should display a menu to select the country', () => {
    render(<AddBankAccount />, { wrapper: SignedInApplicationProviders });

    const countriesSelect = screen.getByRole('combobox', { name: /select a country/i });

    expect(countriesSelect).toBeInTheDocument();
    expect(within(countriesSelect).queryAllByRole('option').length).toBeGreaterThan(0);
  });

  test('It should display the list of available bank institutions when selecting a country', async () => {
    const restoreWindowLocation = setupWindowLocation();

    render(<AddBankAccount />, { wrapper: SignedInApplicationProviders });

    const countriesSelect = screen.getByRole('combobox', { name: /select a country/i });
    const options = within(countriesSelect).queryAllByRole('option');

    userEvent.selectOptions(countriesSelect, options[0]);

    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

    // await waitFor(() => {
    //   expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    // });

    const institutionsList = screen.getByRole('list', { name: /institutions/i });
    const institutions = within(institutionsList).queryAllByRole('button');

    expect(institutions.length).toBeGreaterThan(0);

    userEvent.click(institutions[0]);

    await waitFor(() => {
      const requisition: PostRequisitionResponse = (addUserRequisition as jest.Mock).mock
        .calls[0][1];
      expect(window.location.assign).toHaveBeenCalledWith(requisition.link);
    });

    restoreWindowLocation();
  });
});
