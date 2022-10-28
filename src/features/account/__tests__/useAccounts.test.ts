import { renderHook, waitFor } from '@testing-library/react';
import { QueryProvider } from '../../../test-utils/providers';
import { getSavedAccounts } from '../services/accounts.firebase';
import { useAccounts } from '../useAccounts';

jest.mock('../services/accounts.firebase', () => {
  return {
    getSavedAccounts: jest.fn().mockResolvedValue(null),
  };
});

describe('useAccounts', () => {
  it('Should return the fetch status of the user account', async () => {
    const { result } = renderHook(() => useAccounts('uid'), {
      wrapper: QueryProvider,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('Should return the error if the request fails', async () => {
    (getSavedAccounts as jest.Mock).mockRejectedValue('API Error');

    const { result } = renderHook(() => useAccounts('uid'), {
      wrapper: QueryProvider,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBe('API Error');

    (getSavedAccounts as jest.Mock).mockResolvedValue(null);
  });
});
