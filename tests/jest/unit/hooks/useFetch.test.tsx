import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { useFetch } from '@/src/hooks/useFetch';

describe('useFetch', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    Object.defineProperty(global, 'fetch', {
      configurable: true,
      value: fetchMock,
    });
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  test('should fetch and return JSON data for a URL', async () => {
    fetchMock.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ id: 1, title: 'Draft One' }),
    });

    const { result } = renderHook(() => useFetch<{ id: number; title: string }>('/api/drafts/1'));

    await waitFor(() => {
      expect(result.current).toEqual({ id: 1, title: 'Draft One' });
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/drafts/1');
  });

  test('should refetch when the URL dependency changes', async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ url: '/api/brands/1' }),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ url: '/api/brands/2' }),
      });

    const { result, rerender } = renderHook(({ url }) => useFetch<{ url: string }>(url), {
      initialProps: { url: '/api/brands/1' },
    });

    await waitFor(() => {
      expect(result.current).toEqual({ url: '/api/brands/1' });
    });

    rerender({ url: '/api/brands/2' });

    await waitFor(() => {
      expect(result.current).toEqual({ url: '/api/brands/2' });
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
