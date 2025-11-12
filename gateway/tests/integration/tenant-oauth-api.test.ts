/**
 * Integration tests for Tenant OAuth Configuration API
 * Connectors Platform - Tests for /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
 */

import request from 'supertest';
import express, { Application } from 'express';
import { VaultClient } from '../../src/auth/vault-client';
import { TenantOAuthStorage } from '../../src/auth/tenant-oauth-storage';
import { createTenantOAuthRouter } from '../../src/routes/tenant-oauth';
import { CreateOAuthConfigRequest } from '../../src/auth/types';

// Mock VaultClient
jest.mock('../../src/auth/vault-client');
jest.mock('../../src/logging/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('Tenant OAuth Configuration API', () => {
  let app: Application;
  let mockVaultClient: jest.Mocked<VaultClient>;
  let storage: TenantOAuthStorage;

  const validConfig: CreateOAuthConfigRequest = {
    clientId: 'test-client-id-12345678',
    clientSecret: 'test-client-secret-1234567890123456',
    redirectUri: 'https://example.com/oauth/callback',
    authEndpoint: 'https://oauth.provider.com/authorize',
    tokenEndpoint: 'https://oauth.provider.com/token',
    scopes: ['read', 'write'],
    additionalParams: {
      response_type: 'code',
      access_type: 'offline'
    }
  };

  beforeEach(() => {
    // Create mock VaultClient
    mockVaultClient = {
      healthCheck: jest.fn().mockResolvedValue(true),
      storeCredentials: jest.fn(),
      getCredentials: jest.fn(),
      deleteCredentials: jest.fn(),
      listIntegrations: jest.fn().mockResolvedValue([]),
      hasCredentials: jest.fn(),
      _encrypt: jest.fn().mockResolvedValue('vault:v1:encrypted'),
      _decrypt: jest.fn().mockImplementation(async (_tenantId, ciphertext) => {
        // Simple mock: reverse the encryption
        if (ciphertext === 'vault:v1:encrypted') {
          return validConfig.clientSecret;
        }
        return ciphertext;
      }),
      _retryOperation: jest.fn().mockImplementation(async (fn) => await fn()),
      _client: {
        post: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
        request: jest.fn()
      }
    } as any;

    // Create Express app with router
    app = express();
    app.use(express.json());
    const router = createTenantOAuthRouter(mockVaultClient);
    app.use('/api/v1', router);

    storage = new TenantOAuthStorage(mockVaultClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/tenants/:tenantId/integrations/:integration/oauth-config', () => {
    it('should create OAuth config successfully', async () => {
      // Mock Vault operations
      (mockVaultClient as any)._client.post.mockResolvedValue({ data: {} });

      const response = await request(app)
        .post('/api/v1/tenants/tenant-123/integrations/github/oauth-config')
        .send(validConfig)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        tenantId: 'tenant-123',
        integration: 'github',
        message: 'OAuth configuration stored successfully'
      });

      // Verify Vault client was called
      expect((mockVaultClient as any)._client.post).toHaveBeenCalled();
    });

    it('should reject invalid client ID', async () => {
      const invalidConfig = {
        ...validConfig,
        clientId: 'short' // Too short
      };

      const response = await request(app)
        .post('/api/v1/tenants/tenant-123/integrations/github/oauth-config')
        .send(invalidConfig)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'clientId',
            message: expect.stringContaining('at least 8 characters')
          })
        ])
      );
    });

    it('should reject invalid client secret', async () => {
      const invalidConfig = {
        ...validConfig,
        clientSecret: 'tooshort' // Too short
      };

      const response = await request(app)
        .post('/api/v1/tenants/tenant-123/integrations/github/oauth-config')
        .send(invalidConfig)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'clientSecret',
            message: expect.stringContaining('at least 16 characters')
          })
        ])
      );
    });

    it('should reject invalid URLs', async () => {
      const invalidConfig = {
        ...validConfig,
        redirectUri: 'not-a-valid-url'
      };

      const response = await request(app)
        .post('/api/v1/tenants/tenant-123/integrations/github/oauth-config')
        .send(invalidConfig)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'redirectUri',
            message: expect.stringContaining('valid URL')
          })
        ])
      );
    });

    it('should reject missing required fields', async () => {
      const invalidConfig = {
        clientId: 'test-client-id-12345678'
        // Missing other required fields
      };

      const response = await request(app)
        .post('/api/v1/tenants/tenant-123/integrations/github/oauth-config')
        .send(invalidConfig)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid tenant ID format', async () => {
      const response = await request(app)
        .post('/api/v1/tenants/invalid@tenant/integrations/github/oauth-config')
        .send(validConfig)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid tenant ID format');
    });

    it('should reject invalid integration name format', async () => {
      const response = await request(app)
        .post('/api/v1/tenants/tenant-123/integrations/Invalid_Integration/oauth-config')
        .send(validConfig)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid integration name format');
    });
  });

  describe('GET /api/v1/tenants/:tenantId/integrations/:integration/oauth-config', () => {
    it('should retrieve OAuth config successfully', async () => {
      // Mock Vault to return config
      (mockVaultClient as any)._client.get.mockResolvedValue({
        data: {
          data: {
            data: {
              config: {
                clientSecret: 'vault:v1:encrypted',
                clientId: validConfig.clientId,
                redirectUri: validConfig.redirectUri,
                authEndpoint: validConfig.authEndpoint,
                tokenEndpoint: validConfig.tokenEndpoint,
                scopes: validConfig.scopes,
                additionalParams: validConfig.additionalParams
              },
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'api',
                status: 'active'
              }
            }
          }
        }
      });

      const response = await request(app)
        .get('/api/v1/tenants/tenant-123/integrations/github/oauth-config')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tenantId).toBe('tenant-123');
      expect(response.body.integration).toBe('github');
      expect(response.body.config).toBeDefined();
      expect(response.body.config.clientSecret).toBeUndefined(); // Secret should not be returned
      expect(response.body.config.clientId).toBe(validConfig.clientId);
    });

    it('should return 404 when config does not exist', async () => {
      // Mock Vault to return no data
      (mockVaultClient as any)._client.get.mockResolvedValue({
        data: { data: { data: null } }
      });

      const response = await request(app)
        .get('/api/v1/tenants/tenant-123/integrations/nonexistent/oauth-config')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('DELETE /api/v1/tenants/:tenantId/integrations/:integration/oauth-config', () => {
    it('should delete OAuth config successfully', async () => {
      // Mock config exists
      (mockVaultClient as any)._client.get.mockResolvedValue({
        data: {
          data: {
            data: {
              config: { clientSecret: 'vault:v1:encrypted' }
            }
          }
        }
      });
      (mockVaultClient as any)._client.delete.mockResolvedValue({ data: {} });

      const response = await request(app)
        .delete('/api/v1/tenants/tenant-123/integrations/github/oauth-config')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 404 when deleting non-existent config', async () => {
      // Mock config does not exist
      (mockVaultClient as any)._client.get.mockResolvedValue({
        data: { data: { data: null } }
      });

      const response = await request(app)
        .delete('/api/v1/tenants/tenant-123/integrations/nonexistent/oauth-config')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /api/v1/tenants/:tenantId/integrations', () => {
    it('should list all integrations for tenant', async () => {
      const mockIntegrations = ['github', 'slack', 'notion'];
      mockVaultClient.listIntegrations.mockResolvedValue(mockIntegrations);

      const response = await request(app)
        .get('/api/v1/tenants/tenant-123/integrations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tenantId).toBe('tenant-123');
      expect(response.body.integrations).toEqual(mockIntegrations);
      expect(response.body.count).toBe(3);
    });

    it('should return empty array when tenant has no integrations', async () => {
      mockVaultClient.listIntegrations.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/v1/tenants/tenant-123/integrations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.integrations).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /api/v1/oauth-config/health', () => {
    it('should return healthy status when Vault is connected', async () => {
      mockVaultClient.healthCheck.mockResolvedValue(true);

      const response = await request(app)
        .get('/api/v1/oauth-config/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('healthy');
      expect(response.body.vault).toBe('connected');
    });

    it('should return unhealthy status when Vault is disconnected', async () => {
      mockVaultClient.healthCheck.mockResolvedValue(false);

      const response = await request(app)
        .get('/api/v1/oauth-config/health')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.status).toBe('unhealthy');
      expect(response.body.vault).toBe('disconnected');
    });
  });
});
