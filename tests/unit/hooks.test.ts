import { describe, it, expect, vi } from 'vitest';
import React, { useLayoutEffect } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

/**
 * Unit Tests - Custom React Hooks
 * Test hook logic in isolation using vitest
 */

// Example custom hook to test (you would import your actual hooks)
import { useState } from 'react';

const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
};

describe('useCounter Hook', () => {
  it('should initialize with the correct value', () => {
    const hook = renderHook(() => useCounter(5));
    expect(hook.current.count).toBe(5);
    hook.unmount();
  });

  it('should export required methods', () => {
    const hook = renderHook(() => useCounter());
    expect(hook.current).toHaveProperty('count');
    expect(hook.current).toHaveProperty('increment');
    expect(hook.current).toHaveProperty('decrement');
    expect(hook.current).toHaveProperty('reset');
    hook.unmount();
  });

  it('should update state through increment, decrement, and reset', () => {
    const hook = renderHook(() => useCounter(2));

    act(() => {
      hook.current.increment();
    });
    expect(hook.current.count).toBe(3);

    act(() => {
      hook.current.decrement();
    });
    expect(hook.current.count).toBe(2);

    act(() => {
      hook.current.reset();
    });
    expect(hook.current.count).toBe(2);
    hook.unmount();
  });
});

describe('Async Operations', () => {
  it('should handle async operations correctly', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success');
    const result = await asyncFn();
    expect(result).toBe('success');
  });

  it('should handle async errors', async () => {
    const asyncFn = vi.fn().mockRejectedValue(new Error('Failed'));
    await expect(asyncFn()).rejects.toThrow('Failed');
  });
});

function renderHook<T>(useHook: () => T) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: Root | undefined;
  let currentValue!: T;

  function HookHarness() {
    const value = useHook();

    useLayoutEffect(() => {
      currentValue = value;
    }, [value]);

    return null;
  }

  act(() => {
    root = createRoot(container);
    root.render(React.createElement(HookHarness));
  });

  return {
    get current() {
      return currentValue;
    },
    unmount() {
      act(() => {
        root?.unmount();
      });
      container.remove();
    },
  };
}
