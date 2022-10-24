import { faker } from '@faker-js/faker';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { noop } from '../../utils';
import { invalidTokenResponse, nordigenTokenHandlers } from '../mocks/nordigen.handler';
import { requestAuthenticatedNordigen, SavedToken, STORAGE_KEY } from '../nordigen';

describe('requestAuthenticatedNordigen', () => {
  const defaultResponse = { status_code: 200 };
  const server = setupServer(...nordigenTokenHandlers);

  server.use(
    rest.get('/nordigen/api/v2/accounts', (req, res, ctx) => {
      const Authorization = req.headers.get('Authorization');

      if (!Authorization) {
        return res(ctx.status(401), ctx.json(invalidTokenResponse));
      }

      return res(ctx.status(200), ctx.json(defaultResponse));
    }),
  );

  beforeAll(() => server.listen());

  afterAll(() => server.close());

  it('Should request a token if not available', async () => {
    const response = await requestAuthenticatedNordigen('accounts');

    const persistedToken: SavedToken = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    expect(persistedToken).toMatchObject({
      access: expect.any(String),
      refresh: expect.any(String),
    });

    expect(response).toEqual(defaultResponse);
  });

  const defaultSavedToken: SavedToken = {
    access: 'accessToken',
    access_expires: faker.date.soon().toISOString(),
    refresh: 'refreshToken',
    refresh_expires: faker.date.soon().toISOString(),
  };

  it('Should refresh the token if the server returns 401 Invalid token but the refresh token is still valid', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    server.use(
      rest.get('/nordigen/api/v2/accounts', (req, res, ctx) => {
        const Authorization = req.headers.get('Authorization');

        if (!Authorization || Authorization === `Bearer ${defaultSavedToken.access}`) {
          return res(ctx.status(401), ctx.json(invalidTokenResponse));
        }

        return res(ctx.status(200), ctx.json(defaultResponse));
      }),
    );

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop);

    const response = await requestAuthenticatedNordigen('accounts');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    const persistedToken: SavedToken = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    expect(persistedToken.access).not.toBe(defaultSavedToken.access);
    expect(persistedToken.refresh).toBe(defaultSavedToken.refresh);

    expect(response).toEqual(defaultResponse);

    consoleErrorSpy.mockRestore();
  });
});
