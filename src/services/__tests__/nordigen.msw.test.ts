import { faker } from '@faker-js/faker';
import { MockedRequest, rest } from 'msw';
import { setupServer } from 'msw/node';
import { noop, wait } from '../../utils';
import { invalidTokenResponse, nordigenTokenHandlers } from '../mocks/nordigen.handlers';
import { requestAuthenticatedNordigen, SavedToken, STORAGE_KEY } from '../nordigen';

describe('requestAuthenticatedNordigen', () => {
  const defaultResponse = { status_code: 200 };
  const server = setupServer(
    ...[
      ...nordigenTokenHandlers,
      rest.get('/nordigen/api/v2/accounts', (req, res, ctx) => {
        const Authorization = req.headers.get('Authorization');

        if (!Authorization) {
          return res(ctx.status(401), ctx.json(invalidTokenResponse));
        }

        return res(ctx.status(200), ctx.json(defaultResponse));
      }),
    ],
  );

  beforeAll(() => server.listen());

  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });

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

  it('Should refresh the token if the server returns 401 Invalid token but the refresh token is still valid', (done) => {
    let doneAssertions = { response: false, callback: false };

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

    const requestHandler = async (req: MockedRequest) => {
      if (req.method === 'GET') {
        return;
      }

      const body: { refresh: string } = await req.json();

      await wait(100);

      expect(body.refresh).toBe(defaultSavedToken.refresh);

      doneAssertions.callback = true;
      doneAssertions.response && doneAssertions.callback && done();
    };

    server.events.on('request:start', requestHandler);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop);

    requestAuthenticatedNordigen('accounts').then((response) => {
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const persistedToken: SavedToken = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
      expect(persistedToken.access).not.toBe(defaultSavedToken.access);
      expect(persistedToken.refresh).toBe(defaultSavedToken.refresh);

      expect(response).toEqual(defaultResponse);

      consoleErrorSpy.mockRestore();

      doneAssertions.response = true;
      doneAssertions.response && doneAssertions.callback && done();
    });
  });
});
