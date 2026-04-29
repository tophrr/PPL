import '@testing-library/jest-dom';
import { createElement, type ReactNode } from 'react';
import { afterEach, jest } from '@jest/globals';

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => createElement('a', { href, ...props }, children),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => createElement('img', props),
}));

if (typeof window !== 'undefined' && !window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback) =>
    window.setTimeout(() => callback(performance.now()), 0);
  window.cancelAnimationFrame = (id) => window.clearTimeout(id);
}
