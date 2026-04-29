import { act, renderHook } from '@testing-library/react';
import { describe, expect, jest, test } from '@jest/globals';
import { useAuth } from '@/src/hooks/useAuth';

describe('useAuth', () => {
  test('should initialize unauthenticated', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
  });

  test('should set authenticated state to true on login', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login();
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  test('should set authenticated state to false on logout', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login();
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
  });
});
