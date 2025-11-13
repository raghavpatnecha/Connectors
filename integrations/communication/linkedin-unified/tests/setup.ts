/**
 * Jest Setup File
 *
 * Runs before each test file
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.VAULT_ADDR = 'http://localhost:8200';
process.env.VAULT_TOKEN = 'test-token';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep error and warn for debugging
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
};

// Add custom matchers if needed
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Cleanup after each test
afterEach(() => {
  jest.clearAllTimers();
});
