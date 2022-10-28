import { faker } from '@faker-js/faker';
import { MockedRequest, rest } from 'msw';
import { setupServer } from 'msw/node';
import { noop } from '../../utils';
import {
  invalidTokenResponse,
  ipAddressDeniedError,
  nordigenTokenHandlers,
  respondWithInvalidToken,
} from '../mocks/nordigen.handlers';
import {
  getNordigenToken,
  refreshNordigenToken,
  requestAuthenticatedNordigen,
  requestNordigen,
  retrieveToken,
  SavedToken,
  STORAGE_KEY,
} from '../nordigen';

describe('requestNordigen', () => {
  const defaultResponse = { status_code: 200 };
  const server = setupServer(
    ...[
      ...nordigenTokenHandlers,
      rest.post('/nordigen/api/v2/accounts/:accountId', async (req, res, ctx) => {
        const { accountId } = req.params;
        const body = await req.json();

        return res(ctx.status(200), ctx.json({ id: accountId, ...body }));
      }),
      rest.get('/nordigen/api/v2/accounts', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(defaultResponse));
      }),
    ],
  );

  beforeAll(() => server.listen());

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should call the Nordigen APIs', async () => {
    const response = await requestNordigen(`accounts`);

    expect(response).toEqual(defaultResponse);
  });

  it('should automatically serialize a POST message', async () => {
    const response = await requestNordigen(`accounts/1`, {
      data: 'data',
    });

    expect(response).toEqual({ id: '1', data: 'data' });
  });

  it('should allow to specify extra Headers', async () => {
    expect.assertions(2);

    const requestHandler = (req: MockedRequest) => {
      expect(req.headers.get('Authorization')).toBe('Bearer token');
    };
    server.events.on('request:start', requestHandler);

    const response = await requestNordigen(`accounts`, undefined, {
      headers: { Authorization: 'Bearer token' },
    });

    expect(response).toEqual(defaultResponse);

    server.events.removeListener('request:start', requestHandler);
  });

  it('should return the response if okay', async () => {
    const response = await requestNordigen(`accounts`);

    expect(response).toEqual(defaultResponse);
  });

  it('should reject if response is not okay', () => {
    server.use(
      rest.get('/nordigen/api/v2/nok', (req, res, ctx) => {
        return res(ctx.status(403), ctx.json(ipAddressDeniedError));
      }),
    );

    return expect(requestNordigen(`nok`)).rejects.toEqual(ipAddressDeniedError);
  });
});

