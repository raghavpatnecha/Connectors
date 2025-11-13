/**
 * Jest Configuration for LinkedIn Unified MCP Server
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Test file patterns
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],

  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },

  // Module resolution
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/*.interface.ts'
  ],

  // Coverage thresholds (target: 85%+)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],

  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Test timeout (30 seconds for integration tests)
  testTimeout: 30000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.sessions/'
  ],

  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },

  // Global setup/teardown
  // globalSetup: '<rootDir>/tests/global-setup.ts',
  // globalTeardown: '<rootDir>/tests/global-teardown.ts',

  // Detect open handles (useful for debugging)
  detectOpenHandles: true,

  // Force exit after tests complete
  forceExit: true,

  // Max workers (parallel test execution)
  maxWorkers: '50%'
};
