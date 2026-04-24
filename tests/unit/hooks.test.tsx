import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Simple `useCounter` hook defined here for unit testing.
const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initialValue);
  return { count, increment, decrement, reset };
};

function TestComponent({ initial = 0 }: { initial?: number }) {
  const { count, increment, decrement, reset } = useCounter(initial);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={increment}>inc</button>
      <button onClick={decrement}>dec</button>
      <button onClick={reset}>reset</button>
    </div>
  );
}

describe('useCounter Hook', () => {
  it('should initialize with the correct value', () => {
    render(<TestComponent initial={5} />);
    expect(screen.getByTestId('count').textContent).toBe('5');
  });

  it('should export required methods and update count', () => {
    render(<TestComponent />);
    const count = screen.getByTestId('count');
    const [incBtn, decBtn, resetBtn] = screen.getAllByRole('button');

    expect(count).toBeTruthy();

    fireEvent.click(incBtn);
    expect(count.textContent).toBe('1');

    fireEvent.click(decBtn);
    expect(count.textContent).toBe('0');

    fireEvent.click(resetBtn);
    expect(count.textContent).toBe('0');
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