describe('requestAuthenticatedNordigen', () => {
  const defaultResponse = { status_code: 200 };
  const server = setupServer(
    ...[
      ...nordigenTokenHandlers,
      rest.get('/nordigen/api/v2/accounts', (req, res, ctx) => {
        const Authorization = req.headers.get('Authorization');

        if (!Authorization) {
          return res(respondWithInvalidToken());
        }

        return res(ctx.status(200), ctx.json(defaultResponse));
      }),
    ],
  );

  beforeAll(() => server.listen());

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    server.resetHandlers();
    localStorage.clear();
  });

  afterAll(() => server.close());

  const defaultSavedToken: SavedToken = {
    access: 'accessToken',
    access_expires: faker.date.soon().toISOString(),
    refresh: 'refreshToken',
    refresh_expires: faker.date.soon().toISOString(),
  };

  it('Should return an authenticated request to the API using the saved token', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(response).toEqual(defaultResponse);
  });

  it('Should request a token if not available', async () => {
    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toMatchObject({
      access: expect.any(String),
      refresh: expect.any(String),
    });

    expect(response).toEqual(defaultResponse);
  });

  it('Should refresh the token if expired but refreshToken is valid', async () => {
    const expiredSavedToken: SavedToken = {
      access: 'accessToken',
      access_expires: faker.date.recent().toISOString(),
      refresh: 'refreshToken',
      refresh_expires: faker.date.soon().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expiredSavedToken));

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toMatchObject({
      access: expect.not.stringMatching(expiredSavedToken.access),
      refresh: expiredSavedToken.refresh,
    });

    expect(response).toEqual(defaultResponse);
  });

  it('Should request a new token if both access and refresh tokens are expired', async () => {
    const expiredSavedToken: SavedToken = {
      access: 'accessToken',
      access_expires: faker.date.recent().toISOString(),
      refresh: 'refreshToken',
      refresh_expires: faker.date.recent().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expiredSavedToken));

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toMatchObject({
      access: expect.not.stringMatching(expiredSavedToken.access),
      refresh: expect.not.stringMatching(expiredSavedToken.refresh),
    });

    expect(response).toEqual(defaultResponse);
  });

  it('Should refresh the token if the server returns 401 Invalid token but the refreshToken is still valid', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    server.use(
      rest.get('/nordigen/api/v2/accounts', (req, res, ctx) => {
        const Authorization = req.headers.get('Authorization');

        if (!Authorization || Authorization === `Bearer ${defaultSavedToken.access}`) {
          return res(respondWithInvalidToken());
        }

        return res(ctx.status(200), ctx.json(defaultResponse));
      }),
    );

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop);

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toMatchObject({
      access: expect.not.stringMatching(defaultSavedToken.access),
      refresh: defaultSavedToken.refresh,
    });

    expect(response).toEqual(defaultResponse);
  });

  it('Should refresh the token if the server returns 401 Invalid token but the refreshToken is still valid (MSW once)', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    server.use(
      rest.get('/nordigen/api/v2/accounts', (req, res, ctx) => {
        return res.once(respondWithInvalidToken());
      }),
    );

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop);

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toMatchObject({
      access: expect.not.stringMatching(defaultSavedToken.access),
      refresh: defaultSavedToken.refresh,
    });

    expect(response).toEqual(defaultResponse);
  });

  it('Should request a new token if the server returns 401 Invalid token and the refreshToken is not valid', async () => {
    const validTokenWithExpiredRefreshToken: SavedToken = {
      access: 'accessToken',
      access_expires: faker.date.soon().toISOString(),
      refresh: 'refreshToken',
      refresh_expires: faker.date.recent().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validTokenWithExpiredRefreshToken));

    server.use(
      rest.get('/nordigen/api/v2/accounts', (req, res, ctx) => {
        const Authorization = req.headers.get('Authorization');

        if (
          !Authorization ||
          Authorization === `Bearer ${validTokenWithExpiredRefreshToken.access}`
        ) {
          return res(respondWithInvalidToken());
        }

        return res(ctx.status(200), ctx.json(defaultResponse));
      }),
    );

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop);

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toMatchObject({
      access: expect.not.stringMatching(validTokenWithExpiredRefreshToken.access),
      refresh: expect.not.stringMatching(validTokenWithExpiredRefreshToken.refresh),
    });

    expect(response).toEqual(defaultResponse);
  });

  it('Should try to handle 401 Invalid token only once (promise)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    server.use(
      rest.get('/nordigen/api/v2/accounts', (req, res, ctx) => {
        return res(respondWithInvalidToken());
      }),
    );

    jest.spyOn(console, 'error').mockImplementation(noop);

    const promise = requestAuthenticatedNordigen(`accounts`);

    return expect(promise).rejects.toEqual(invalidTokenResponse);
  });
});

describe('getNordigenToken + refreshNordigenToken', () => {
  const server = setupServer(...nordigenTokenHandlers);

  beforeAll(() => server.listen());

  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });

  afterAll(() => server.close());

  it('Should persist the new token with the new dates of expiration', async () => {
    const now = new Date();
    await getNordigenToken();

    const savedToken = retrieveToken();

    if (!savedToken) {
      throw new Error('No persisted token');
    }

    const accessExpirationDelta =
      (new Date(savedToken.access_expires).getTime() - now.getTime()) / 1000;
    const refreshExpirationDelta =
      (new Date(savedToken.refresh_expires).getTime() - now.getTime()) / 1000;

    expect(Math.round(accessExpirationDelta)).toBe(86400);
    expect(Math.round(refreshExpirationDelta)).toBe(2592000);
  });

  it('Should persist the refreshed token with the new date of expiration', async () => {
    const defaultSavedToken: SavedToken = {
      access: 'accessToken',
      access_expires: faker.date.recent().toISOString(),
      refresh: 'refreshToken',
      refresh_expires: faker.date.soon().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    const now = new Date();
    await refreshNordigenToken();

    const savedToken = retrieveToken();

    if (!savedToken) {
      throw new Error('No persisted token');
    }

    const accessExpirationDelta =
      (new Date(savedToken.access_expires).getTime() - now.getTime()) / 1000;

    expect(Math.round(accessExpirationDelta)).toBe(86400);
    expect(savedToken.refresh_expires).toBe(defaultSavedToken.refresh_expires);
  });
});
