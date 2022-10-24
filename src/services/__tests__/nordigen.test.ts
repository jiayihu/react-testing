import { faker } from '@faker-js/faker';
import { noop } from '../../utils';
import {
  NewTokenResponse,
  NordigenErrorResponse,
  RefreshTokenResponse,
  requestAuthenticatedNordigen,
  requestNordigen,
  SavedToken,
  STORAGE_KEY,
} from '../nordigen';

describe('requestNordigen', () => {
  const originalFetch = window.fetch;

  // describe => fetchMock.mockImplementation(impl)
  // beforeEach => resetAllMocks

  // beforeAll + afterAll
  // beforeEach + afterEach

  const responseJsonMock = jest.fn(() => Promise.resolve({ status_code: 200 }));

  const fetchMock = jest.fn(function fetchImpl() {
    const response = { json: responseJsonMock } as unknown as Response;

    return Promise.resolve(response);
  });

  beforeEach(() => {
    Object.defineProperty(global, 'fetch', {
      value: fetchMock,
      configurable: true,
      enumerable: true,
      writable: true,
    });

    // window.fetch = jest.fn();
  });

  afterEach(() => {
    // window.fetch = originalFetch

    jest.clearAllMocks();

    Object.defineProperty(global, 'fetch', {
      value: originalFetch,
      enumerable: true,
      configurable: true,
    });
  });

  it('Should call the Nordigen APIs', async () => {
    await requestNordigen('accounts');

    expect(fetch).toHaveBeenCalledTimes(1);

    const firstArg = (fetch as jest.Mock).mock.calls[0][0] as string;
    expect(firstArg).toBe('/nordigen/api/v2/accounts');

    const secondArg = (fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    expect(secondArg).toEqual({
      body: undefined,
      headers: { map: { accept: 'application/json', 'content-type': 'application/json' } },
      method: 'GET',
    });

    expect(secondArg).toMatchInlineSnapshot(`
    Object {
      "body": undefined,
      "headers": Headers {
        "map": Object {
          "accept": "application/json",
          "content-type": "application/json",
        },
      },
      "method": "GET",
    }
    `);

    // (input, matchers) => boolean
    // (matchers, input) => boolean
    // objectContaining: (matchers) => (input) => boolean
    // objectContaining(matchers)(input)

    expect(secondArg).toMatchObject({
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
    expect(secondArg.method).toBe('GET');

    expect(fetch).toHaveBeenCalledWith('/nordigen/api/v2/accounts', {
      body: undefined,
      headers: { map: { accept: 'application/json', 'content-type': 'application/json' } },
      method: 'GET',
    });
  });

  it('Should call the Nordigen APis (final)', async () => {
    await requestNordigen('accounts');

    expect(fetch).toHaveBeenCalledTimes(1);

    expect(fetch).toHaveBeenCalledWith('/nordigen/api/v2/accounts', {
      body: undefined,
      headers: { map: { accept: 'application/json', 'content-type': 'application/json' } },
      method: 'GET',
    });
  });

  it('should allow to specify additional Headers', async () => {
    const token = 'Bearer token';

    await requestNordigen('accounts', undefined, {
      headers: { Authorization: token },
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    const options = (fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    const headers = options.headers;

    expect(headers).toEqual({
      map: {
        accept: 'application/json',
        authorization: token,
        'content-type': 'application/json',
      },
    });
  });

  it('should return the response if okay', async () => {
    const response = await requestNordigen('accounts');

    expect(response).toEqual({ status_code: 200 });
  });

  it('should reject the response if not okay', async () => {
    const mockedResponse = { status_code: 400 };
    responseJsonMock.mockImplementationOnce(() => Promise.resolve(mockedResponse));

    /**
     * const effect = async () => {
      const response = await requestNordigen('accounts');
    }
     * expect(effect).toThrow():

     * try {
     *   effect()
     * } catch (e) {
     *   if (!(e instanceof Error)) {
     *     throw new Error("")
     *   }
     * }
     * 
     * expect(effect).rejects
     * 
     * promise.catch()
     * 
     * ...
     */

    return expect(requestNordigen('accounts')).rejects.toEqual(mockedResponse);
  });

  it('should throw', () => {
    expect(() => {
      throw new Error();
    }).toThrow(Error);
  });
});

/**
 * Early abstractions
 * - Devo leggere l'implementazione dell'astrazione per capire la funzione che usa l'astrazione?
 */

describe('requestAuthenticatedNordigen', () => {
  const originalFetch = window.fetch;

  const defaultResponse = { status_code: 200 };
  const responseJsonMock = jest.fn(() => Promise.resolve(defaultResponse));

  const fetchMock = jest.fn(function fetchImpl(_resource: string) {
    const response = { json: responseJsonMock } as unknown as Response;

    return Promise.resolve(response);
  });

  const defaultSavedToken: SavedToken = {
    access: 'accessToken',
    access_expires: faker.date.soon().toISOString(),
    refresh: 'refreshToken',
    refresh_expires: faker.date.soon().toISOString(),
  };

  beforeEach(() => {
    Object.defineProperty(global, 'fetch', {
      value: fetchMock,
      configurable: true,
      enumerable: true,
      writable: true,
    });

    // window.fetch = jest.fn();
  });

  afterEach(() => {
    // window.fetch = originalFetch

    jest.clearAllMocks();
    localStorage.clear();

    Object.defineProperty(global, 'fetch', {
      value: originalFetch,
      enumerable: true,
      configurable: true,
    });
  });

  it('Should return an authenticated request to the API using the saved token', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    const response = await requestAuthenticatedNordigen('accounts');

    expect(fetch).toHaveBeenCalledTimes(1);

    const options = (fetch as jest.Mock).mock.calls[0][1] as RequestInit;
    const headers = options.headers as Headers;

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
        const response = {
          json: jest.fn(() => Promise.resolve(responseToken)),
        } as unknown as Response;

        return Promise.resolve(response);
      }

      return Promise.resolve({ json: responseJsonMock } as unknown as Response);
    });

    const response = await requestAuthenticatedNordigen('accounts');

    const tokenCall = (fetch as jest.Mock).mock.calls[0];
    const endpoint = tokenCall[0] as string;
    const requestOptions = tokenCall[1] as RequestInit;

    expect(endpoint).toMatch(/token\/new/);
    expect(JSON.parse(requestOptions.body as string)).toEqual({
      secret_id: expect.any(String),
      secret_key: expect.any(String),
    });

    const persistedToken: SavedToken = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    expect(persistedToken.access).toBe(responseToken.access);
    expect(persistedToken.refresh).toBe(responseToken.refresh);

    expect(response).toEqual(defaultResponse);
  });

  it('Should refresh the token if the server returns 401 Invalid token but the refresh token is still valid', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSavedToken));

    const invalidTokenResponse: NordigenErrorResponse = {
      summary: 'Invalid token',
      detail: 'Token is invalid or expired',
      status_code: 401,
    };

    const refreshTokenResponse: RefreshTokenResponse = {
      access: 'refreshedAccessToken',
      access_expires: 86400,
    };

    fetchMock
      .mockImplementationOnce(() => {
        const response = {
          json: jest.fn(() => Promise.resolve(invalidTokenResponse)),
        } as unknown as Response;
        return Promise.resolve(response);
      })
      .mockImplementationOnce((resource: string) => {
        if (resource.match(/token\/refresh/)) {
          const response = {
            json: jest.fn(() => Promise.resolve(refreshTokenResponse)),
          } as unknown as Response;

          return Promise.resolve(response);
        }

        return Promise.resolve({ json: responseJsonMock } as unknown as Response);
      });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(noop);

    const response = await requestAuthenticatedNordigen('accounts');

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(3); // 401 response + refresh/token + accounts

    /** @NOTE the 2nd call is the one for the refresh token */
    const refreshCall = (fetch as jest.Mock).mock.calls[1];
    const endpoint = refreshCall[0] as string;
    const requestOptions = refreshCall[1] as RequestInit;

    expect(endpoint).toMatch(/token\/refresh/);
    expect(JSON.parse(requestOptions.body as string)).toEqual({
      refresh: defaultSavedToken.refresh,
    });

    const persistedToken: SavedToken = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '');
    expect(persistedToken.access).toBe(refreshTokenResponse.access);
    expect(persistedToken.refresh).toBe(defaultSavedToken.refresh);

    expect(response).toEqual(defaultResponse);

    consoleErrorSpy.mockRestore();
  });
});

/**
 * Domino - Tower defence
 * Testare per behaviour => Testare dal POV consumatore
 *   - Testare come l'utente finale => react-testing-library
 *     (enzyme) Shallow rendering
 * TypeScript e Testing complementari
 *
 * **Test sono scritti per fallire**
 * **Test sono da manutenere** (50%-30%)
 *
 * - Definire boundaries
 *
 * - Scrivere meno mock possibili
 * - Evitare conflitti tra test (concorrenza + mutations)
 *
 * Problema -> Soluzione
 * Eseguire i test in isolamento -> Mock (isolamento Effect)
 */
