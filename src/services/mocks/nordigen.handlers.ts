import { faker } from '@faker-js/faker';
import { rest } from 'msw';
import { NewTokenResponse, NordigenErrorResponse, RefreshTokenResponse } from '../nordigen';

export const invalidTokenResponse: NordigenErrorResponse = {
  summary: 'Invalid token',
  detail: 'Token is invalid or expired',
  status_code: 401,
};

export const authenticationFailed: NordigenErrorResponse = {
  summary: 'Authentication failed',
  detail: 'No active account found with the given credentials',
  status_code: 401,
};

export const nordigenTokenHandlers = [
  rest.post('/nordigen/api/v2/token/new', async (req, res, ctx) => {
    const { secret_id, secret_key } = await req.json();

    if (!secret_id || !secret_key) {
      return res(ctx.status(401), ctx.json(authenticationFailed));
    }

    const response: NewTokenResponse = {
      access: faker.datatype.uuid(),
      access_expires: 86400,
      refresh: faker.datatype.uuid(),
      refresh_expires: 2592000,
    };

    return res(ctx.status(200), ctx.json(response));
  }),
  rest.post('/nordigen/api/v2/token/refresh', async (req, res, ctx) => {
    const { refresh } = await req.json();

    if (!refresh) {
      return res(ctx.status(401), ctx.json(invalidTokenResponse));
    }

    const response: RefreshTokenResponse = {
      access: faker.datatype.uuid(),
      access_expires: 86400,
    };

    return res(ctx.status(200), ctx.json(response));
  }),
];
