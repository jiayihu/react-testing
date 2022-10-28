import { isToday } from 'date-fns';
import { range } from 'lodash';
import { rest } from 'msw';
import { GetTransactionsResponse } from '../transactions.nordigen';
import { createTransaction } from './transactions.fixtures';

export const transactionHandlers = [
  rest.get('/nordigen/api/v2/accounts/:id/transactions/', (req, res, ctx) => {
    const dateFrom = req.url.searchParams.get('date_from');

    const response: GetTransactionsResponse = {
      transactions: {
        booked:
          dateFrom && isToday(new Date(dateFrom))
            ? []
            : range(0, 10).map(() => createTransaction()),
        pending: [],
      },
    };

    return res(ctx.status(200), ctx.json(response));
  }),
];
