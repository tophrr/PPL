import { expect, afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './mocks/server';

// Enable API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during tests
afterEach(() => server.resetHandlers());

// Disable API mocking after all tests
afterAll(() => server.close());

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));
