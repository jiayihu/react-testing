import { requestNordigen } from '../nordigen';

describe('requestNordigen', () => {
  const originalFetch = window.fetch;

  // beforeAll + afterAll
  // beforeEach + afterEach

  beforeEach(() => {
    const fetchMock = jest.fn(() => {
      const responseJsonMock = jest.fn(() => Promise.resolve({ status_code: 200 }));
      const response = { json: responseJsonMock } as unknown as Response;

      return Promise.resolve(response);
    });

    Object.defineProperty(global, 'fetch', {
      value: fetchMock,
      configurable: true,
      enumerable: true,
      writable: true,
    });

    // window.fetch = jest.fn();
  });

  afterEach(() => {
    // window.fetch = originalFetch;

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
