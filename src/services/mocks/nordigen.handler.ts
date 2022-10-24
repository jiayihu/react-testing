import { faker } from '@faker-js/faker';
import { rest } from 'msw';
import { NewTokenResponse } from '../nordigen';

export const nordigenTokenHandlers = [
  rest.post('/nordigen/api/v2/token/new', async (req, res, ctx) => {
    const response: NewTokenResponse = {
      access: faker.datatype.uuid(),
      access_expires: 86400,
      refresh: faker.datatype.uuid(),
      refresh_expires: 2592000,
    };

    return res(ctx.status(200), ctx.json(response));
  }),
];
