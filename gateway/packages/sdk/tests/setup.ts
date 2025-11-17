/**
 * Test setup and utilities
 */

// Mock fetch globally for tests (Node.js 18+)
globalThis.fetch = jest.fn() as any;
global.fetch = globalThis.fetch;

/**
 * Reset all mocks before each test
 */
beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Create a mock fetch response
 */
export function createMockResponse<T>(
  data: T,
  options: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  } = {}
): Response {
  const {
    status = 200,
    statusText = 'OK',
    headers = { 'content-type': 'application/json' },
  } = options;

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers: new Headers(headers),
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response;
}

/**
 * Create a mock fetch error
 */
export function createMockError(message: string): Error {
  return new Error(message);
}

/**
 * Mock successful fetch
 */
export function mockFetchSuccess<T>(data: T, status: number = 200): void {
  (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
    createMockResponse(data, { status })
  );
}

/**
 * Mock fetch error
 */
export function mockFetchError(status: number, message: string = 'Error'): void {
  (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
    createMockResponse({ error: message }, { status })
  );
}

/**
 * Mock fetch network error
 */
export function mockFetchNetworkError(message: string = 'Network error'): void {
  (globalThis.fetch as jest.Mock).mockRejectedValueOnce(new Error(message));
}

/**
 * Mock fetch timeout
 */
export function mockFetchTimeout(): void {
  const error = new Error('The operation was aborted');
  error.name = 'AbortError';
  (globalThis.fetch as jest.Mock).mockRejectedValueOnce(error);
}
