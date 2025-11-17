/**
 * Tests for Connectors SDK client
 */

import { Connectors } from '../src/Connectors';
import { ValidationError } from '../src/utils/validation';
import { RetryableError } from '../src/utils/http-client';
import type { HealthStatus } from '../src/types/config';
import { mockFetchSuccess, mockFetchError, mockFetchNetworkError } from './setup';

describe('Connectors', () => {
  const validConfig = {
    baseURL: 'http://localhost:3000',
    apiKey: 'test-key',
    tenantId: 'test-tenant',
  };

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const connectors = new Connectors(validConfig);

      expect(connectors).toBeInstanceOf(Connectors);
      expect(connectors.baseURL).toBe('http://localhost:3000');
      expect(connectors.tenantId).toBe('test-tenant');
      expect(connectors.apiKey).toBe('***'); // Masked
    });

    it('should create instance without optional fields', () => {
      const connectors = new Connectors({
        baseURL: 'http://localhost:3000',
      });

      expect(connectors).toBeInstanceOf(Connectors);
      expect(connectors.tenantId).toBeUndefined();
      expect(connectors.apiKey).toBeUndefined();
    });

    it('should remove trailing slash from baseURL', () => {
      const connectors = new Connectors({
        baseURL: 'http://localhost:3000/',
      });

      expect(connectors.baseURL).toBe('http://localhost:3000');
    });

    it('should throw ValidationError for missing baseURL', () => {
      expect(() => {
        new Connectors({} as any);
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid baseURL', () => {
      expect(() => {
        new Connectors({ baseURL: 'not-a-url' });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for empty baseURL', () => {
      expect(() => {
        new Connectors({ baseURL: '' });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid timeout', () => {
      expect(() => {
        new Connectors({
          baseURL: 'http://localhost:3000',
          timeout: -1,
        });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid maxRetries', () => {
      expect(() => {
        new Connectors({
          baseURL: 'http://localhost:3000',
          maxRetries: -1,
        });
      }).toThrow(ValidationError);
    });

    it('should accept custom headers', () => {
      const connectors = new Connectors({
        baseURL: 'http://localhost:3000',
        headers: {
          'X-Custom-Header': 'value',
        },
      });

      expect(connectors.config.headers).toEqual({
        'X-Custom-Header': 'value',
      });
    });
  });

  describe('config', () => {
    it('should return readonly config', () => {
      const connectors = new Connectors(validConfig);
      const config = connectors.config;

      expect(config.baseURL).toBe('http://localhost:3000');
      expect(config.apiKey).toBe('test-key');
      expect(config.tenantId).toBe('test-tenant');
    });
  });

  describe('health()', () => {
    it('should return health status', async () => {
      const connectors = new Connectors(validConfig);

      const healthData: HealthStatus = {
        status: 'healthy',
        version: '1.0.0',
        uptime: 12345,
        timestamp: new Date().toISOString(),
      };

      mockFetchSuccess(healthData);

      const health = await connectors.health();

      expect(health).toEqual(healthData);
      expect(health.status).toBe('healthy');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/health',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'User-Agent': '@connectors/sdk',
            'X-API-Key': 'test-key',
            'X-Tenant-ID': 'test-tenant',
          }),
        })
      );
    });

    it('should return degraded status', async () => {
      const connectors = new Connectors(validConfig);

      const healthData: HealthStatus = {
        status: 'degraded',
        version: '1.0.0',
        uptime: 12345,
        services: {
          faiss: 'up',
          neo4j: 'down',
          vault: 'up',
          redis: 'up',
        },
        timestamp: new Date().toISOString(),
      };

      mockFetchSuccess(healthData);

      const health = await connectors.health();

      expect(health.status).toBe('degraded');
      expect(health.services?.neo4j).toBe('down');
    });

    it('should throw RetryableError on server error after retries', async () => {
      const connectors = new Connectors({
        ...validConfig,
        maxRetries: 1,
      });

      // Mock all retry attempts
      mockFetchError(500, 'Internal Server Error');
      mockFetchError(500, 'Internal Server Error');

      await expect(connectors.health()).rejects.toThrow(RetryableError);
    });

    it('should throw error on network failure', async () => {
      const connectors = new Connectors(validConfig);

      mockFetchNetworkError('Network error');

      await expect(connectors.health()).rejects.toThrow();
    });
  });

  describe('testConnection()', () => {
    it('should return true for healthy connection', async () => {
      const connectors = new Connectors(validConfig);

      const healthData: HealthStatus = {
        status: 'healthy',
        version: '1.0.0',
        uptime: 12345,
        timestamp: new Date().toISOString(),
      };

      mockFetchSuccess(healthData);

      const isConnected = await connectors.testConnection();

      expect(isConnected).toBe(true);
    });

    it('should return true for degraded connection', async () => {
      const connectors = new Connectors(validConfig);

      const healthData: HealthStatus = {
        status: 'degraded',
        version: '1.0.0',
        uptime: 12345,
        timestamp: new Date().toISOString(),
      };

      mockFetchSuccess(healthData);

      const isConnected = await connectors.testConnection();

      expect(isConnected).toBe(true);
    });

    it('should return false for unhealthy connection', async () => {
      const connectors = new Connectors(validConfig);

      const healthData: HealthStatus = {
        status: 'unhealthy',
        version: '1.0.0',
        uptime: 12345,
        timestamp: new Date().toISOString(),
      };

      mockFetchSuccess(healthData);

      const isConnected = await connectors.testConnection();

      expect(isConnected).toBe(false);
    });

    it('should return false on connection error', async () => {
      const connectors = new Connectors(validConfig);

      mockFetchNetworkError();

      const isConnected = await connectors.testConnection();

      expect(isConnected).toBe(false);
    });
  });

  describe('API interfaces', () => {
    it('should return tools API instance', () => {
      const connectors = new Connectors(validConfig);

      const toolsAPI = connectors.tools;

      expect(toolsAPI).toBeDefined();
      expect(toolsAPI).toHaveProperty('select');
      expect(toolsAPI).toHaveProperty('list');
      expect(toolsAPI).toHaveProperty('invoke');
    });

    it('should return same tools API instance on multiple accesses', () => {
      const connectors = new Connectors(validConfig);

      const toolsAPI1 = connectors.tools;
      const toolsAPI2 = connectors.tools;

      expect(toolsAPI1).toBe(toolsAPI2);
    });

    it('should return mcp API instance', () => {
      const connectors = new Connectors(validConfig);

      const mcpAPI = connectors.mcp;

      expect(mcpAPI).toBeDefined();
      expect(mcpAPI).toHaveProperty('get');
      expect(mcpAPI).toHaveProperty('list');
      expect(mcpAPI).toHaveProperty('add');
    });

    it('should return same mcp API instance on multiple accesses', () => {
      const connectors = new Connectors(validConfig);

      const mcpAPI1 = connectors.mcp;
      const mcpAPI2 = connectors.mcp;

      expect(mcpAPI1).toBe(mcpAPI2);
    });

    it('should throw error for oauth API (not implemented)', () => {
      const connectors = new Connectors(validConfig);

      expect(() => connectors.oauth).toThrow(
        'OAuthManager not implemented yet'
      );
    });

    it('should throw error for categories API (not implemented)', () => {
      const connectors = new Connectors(validConfig);

      expect(() => connectors.categories).toThrow(
        'CategoriesAPI not implemented yet'
      );
    });
  });

  describe('HTTP client integration', () => {
    it('should include API key in requests', async () => {
      const connectors = new Connectors({
        baseURL: 'http://localhost:3000',
        apiKey: 'my-api-key',
      });

      mockFetchSuccess({ status: 'healthy' } as HealthStatus);

      await connectors.health();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'my-api-key',
          }),
        })
      );
    });

    it('should include tenant ID in requests', async () => {
      const connectors = new Connectors({
        baseURL: 'http://localhost:3000',
        tenantId: 'my-tenant',
      });

      mockFetchSuccess({ status: 'healthy' } as HealthStatus);

      await connectors.health();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Tenant-ID': 'my-tenant',
          }),
        })
      );
    });

    it('should include custom headers in requests', async () => {
      const connectors = new Connectors({
        baseURL: 'http://localhost:3000',
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      mockFetchSuccess({ status: 'healthy' } as HealthStatus);

      await connectors.health();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });
  });
});
