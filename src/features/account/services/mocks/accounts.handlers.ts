import { rest } from 'msw';
import { createBalance, createInstitutionAccount } from './accounts.fixtures';

export const accountHandlers = [
  rest.get('/nordigen/api/v2/accounts/:accountId/', (req, res, ctx) => {
    const { id } = req.params;
    const account = createInstitutionAccount(id ? { id: String(id) } : {});

    return res(ctx.status(200), ctx.json(account));
  }),
  rest.get('/nordigen/api/v2/accounts/:accountId/balances/', (req, res, ctx) => {
    const balance = createBalance();

    return res(ctx.status(200), ctx.json({ balances: [balance] }));
  }),
];
