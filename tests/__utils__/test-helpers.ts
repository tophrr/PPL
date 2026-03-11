import { vi } from 'vitest';

/**
 * Common test utilities and helper functions
 * Use these across all test files to keep tests DRY
 */

/**
 * Wait for a condition to be true
 */
export const waitFor = async (
  condition: () => boolean,
  timeout = 1000
): Promise<void> => {
  const startTime = Date.now();
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

/**
 * Create a mock function with a default implementation
 */
export const createMockFn = <T extends (...args: any[]) => any>(
  implementation?: T
) => {
  return vi.fn(implementation);
};

/**
 * Create a mock async function
 */
export const createMockAsyncFn = <T = any>(
  resolvedValue?: T
) => {
  return vi.fn().mockResolvedValue(resolvedValue);
};

/**
 * Create a mock fetch response
 */
export const createMockFetchResponse = (
  data: any,
  options: ResponseInit = {}
) => {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  );
};

/**
 * Delay execution for testing async operations
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate mock data for testing
 */
export const generateMockUser = (overrides = {}) => ({
  id: Math.random().toString(36).substr(2, 9),
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const generateMockUsers = (count: number, overrides = {}) => {
  return Array.from({ length: count }, (_, i) =>
    generateMockUser({ id: `user-${i}`, ...overrides })
  );
};
