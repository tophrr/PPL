import { beforeEach, describe, expect, jest, test } from '@jest/globals';

const createRouteMatcherMock = jest.fn((patterns: string[]) => {
  const normalized = patterns.map((pattern) => pattern.replace('(.*)', ''));

  return (request: { nextUrl: { pathname: string } }) =>
    normalized.some(
      (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path),
    );
});

const clerkMiddlewareMock = jest.fn((handler: unknown) => handler);

jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: clerkMiddlewareMock,
  createRouteMatcher: createRouteMatcherMock,
}));

describe('middleware', () => {
  beforeEach(() => {
    jest.resetModules();
    createRouteMatcherMock.mockClear();
    clerkMiddlewareMock.mockClear();
  });

  test('should skip auth protection for public routes', async () => {
    const middlewareModule = await import('@/src/middleware');
    const auth = { protect: jest.fn() };

    await middlewareModule.default(
      auth as never,
      {
        nextUrl: { pathname: '/login' },
      } as never,
    );

    expect(auth.protect).not.toHaveBeenCalled();
  });

  test('should protect non-public routes', async () => {
    const middlewareModule = await import('@/src/middleware');
    const auth = { protect: jest.fn().mockResolvedValue(undefined) };

    await middlewareModule.default(
      auth as never,
      {
        nextUrl: { pathname: '/dashboard' },
      } as never,
    );

    expect(auth.protect).toHaveBeenCalledTimes(1);
  });

  test('should expose route matchers for app and api paths', async () => {
    const middlewareModule = await import('@/src/middleware');

    expect(Array.isArray(middlewareModule.config.matcher)).toBe(true);
    expect(middlewareModule.config.matcher).toEqual(
      expect.arrayContaining([expect.stringContaining('(api|trpc)')]),
    );
  });
});
