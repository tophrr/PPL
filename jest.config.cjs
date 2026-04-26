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
  testMatch: [
    '<rootDir>/tests/jest/unit/hooks/useAuth.test.tsx',
    '<rootDir>/tests/jest/unit/context/workspace-context.test.tsx',
    '<rootDir>/tests/jest/unit/middleware/middleware.test.ts',
    '<rootDir>/tests/jest/unit/features/app-shell.test.tsx',
    '<rootDir>/tests/jest/unit/features/planner-section.test.tsx',
    '<rootDir>/tests/jest/unit/features/scheduler-section.test.tsx',
    '<rootDir>/tests/jest/unit/features/analytics-dashboard.test.tsx',
  ],
  collectCoverageFrom: [
    'src/middleware.ts',
    'src/hooks/useAuth.ts',
    'src/components/kitalaku/workspace-context.tsx',
    'src/components/kitalaku/app-shell.tsx',
    'src/components/kitalaku/planner-section.tsx',
    'src/components/kitalaku/scheduler-section.tsx',
    'src/components/kitalaku/analytics-dashboard.tsx',
  ],
  coverageDirectory: '<rootDir>/coverage/jest',
  coverageReporters: ['text', 'html', 'lcov'],
};

module.exports = createJestConfig(customJestConfig);
