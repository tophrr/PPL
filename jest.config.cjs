const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  testMatch: ['<rootDir>/tests/jest/**/*.test.{ts,tsx}'],
  collectCoverageFrom: [
    'src/hooks/**/*.{ts,tsx}',
    'src/utils/**/*.{ts,tsx}',
    'src/middleware.ts',
    'src/components/kitalaku/**/*.{ts,tsx}',
    '!src/components/kitalaku/icons.tsx',
    '!src/components/kitalaku/data.ts',
    '!src/components/kitalaku/pages.tsx',
  ],
  coverageDirectory: '<rootDir>/coverage/jest',
  coverageReporters: ['text', 'html', 'lcov'],
};

module.exports = createJestConfig(customJestConfig);
