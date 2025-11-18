/**
 * HTTP client with retry logic and error handling
 */

export interface HTTPClientConfig {
  baseURL: string;
  timeout?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
}

export interface HTTPResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export class HTTPError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: unknown,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'HTTPError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class RetryableError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'RetryableError';
  }
}

/**
 * HTTP status codes that should trigger a retry
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(attempt: number, baseDelay: number = 1000): number {
  const maxDelay = 30000; // 30 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * HTTP client with automatic retries and error handling
 */
export class HTTPClient {
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly defaultHeaders: Record<string, string>;

  constructor(config: HTTPClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout ?? 30000;
    this.maxRetries = config.maxRetries ?? 3;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': '@connectors/sdk',
      ...config.headers,
    };
  }

  /**
   * Make an HTTP request with retry logic
   */
  async request<T = unknown>(
    path: string,
    options: RequestOptions = {}
  ): Promise<HTTPResponse<T>> {
    const url = `${this.baseURL}${path}`;
    const method = options.method ?? 'GET';
    const timeout = options.timeout ?? this.timeout;
    const maxRetries = options.retries ?? this.maxRetries;

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    const requestInit: RequestInit = {
      method,
      headers,
    };

    // Add body for non-GET requests
    if (options.body && method !== 'GET') {
      requestInit.body = JSON.stringify(options.body);
    }

    // Retry loop
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(url, {
            ...requestInit,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Check if response should be retried
          if (RETRYABLE_STATUS_CODES.includes(response.status)) {
            // Extract retry-after header if present
            const retryAfter = response.headers.get('retry-after');
            const retryDelay = retryAfter
              ? parseInt(retryAfter, 10) * 1000
              : calculateBackoff(attempt);

            if (attempt < maxRetries) {
              await sleep(retryDelay);
              continue; // Retry
            }

            throw new RetryableError(
              `Request failed with status ${response.status} after ${maxRetries} retries`,
              response.status,
              retryAfter ? parseInt(retryAfter, 10) : undefined
            );
          }

          // Parse response
          const contentType = response.headers.get('content-type');
          let data: T;

          if (contentType?.includes('application/json')) {
            data = (await response.json()) as T;
          } else {
            data = (await response.text()) as unknown as T;
          }

          // Check for HTTP errors (4xx, 5xx)
          if (!response.ok) {
            throw new HTTPError(
              `HTTP ${response.status}: ${response.statusText}`,
              response.status,
              data
            );
          }

          // Extract response headers
          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });

          return {
            data,
            status: response.status,
            headers: responseHeaders,
          };
        } catch (error) {
          clearTimeout(timeoutId);

          // Handle abort (timeout)
          if (error instanceof Error && error.name === 'AbortError') {
            throw new TimeoutError(`Request timeout after ${timeout}ms`);
          }

          throw error;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry non-retryable errors
        if (
          error instanceof HTTPError &&
          !RETRYABLE_STATUS_CODES.includes(error.status)
        ) {
          throw error;
        }

        // Don't retry on last attempt
        if (attempt >= maxRetries) {
          break;
        }

        // Wait before retry
        await sleep(calculateBackoff(attempt));
      }
    }

    // All retries exhausted
    throw lastError ?? new Error('Request failed after all retries');
  }

  /**
   * Make a GET request
   */
  async get<T = unknown>(
    path: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   */
  async post<T = unknown>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  /**
   * Make a PUT request
   */
  async put<T = unknown>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = unknown>(
    path: string,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  /**
   * Make a PATCH request
   */
  async patch<T = unknown>(
    path: string,
    body?: unknown,
    options: Omit<RequestOptions, 'method' | 'body'> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>(path, { ...options, method: 'PATCH', body });
  }
}
