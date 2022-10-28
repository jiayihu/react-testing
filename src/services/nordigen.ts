import { add, isAfter, isBefore } from 'date-fns';
import { isObject } from '../utils';

export function requestNordigen<T>(
  resource: string,
  body?: Record<string, unknown>,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Content-Type', 'application/json');

  const { headers: additionalHeaders, ...otherOptions } = options || {};

  if (additionalHeaders && isObject(additionalHeaders)) {
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      headers.append(key, value);
    });
  }

  const method = body ? 'POST' : 'GET';
  const serializedBody = body ? JSON.stringify(body) : undefined;

  return fetch(`/nordigen/api/v2/${resource}`, {
    method,
    body: serializedBody,
    headers,
    ...otherOptions,
  })
    .then((response) => response.json())
    .then((response) => {
      if (response.status_code > 301) {
        throw response;
      }

      return response;
    });
}

export type NewTokenResponse = {
  access: string;
  access_expires: 86400;
  refresh: string;
  refresh_expires: 2592000;
};

export type RefreshTokenResponse = {
  access: string;
  access_expires: 86400;
};

export type SavedToken = {
  access: string;
  access_expires: string;
  refresh: string;
  refresh_expires: string;
};

export const STORAGE_KEY = 'NORDIGEN';

export async function getNordigenToken() {
  return requestNordigen<NewTokenResponse>('token/new/', {
    secret_id: process.env.REACT_APP_NORDIGEN_SECRET_ID,
    secret_key: process.env.REACT_APP_NORDIGEN_SECRET_KEY,
  }).then(persistToken);
}

export function refreshNordigenToken(): Promise<void> {
  const savedToken = retrieveToken();

  if (!savedToken?.refresh) {
    return Promise.reject('No refresh token');
  }

  return requestNordigen<RefreshTokenResponse>('token/refresh/', {
    refresh: savedToken.refresh,
  }).then((response) =>
    persistRefreshedToken(savedToken, {
      access: response.access,
      access_expires: response.access_expires,
    }),
  );
}

export type NordigenErrorResponse = {
  summary: string;
  detail: string;
  status_code: number;
};

export const isNordigenError = (error: unknown): error is NordigenErrorResponse => {
  return isObject(error) && 'status_code' in error;
};

const MAX_ATTEMPT = 1;

export function requestAuthenticatedNordigen<T>(
  resource: string,
  body?: Record<string, unknown>,
  options?: RequestInit,
  attempt = 0,
): Promise<T> {
  const savedToken = retrieveToken();

  if (!savedToken?.access) {
    // Get the access token and repeat the request
    return getNordigenToken().then(() => requestAuthenticatedNordigen(resource, body, options));
  }

  const now = new Date();
  const accessExpiration = new Date(savedToken.access_expires);
  const refreshExpiration = new Date(savedToken.refresh_expires);

  if (isAfter(now, accessExpiration)) {
    if (isBefore(now, refreshExpiration)) {
      // Refresh the token and repeat the request
      return refreshNordigenToken().then(() =>
        requestAuthenticatedNordigen(resource, body, options),
      );
    }

    // Get a new access token and repeat the request
    return getNordigenToken().then(() => requestAuthenticatedNordigen(resource, body, options));
  }

  // Normal request with the token
  return requestNordigen<T>(resource, body, {
    headers: { Authorization: `Bearer ${savedToken?.access}` },
    ...options,
  }).catch((error) => {
    console.error(error);

    if (attempt >= MAX_ATTEMPT) {
      throw error;
    }

    // Should refresh token
    if (
      isNordigenError(error) &&
      error.status_code === 401 &&
      error.summary.match(/invalid token/i)
    ) {
      const now = new Date();
      const refreshExpiration = new Date(savedToken.refresh_expires);

      if (isBefore(now, refreshExpiration)) {
        return refreshNordigenToken().then(() =>
          requestAuthenticatedNordigen(resource, body, options, attempt + 1),
        );
      }

      // Get the access token and repeat the request
      return getNordigenToken().then(() =>
        requestAuthenticatedNordigen(resource, body, options, attempt + 1),
      );
    }

    throw error;
  });
}

export function persistToken(response: NewTokenResponse) {
  const now = new Date();
  const savedToken: SavedToken = {
    access: response.access,
    access_expires: add(now, { seconds: response.access_expires }).toISOString(),
    refresh: response.refresh,
    refresh_expires: add(now, { seconds: response.refresh_expires }).toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedToken));
}

export function persistRefreshedToken(savedToken: SavedToken, response: RefreshTokenResponse) {
  const now = new Date();
  const refreshedToken: SavedToken = {
    access: response.access,
    access_expires: add(now, { seconds: response.access_expires }).toISOString(),
    refresh: savedToken.refresh,
    refresh_expires: savedToken.refresh_expires,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshedToken));
}

export function retrieveToken(): SavedToken | null {
  const savedToken = localStorage.getItem(STORAGE_KEY);
  const token: SavedToken | null = savedToken ? JSON.parse(savedToken) : null;

  return token;
}

export const psd2DateFormat = 'yyyy-MM-dd';
