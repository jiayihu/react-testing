import { setupWorker } from 'msw';
import { institutionHandlers } from '../features/account/institutions/services/mocks/institutions.handlers';
import { accountHandlers } from '../features/account/services/mocks/accounts.handlers';
import { transactionHandlers } from '../features/transactions/services/mocks/transactions.handlers';
import { nordigenTokenHandlers } from '../services/mocks/nordigen.handlers';

export const worker = setupWorker(
  ...[...nordigenTokenHandlers, ...transactionHandlers, ...institutionHandlers, ...accountHandlers],
);
