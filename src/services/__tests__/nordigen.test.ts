import { faker } from '@faker-js/faker';
import { noop } from '../../utils';
import {
  getNordigenToken,
  NewTokenResponse,
  NordigenErrorResponse,
  refreshNordigenToken,
  RefreshTokenResponse,
  requestAuthenticatedNordigen,
  requestNordigen,
  retrieveToken,
  SavedToken,
  STORAGE_KEY,
} from '../nordigen';

const originalFetch = fetch;

describe('requestNordigen', () => {
  const responseJsonMock = jest.fn(() => Promise.resolve({ status_code: 200 }));
  const fetchMock = jest.fn().mockImplementation(() => {
    const response = { json: responseJsonMock };

    return Promise.resolve(response);
  });

  beforeEach(() => {
    // window.fetch = jest.fn(fetchMock);

    Object.defineProperty(global, 'fetch', {
      value: fetchMock,
      enumerable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(global, 'fetch', {
      value: originalFetch,
      enumerable: true,
      configurable: true,
    });
  });

  it('Should call the Nordigen APIs', async () => {
    await requestNordigen(`accounts`);

    expect(fetch).toHaveBeenCalledTimes(1);

    const firstArg = (fetch as jest.Mock).mock.calls[0][0] as string;
    const secondArg = (fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    expect(firstArg).toBe('/nordigen/api/v2/accounts');
    expect(secondArg).toEqual({
      body: undefined,
      headers: { map: { accept: 'application/json', 'content-type': 'application/json' } },
      method: 'GET',
    });
    expect(secondArg).toMatchObject({
      body: undefined,
      headers: {
        map: expect.objectContaining({
          accept: 'application/json',
          'content-type': 'application/json',
        }),
      },
      method: 'GET',
    });
    expect((secondArg.headers as Headers).get('accept')).toBe('application/json');
    expect((secondArg.headers as Headers).get('content-type')).toBe('application/json');

    expect(fetch).toHaveBeenCalledWith('/nordigen/api/v2/accounts', {
      body: undefined,
      headers: { map: { accept: 'application/json', 'content-type': 'application/json' } },
      method: 'GET',
    });
  });

  it('Should call the Nordigen APIs (final)', async () => {
    await requestNordigen(`accounts`);

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith('/nordigen/api/v2/accounts', {
      body: undefined,
      headers: { map: { accept: 'application/json', 'content-type': 'application/json' } },
      method: 'GET',
    });
  });

  it('should automatically serialize a POST message', async () => {
    const body = { data: 'data' };
    await requestNordigen(`accounts`, body);

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith('/nordigen/api/v2/accounts', {
      body: JSON.stringify(body),
      headers: { map: { accept: 'application/json', 'content-type': 'application/json' } },
      method: 'POST',
    });
    expect((fetch as jest.Mock).mock.calls[0][1]).toMatchInlineSnapshot(`
Object {
  "body": "{\\"data\\":\\"data\\"}",
  "headers": Headers {
    "map": Object {
      "accept": "application/json",
      "content-type": "application/json",
    },
  },
  "method": "POST",
}
`);
  });

  it('should allow to specify extra Headers', async () => {
    await requestNordigen(`accounts`, undefined, {
      headers: { Authorization: 'Bearer token' },
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    const options = (fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    const headers = options.headers;

    expect(headers).toEqual({
      map: {
        accept: 'application/json',
        authorization: 'Bearer token',
        'content-type': 'application/json',
      },
    });
  });

  it('should return the response if okay', async () => {
    const mockedResponse = { status_code: 200, accounts: [] };
    responseJsonMock.mockImplementationOnce(() => Promise.resolve(mockedResponse));

    const response = await requestNordigen(`accounts`);

    expect(response).toEqual(mockedResponse);
  });

  it('should reject if response is not okay', () => {
    const mockedResponse = { status_code: 400 };
    responseJsonMock.mockImplementationOnce(() => Promise.resolve(mockedResponse));

    return expect(requestNordigen(`accounts`)).rejects.toEqual(mockedResponse);
  });
});

describe('requestAuthenticatedNordigen', () => {
  const defaultResponse = { status_code: 200 };
  const responseJsonMock = jest.fn(() => Promise.resolve(defaultResponse));
  function defaultFetchImpl() {
    const response = { json: responseJsonMock };

    return Promise.resolve(response);
  }
  const fetchMock = jest.fn().mockImplementation(defaultFetchImpl);

  const defaultSavedToken: SavedToken = {
    access: 'accessToken',
    access_expires: faker.date.soon().toISOString(),
    refresh: 'refreshToken',
    refresh_expires: faker.date.soon().toISOString(),
  };

  const invalidTokenResponse: NordigenErrorResponse = {
    summary: 'Invalid token',
    detail: 'Token is invalid or expired',
    status_code: 401,
  };

  beforeEach(() => {
    // window.fetch = jest.fn(fetchMock);

    Object.defineProperty(global, 'fetch', {
      value: fetchMock,
      enumerable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    fetchMock.mockImplementation(defaultFetchImpl);
  });

  it('Should return an authenticated request to the API using the saved token', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(fetch).toHaveBeenCalledTimes(1);

    const options = (fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    const headers = options.headers as Headers;

    expect(headers).toMatchObject({
      map: expect.objectContaining({
        authorization: `Bearer ${defaultSavedToken.access}`,
      }),
    });

    expect(headers.get('Authorization')).toBe(`Bearer ${defaultSavedToken.access}`);

    expect(response).toEqual(defaultResponse);
  });

  it('Should request a token if not available', async () => {
    const responseToken: NewTokenResponse = {
      access: 'accessToken',
      access_expires: 86400,
      refresh: 'refreshToken',
      refresh_expires: 2592000,
    };

    fetchMock.mockImplementationOnce((resource: string) => {
      if (resource.match(/token\/new/)) {
        const response = { json: jest.fn(() => Promise.resolve(responseToken)) };
        return Promise.resolve(response);
      }

      const response = { json: responseJsonMock };

      return Promise.resolve(response);
    });

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(fetch).toHaveBeenCalledTimes(2); // token/new + accounts

    const tokenCall = (fetch as jest.Mock).mock.calls[0];
    const endpoint = tokenCall[0] as string;
    const requestOptions = tokenCall[1] as RequestInit;

    expect(endpoint).toMatch(/token\/new/);
    expect(JSON.parse(requestOptions.body as string)).toMatchObject({
      secret_id: expect.any(String),
      secret_key: expect.any(String),
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toMatchObject({
      access: responseToken.access,
      refresh: responseToken.refresh,
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

    const responseToken: RefreshTokenResponse = {
      access: 'refreshedAccessToken',
      access_expires: 86400,
    };

    fetchMock.mockImplementationOnce((resource: string) => {
      if (resource.match(/token\/refresh/)) {
        const response = { json: jest.fn(() => Promise.resolve(responseToken)) };
        return Promise.resolve(response);
      }

      const response = { json: responseJsonMock };

      return Promise.resolve(response);
    });

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(fetch).toHaveBeenCalledTimes(2); // token/refresh + accounts

    const tokenCall = (fetch as jest.Mock).mock.calls[0];
    const endpoint = tokenCall[0] as string;
    const requestOptions = tokenCall[1] as RequestInit;

    expect(endpoint).toMatch(/token\/refresh/);
    expect(JSON.parse(requestOptions.body as string)).toMatchObject({
      refresh: expiredSavedToken.refresh,
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toMatchObject({
      access: responseToken.access,
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

    const responseToken: NewTokenResponse = {
      access: 'newAccessToken',
      access_expires: 86400,
      refresh: 'newRefreshToken',
      refresh_expires: 2592000,
    };

    fetchMock.mockImplementationOnce((resource: string) => {
      if (resource.match(/token\/new/)) {
        const response = { json: jest.fn(() => Promise.resolve(responseToken)) };
        return Promise.resolve(response);
      }

      const response = { json: responseJsonMock };

      return Promise.resolve(response);
    });

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(fetch).toHaveBeenCalledTimes(2); // token/new + accounts

    const tokenCall = (fetch as jest.Mock).mock.calls[0];
    const endpoint = tokenCall[0] as string;
    const requestOptions = tokenCall[1] as RequestInit;

    expect(endpoint).toMatch(/token\/new/);
    expect(JSON.parse(requestOptions.body as string)).toMatchObject({
      secret_id: expect.any(String),
      secret_key: expect.any(String),
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toMatchObject({
      access: responseToken.access,
      refresh: responseToken.refresh,
    });

    expect(response).toEqual(defaultResponse);
  });

  it('Should refresh the token if the server returns 401 Invalid token but the refreshToken is still valid', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    const responseToken: RefreshTokenResponse = {
      access: 'refreshedAccessToken',
      access_expires: 86400,
    };

    fetchMock
      .mockImplementationOnce(() => {
        const response = { json: jest.fn(() => Promise.resolve(invalidTokenResponse)) };
        return Promise.resolve(response);
      })
      .mockImplementationOnce((resource: string) => {
        if (resource.match(/token\/refresh/)) {
          const response = { json: jest.fn(() => Promise.resolve(responseToken)) };
          return Promise.resolve(response);
        }

        const response = { json: responseJsonMock };

        return Promise.resolve(response);
      });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop);

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(3); // 401 response + refresh/token + accounts

    const tokenCall = (fetch as jest.Mock).mock.calls[1];
    const endpoint = tokenCall[0] as string;
    const requestOptions = tokenCall[1] as RequestInit;

    expect(endpoint).toMatch(/token\/refresh/);
    expect(JSON.parse(requestOptions.body as string)).toMatchObject({
      refresh: defaultSavedToken.refresh,
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toMatchObject({
      access: responseToken.access,
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

    const responseToken: NewTokenResponse = {
      access: 'newAccessToken',
      access_expires: 86400,
      refresh: 'newRefreshToken',
      refresh_expires: 2592000,
    };

    fetchMock
      .mockImplementationOnce((resource) => {
        const response = { json: jest.fn(() => Promise.resolve(invalidTokenResponse)) };
        return Promise.resolve(response);
      })
      .mockImplementationOnce((resource: string) => {
        if (resource.match(/token\/new/)) {
          const response = { json: jest.fn(() => Promise.resolve(responseToken)) };
          return Promise.resolve(response);
        }

        const response = { json: responseJsonMock };

        return Promise.resolve(response);
      });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop);

    const response = await requestAuthenticatedNordigen(`accounts`);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(3); // 401 response + refresh/new + accounts

    const tokenCall = (fetch as jest.Mock).mock.calls[1];
    const endpoint = tokenCall[0] as string;
    const requestOptions = tokenCall[1] as RequestInit;

    expect(endpoint).toMatch(/token\/new/);
    expect(JSON.parse(requestOptions.body as string)).toMatchObject({
      secret_id: expect.any(String),
      secret_key: expect.any(String),
    });

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toMatchObject({
      access: responseToken.access,
      refresh: responseToken.refresh,
    });

    expect(response).toEqual(defaultResponse);
  });

  it('Should try to handle 401 Invalid token only once (promise)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    fetchMock.mockImplementation(() => {
      const response = { json: jest.fn(() => Promise.resolve(invalidTokenResponse)) };
      return Promise.resolve(response);
    });

    jest.spyOn(console, 'error').mockImplementation(noop);

    const promise = requestAuthenticatedNordigen(`accounts`);

    return expect(promise).rejects.toEqual(invalidTokenResponse);
  });

  it('Should try to handle 401 Invalid token only once (async-await)', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    fetchMock.mockImplementation(function alwaysInvalid() {
      const response = { json: jest.fn(() => Promise.resolve(invalidTokenResponse)) };
      return Promise.resolve(response);
    });

    jest.spyOn(console, 'error').mockImplementation(noop);

    await expect(async () => {
      await requestAuthenticatedNordigen(`accounts`);
    }).rejects.toEqual(invalidTokenResponse);
  });

  it('Should restore the default fetchMock implementation', () => {
    return expect(fetch('anything').then((response) => response.json())).resolves.toEqual(
      defaultResponse,
    );
  });
});

describe('retrieveToken', () => {
  it('Should retrieve the savedToken', () => {
    const defaultSavedToken: SavedToken = {
      access: 'accessToken',
      access_expires: faker.date.recent().toISOString(),
      refresh: 'refreshToken',
      refresh_expires: faker.date.soon().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    expect(retrieveToken()).toEqual(defaultSavedToken);
  });
});

describe('getNordigenToken + refreshNordigenToken', () => {
  const defaultResponse = { status_code: 200 };

  function defaultFetchImpl(resource: string) {
    const response = { json: jest.fn(() => Promise.resolve(defaultResponse)) };
    return Promise.resolve(response);
  }
  const fetchMock = jest.fn().mockImplementation(defaultFetchImpl);

  beforeEach(() => {
    Object.defineProperty(global, 'fetch', {
      value: fetchMock,
      enumerable: true,
      configurable: true,
    });
    // jest.useFakeTimers('legacy');
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    localStorage.clear();

    fetchMock.mockImplementation(defaultFetchImpl);
  });

  it('Should persist the new token with the new dates of expiration', async () => {
    const newTokenResponse: NewTokenResponse = {
      access: 'accessToken',
      access_expires: 86400,
      refresh: 'refreshToken',
      refresh_expires: 2592000,
    };
    fetchMock.mockImplementationOnce(() => {
      const response = { json: jest.fn(() => Promise.resolve(newTokenResponse)) };
      return Promise.resolve(response);
    });

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

    const refreshTokenResponse: RefreshTokenResponse = {
      access: 'refreshedAccessToken',
      access_expires: 86400,
    };
    fetchMock.mockImplementationOnce(() => {
      const response = { json: jest.fn(() => Promise.resolve(refreshTokenResponse)) };
      return Promise.resolve(response);
    });

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
