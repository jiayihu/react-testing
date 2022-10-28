import { faker } from '@faker-js/faker';
import { compose, context, rest } from 'msw';
import { NordigenErrorResponse } from '../nordigen';

export const invalidTokenResponse: NordigenErrorResponse = {
  summary: 'Invalid token',
  detail: 'Token is invalid or expired',
  status_code: 401,
};

export const ipAddressDeniedError: NordigenErrorResponse = {
  summary: 'IP address access denied',
  detail: "Your IP $IP_ADDRESS isn't whitelisted to perform this action",
  status_code: 403,
};

export const authenticationFailed: NordigenErrorResponse = {
  summary: 'Authentication failed',
  detail: 'No active account found with the given credentials',
  status_code: 401,
};

export const respondWithInvalidToken = () => {
  return compose(context.status(401), context.json(invalidTokenResponse));
};

export const nordigenTokenHandlers = [
  rest.post('/nordigen/api/v2/token/new', async (req, res, ctx) => {
    const { secret_id, secret_key } = await req.json();

    if (!secret_id || !secret_key) {
      return res(ctx.status(400), ctx.json(authenticationFailed));
    }

    return res(
      ctx.status(200),
      ctx.json({
        access: faker.datatype.uuid(),
        access_expires: 86400,
        refresh: faker.datatype.uuid(),
        refresh_expires: 2592000,
      }),
    );
  }),
  rest.post('/nordigen/api/v2/token/refresh', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        access: faker.datatype.uuid(),
        access_expires: 86400,
      }),
    );
  }),
];
