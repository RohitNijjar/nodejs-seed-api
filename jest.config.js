/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testTimeout: 10000,
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {}],
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/shared/utils',
    'src/features/**/controllers/**/*.ts',
    'src/features/**/services/**/*.ts',
    'src/features/**/repositories/**/*.ts',
    'src/features/**/utils/**/*.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.spec.ts'],
};
