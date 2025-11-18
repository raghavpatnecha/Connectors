/**
 * Tests for HTTP client
 */

import { HTTPClient, HTTPError, RetryableError } from '../src/utils/http-client';
import { mockFetchSuccess, mockFetchError } from './setup';

describe('HTTPClient', () => {
  describe('constructor', () => {
    it('should create client with config', () => {
      const client = new HTTPClient({
        baseURL: 'http://localhost:3000',
        timeout: 5000,
        maxRetries: 2,
      });

      expect(client).toBeInstanceOf(HTTPClient);
    });

    it('should remove trailing slash from baseURL', () => {
      const client = new HTTPClient({
        baseURL: 'http://localhost:3000/',
      });

      // Test via request to verify URL is correct
      mockFetchSuccess({ data: 'ok' });

      client.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/test',
        expect.any(Object)
      );
    });
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const client = new HTTPClient({ baseURL: 'http://localhost:3000' });
      const responseData = { message: 'success' };

      mockFetchSuccess(responseData);

      const response = await client.get('/test');

      expect(response.data).toEqual(responseData);
      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'User-Agent': '@connectors/sdk',
          }),
        })
      );
    });

    it('should include custom headers', async () => {
      const client = new HTTPClient({
        baseURL: 'http://localhost:3000',
        headers: { 'X-Custom': 'value' },
      });

      mockFetchSuccess({ data: 'ok' });

      await client.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'value',
          }),
        })
      );
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request with body', async () => {
      const client = new HTTPClient({ baseURL: 'http://localhost:3000' });
      const requestBody = { name: 'test' };
      const responseData = { id: 123 };

      mockFetchSuccess(responseData);

      const response = await client.post('/test', requestBody);

      expect(response.data).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('should handle POST without body', async () => {
      const client = new HTTPClient({ baseURL: 'http://localhost:3000' });

      mockFetchSuccess({ success: true });

      await client.post('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({
          body: expect.anything(),
        })
      );
    });

    it('should handle non-JSON response', async () => {
      const client = new HTTPClient({ baseURL: 'http://localhost:3000' });
      const textResponse = 'Plain text response';

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' }),
        json: async () => { throw new Error('Not JSON'); },
        text: async () => textResponse,
      } as unknown as Response);

      const response = await client.post('/test', { data: 'test' });

      expect(response.data).toBe(textResponse);
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const client = new HTTPClient({ baseURL: 'http://localhost:3000' });
      const requestBody = { name: 'updated' };
      const responseData = { id: 123, name: 'updated' };

      mockFetchSuccess(responseData);

      const response = await client.put('/test/123', requestBody);

      expect(response.data).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/test/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('should handle PUT with custom options', async () => {
      const client = new HTTPClient({ baseURL: 'http://localhost:3000' });

      mockFetchSuccess({ success: true });

      await client.put('/test/123', { data: 'test' }, {
        retries: 1,
      });

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      const client = new HTTPClient({ baseURL: 'http://localhost:3000' });
      const responseData = { success: true };

      mockFetchSuccess(responseData, 204);

      const response = await client.delete('/test/123');

      expect(response.status).toBe(204);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/test/123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('should handle DELETE with custom options', async () => {
      const client = new HTTPClient({ baseURL: 'http://localhost:3000' });
      const responseData = { success: true };

      mockFetchSuccess(responseData);

      await client.delete('/test/123', {
        headers: { 'X-Custom': 'value' },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom': 'value',
          }),
        })
      );
    });
  });

  describe('PATCH requests', () => {
    it('should make successful PATCH request', async () => {
      const client = new HTTPClient({ baseURL: 'http://localhost:3000' });
      const requestBody = { name: 'patched' };
      const responseData = { id: 123, name: 'patched' };

      mockFetchSuccess(responseData);

      const response = await client.patch('/test/123', requestBody);

      expect(response.data).toEqual(responseData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/test/123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('should handle PATCH with custom options', async () => {
      const client = new HTTPClient({ baseURL: 'http://localhost:3000' });

      mockFetchSuccess({ success: true });

      await client.patch('/test/123', { data: 'test' }, {
        timeout: 5000,
      });

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should throw HTTPError on 4xx status', async () => {
      const client = new HTTPClient({ baseURL: 'http://localhost:3000' });

      mockFetchError(404, 'Not Found');

      const promise = client.get('/test');
      await expect(promise).rejects.toThrow(HTTPError);
    });

    it('should throw RetryableError on 5xx status with maxRetries=0', async () => {
      const client = new HTTPClient({
        baseURL: 'http://localhost:3000',
        maxRetries: 0,
      });

      mockFetchError(500, 'Internal Server Error');

      await expect(client.get('/test')).rejects.toThrow(RetryableError);
    });

    // Note: Timeout behavior is tested via integration tests
    // Mocking AbortController timeout in unit tests is complex
  });

  describe('Retry logic', () => {
    it('should retry on 429 status', async () => {
      const client = new HTTPClient({
        baseURL: 'http://localhost:3000',
        maxRetries: 2,
      });

      // First attempt: 429
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Rate limited' }),
      } as Response);

      // Second attempt: success
      mockFetchSuccess({ data: 'ok' });

      const response = await client.get('/test');

      expect(response.data).toEqual({ data: 'ok' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on 503 status', async () => {
      const client = new HTTPClient({
        baseURL: 'http://localhost:3000',
        maxRetries: 2,
      });

      // First attempt: 503
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Service unavailable' }),
      } as Response);

      // Second attempt: success
      mockFetchSuccess({ data: 'ok' });

      const response = await client.get('/test');

      expect(response.data).toEqual({ data: 'ok' });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw RetryableError after max retries', async () => {
      const client = new HTTPClient({
        baseURL: 'http://localhost:3000',
        maxRetries: 2,
      });

      // All attempts fail with 503
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ error: 'Service unavailable' }),
      } as Response);

      await expect(client.get('/test')).rejects.toThrow(RetryableError);
      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should NOT retry on 404 status', async () => {
      const client = new HTTPClient({
        baseURL: 'http://localhost:3000',
        maxRetries: 2,
      });

      mockFetchError(404, 'Not Found');

      await expect(client.get('/test')).rejects.toThrow(HTTPError);
      expect(global.fetch).toHaveBeenCalledTimes(1); // No retries
    });

    it('should respect retry-after header', async () => {
      const client = new HTTPClient({
        baseURL: 'http://localhost:3000',
        maxRetries: 1,
      });

      // First attempt: 429 with retry-after
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers({
          'content-type': 'application/json',
          'retry-after': '1',
        }),
        json: async () => ({ error: 'Rate limited' }),
      } as Response);

      // Second attempt: success
      mockFetchSuccess({ data: 'ok' });

      const startTime = Date.now();
      await client.get('/test');
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(900); // Should wait ~1 second
    }, 10000);
  });
});
