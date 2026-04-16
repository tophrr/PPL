import { vi } from "vitest";

export const waitFor = async (
  condition: () => boolean,
  timeout = 1000,
): Promise<void> => {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error("Timeout waiting for condition");
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

export const createMockFn = <T extends (...args: any[]) => any>(
  implementation?: T,
) => {
  return implementation ? vi.fn(implementation) : vi.fn();
};

export const createMockAsyncFn = <T = any>(
  resolvedValue?: T,
) => {
  return vi.fn().mockResolvedValue(resolvedValue);
};

export const createMockFetchResponse = (
  data: any,
  options: ResponseInit = {},
) => {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
      ...options,
    }),
  );
};

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateMockUser = (overrides = {}) => ({
  id: Math.random().toString(36).slice(2, 11),
  name: "Test User",
  email: "test@example.com",
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const generateMockUsers = (count: number, overrides = {}) => {
  return Array.from({ length: count }, (_, i) =>
    generateMockUser({ id: `user-${i}`, ...overrides }),
  );
};
