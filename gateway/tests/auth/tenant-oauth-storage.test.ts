/**
 * Storage Tests - Tenant OAuth Storage
 * Connectors Platform - Test Vault storage for per-tenant OAuth configs
 */

import { TenantOAuthStorage } from '../../src/auth/tenant-oauth-storage';
import { VaultClient } from '../../src/auth/vault-client';
import {
  CreateOAuthConfigRequest,
  TenantOAuthConfig,
  EncryptedTenantOAuthConfig
} from '../../src/auth/types';
import { VaultError, CredentialNotFoundError } from '../../src/errors/oauth-errors';

// Mock VaultClient
jest.mock('../../src/auth/vault-client');

describe('TenantOAuthStorage', () => {
  let storage: TenantOAuthStorage;
  let mockVault: jest.Mocked<VaultClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Vault client
    mockVault = new VaultClient({
      address: 'http://vault',
      token: 'test'
    }) as jest.Mocked<VaultClient>;

    // Mock VaultClient internal methods
    (mockVault as any)._encrypt = jest.fn().mockImplementation(
      async (_tenantId: string, plaintext: string) => `vault:v1:encrypted_${plaintext}`
    );

    (mockVault as any)._decrypt = jest.fn().mockImplementation(
      async (_tenantId: string, ciphertext: string) =>
        ciphertext.replace('vault:v1:encrypted_', '')
    );

    (mockVault as any)._retryOperation = jest.fn().mockImplementation(
      async (fn: () => Promise<any>) => await fn()
    );

    (mockVault as any)._client = {
      post: jest.fn(),
      get: jest.fn(),
      delete: jest.fn()
    };

    mockVault.listIntegrations = jest.fn().mockResolvedValue([]);

    // Create storage instance
    storage = new TenantOAuthStorage(mockVault);
  });

  describe('storeTenantOAuthConfig', () => {
    const validConfig: CreateOAuthConfigRequest = {
      clientId: 'test-client-id-12345',
      clientSecret: 'test-client-secret-very-long-1234567890',
      redirectUri: 'https://app.example.com/oauth/callback/notion',
      authEndpoint: 'https://api.notion.com/v1/oauth/authorize',
      tokenEndpoint: 'https://api.notion.com/v1/oauth/token',
      scopes: ['read', 'write']
    };

    it('should store tenant OAuth config successfully', async () => {
      const tenantId = 'tenant-alice-001';
      const integration = 'notion';
      const createdBy = 'test-admin';

      (mockVault as any)._client.post.mockResolvedValue({
        data: { data: { version: 1 } }
      });

      await storage.storeTenantOAuthConfig(tenantId, integration, validConfig, createdBy);

      // Verify encryption was called
      expect((mockVault as any)._encrypt).toHaveBeenCalledWith(
        tenantId,
        validConfig.clientSecret
      );

      // Verify data was written to Vault
      expect((mockVault as any)._client.post).toHaveBeenCalledWith(
        expect.stringContaining(`secret/data/${tenantId}/oauth-configs/${integration}`),
        expect.objectContaining({
          data: expect.objectContaining({
            config: expect.objectContaining({
              clientId: validConfig.clientId,
              clientSecret: expect.stringContaining('vault:v1:encrypted_'),
              redirectUri: validConfig.redirectUri
            }),
            metadata: expect.objectContaining({
              createdBy,
              status: 'active'
            })
          })
        })
      );
    });

    it('should validate required fields', async () => {
      const invalidConfig = {
        clientId: '',
        clientSecret: '',
        redirectUri: '',
        authEndpoint: '',
        tokenEndpoint: ''
      };

      await expect(
        storage.storeTenantOAuthConfig('tenant-001', 'notion', invalidConfig)
      ).rejects.toThrow();
    });

    it('should validate URL format', async () => {
      const invalidConfig = {
        ...validConfig,
        redirectUri: 'not-a-valid-url'
      };

      await expect(
        storage.storeTenantOAuthConfig('tenant-001', 'notion', invalidConfig)
      ).rejects.toThrow(VaultError);
    });

    it('should encrypt client secret with tenant-specific key', async () => {
      const tenantId = 'tenant-specific-001';

      (mockVault as any)._client.post.mockResolvedValue({});

      await storage.storeTenantOAuthConfig(tenantId, 'notion', validConfig);

      expect((mockVault as any)._encrypt).toHaveBeenCalledWith(
        tenantId,
        validConfig.clientSecret
      );
    });

    it('should throw VaultError on storage failure', async () => {
      (mockVault as any)._client.post.mockRejectedValue(new Error('Vault connection failed'));

      await expect(
        storage.storeTenantOAuthConfig('tenant-001', 'notion', validConfig)
      ).rejects.toThrow(VaultError);
    });
  });

  describe('getTenantOAuthConfig', () => {
    it('should retrieve and decrypt OAuth config', async () => {
      const tenantId = 'tenant-alice-001';
      const integration = 'notion';

      const mockEncryptedData = {
        config: {
          clientId: 'test-client-id-12345',
          clientSecret: 'vault:v1:encrypted_original-secret',
          redirectUri: 'https://app.example.com/oauth/callback/notion',
          authEndpoint: 'https://api.notion.com/v1/oauth/authorize',
          tokenEndpoint: 'https://api.notion.com/v1/oauth/token',
          scopes: ['read', 'write']
        },
        metadata: {
          createdAt: new Date('2025-01-15T10:00:00Z'),
          updatedAt: new Date('2025-01-15T10:00:00Z'),
          createdBy: 'platform-admin',
          status: 'active'
        }
      };

      (mockVault as any)._client.get.mockResolvedValue({
        data: { data: { data: mockEncryptedData } }
      });

      const config = await storage.getTenantOAuthConfig(tenantId, integration);

      expect(config.tenantId).toBe(tenantId);
      expect(config.integration).toBe(integration);
      expect(config.clientId).toBe('test-client-id-12345');
      expect(config.clientSecret).toBe('original-secret'); // Decrypted!
      expect(config.redirectUri).toBe('https://app.example.com/oauth/callback/notion');
      expect(config.metadata).toBeDefined();
    });

    it('should throw CredentialNotFoundError when config does not exist', async () => {
      (mockVault as any)._client.get.mockResolvedValue({
        data: { data: { data: null } }
      });

      await expect(
        storage.getTenantOAuthConfig('tenant-nonexistent', 'notion')
      ).rejects.toThrow(CredentialNotFoundError);
    });

    it('should throw VaultError on retrieval failure', async () => {
      (mockVault as any)._client.get.mockRejectedValue(new Error('Vault connection failed'));

      await expect(
        storage.getTenantOAuthConfig('tenant-001', 'notion')
      ).rejects.toThrow(VaultError);
    });
  });

  describe('deleteTenantOAuthConfig', () => {
    it('should delete OAuth config successfully', async () => {
      const tenantId = 'tenant-alice-001';
      const integration = 'notion';

      (mockVault as any)._client.delete.mockResolvedValue({});

      await storage.deleteTenantOAuthConfig(tenantId, integration);

      expect((mockVault as any)._client.delete).toHaveBeenCalledWith(
        expect.stringContaining(`secret/data/${tenantId}/oauth-configs/${integration}`)
      );
    });

    it('should throw VaultError on deletion failure', async () => {
      (mockVault as any)._client.delete.mockRejectedValue(new Error('Vault connection failed'));

      await expect(
        storage.deleteTenantOAuthConfig('tenant-001', 'notion')
      ).rejects.toThrow(VaultError);
    });
  });

  describe('listTenantIntegrations', () => {
    it('should list all integrations for a tenant', async () => {
      const tenantId = 'tenant-alice-001';
      const mockIntegrations = ['notion', 'github', 'slack'];

      mockVault.listIntegrations.mockResolvedValue(mockIntegrations);

      const integrations = await storage.listTenantIntegrations(tenantId);

      expect(integrations).toEqual(mockIntegrations);
      expect(mockVault.listIntegrations).toHaveBeenCalledWith(
        `${tenantId}/oauth-configs`
      );
    });

    it('should return empty array when tenant has no integrations', async () => {
      mockVault.listIntegrations.mockResolvedValue([]);

      const integrations = await storage.listTenantIntegrations('tenant-new');

      expect(integrations).toEqual([]);
    });

    it('should return empty array on error', async () => {
      mockVault.listIntegrations.mockRejectedValue(new Error('Vault error'));

      const integrations = await storage.listTenantIntegrations('tenant-001');

      expect(integrations).toEqual([]);
    });
  });

  describe('hasOAuthConfig', () => {
    it('should return true when config exists', async () => {
      (mockVault as any)._client.get.mockResolvedValue({
        data: {
          data: {
            data: {
              config: {
                clientId: 'test-id',
                clientSecret: 'vault:v1:encrypted_secret',
                redirectUri: 'https://example.com',
                authEndpoint: 'https://auth.example.com',
                tokenEndpoint: 'https://token.example.com'
              }
            }
          }
        }
      });

      const exists = await storage.hasOAuthConfig('tenant-001', 'notion');

      expect(exists).toBe(true);
    });

    it('should return false when config does not exist', async () => {
      (mockVault as any)._client.get.mockResolvedValue({
        data: { data: { data: null } }
      });

      const exists = await storage.hasOAuthConfig('tenant-001', 'notion');

      expect(exists).toBe(false);
    });
  });

  describe('updateTenantOAuthConfig', () => {
    it('should update partial config successfully', async () => {
      const tenantId = 'tenant-alice-001';
      const integration = 'notion';

      // Mock existing config
      const existingConfig: TenantOAuthConfig = {
        tenantId,
        integration,
        clientId: 'old-client-id',
        clientSecret: 'old-client-secret-1234567890',
        redirectUri: 'https://old.example.com/oauth/callback',
        authEndpoint: 'https://api.notion.com/v1/oauth/authorize',
        tokenEndpoint: 'https://api.notion.com/v1/oauth/token',
        scopes: ['read'],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'admin',
          status: 'active'
        }
      };

      (mockVault as any)._client.get.mockResolvedValue({
        data: {
          data: {
            data: {
              config: {
                clientId: existingConfig.clientId,
                clientSecret: 'vault:v1:encrypted_' + existingConfig.clientSecret,
                redirectUri: existingConfig.redirectUri,
                authEndpoint: existingConfig.authEndpoint,
                tokenEndpoint: existingConfig.tokenEndpoint,
                scopes: existingConfig.scopes
              },
              metadata: existingConfig.metadata
            }
          }
        }
      });

      (mockVault as any)._client.post.mockResolvedValue({});

      // Update only redirectUri
      const updates = {
        redirectUri: 'https://new.example.com/oauth/callback'
      };

      await storage.updateTenantOAuthConfig(tenantId, integration, updates, 'updater');

      // Verify merged config was stored
      expect((mockVault as any)._client.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          data: expect.objectContaining({
            config: expect.objectContaining({
              clientId: 'old-client-id', // Preserved
              redirectUri: 'https://new.example.com/oauth/callback' // Updated
            })
          })
        })
      );
    });
  });

  describe('Tenant isolation', () => {
    it('should use separate Vault paths for different tenants', async () => {
      const config: CreateOAuthConfigRequest = {
        clientId: 'test-client-id-12345',
        clientSecret: 'test-client-secret-very-long-1234567890',
        redirectUri: 'https://app.example.com/oauth/callback/notion',
        authEndpoint: 'https://api.notion.com/v1/oauth/authorize',
        tokenEndpoint: 'https://api.notion.com/v1/oauth/token'
      };

      (mockVault as any)._client.post.mockResolvedValue({});

      // Store for Alice
      await storage.storeTenantOAuthConfig('tenant-alice', 'notion', config);

      expect((mockVault as any)._client.post).toHaveBeenCalledWith(
        expect.stringContaining('secret/data/tenant-alice/oauth-configs/notion'),
        expect.any(Object)
      );

      // Store for Bob
      await storage.storeTenantOAuthConfig('tenant-bob', 'notion', config);

      expect((mockVault as any)._client.post).toHaveBeenCalledWith(
        expect.stringContaining('secret/data/tenant-bob/oauth-configs/notion'),
        expect.any(Object)
      );
    });

    it('should use tenant-specific encryption keys', async () => {
      const config: CreateOAuthConfigRequest = {
        clientId: 'test-client-id-12345',
        clientSecret: 'shared-secret-1234567890',
        redirectUri: 'https://app.example.com/oauth/callback',
        authEndpoint: 'https://auth.example.com',
        tokenEndpoint: 'https://token.example.com'
      };

      (mockVault as any)._client.post.mockResolvedValue({});

      // Alice's config
      await storage.storeTenantOAuthConfig('tenant-alice', 'notion', config);
      expect((mockVault as any)._encrypt).toHaveBeenCalledWith('tenant-alice', config.clientSecret);

      // Bob's config (same secret, different tenant key)
      await storage.storeTenantOAuthConfig('tenant-bob', 'notion', config);
      expect((mockVault as any)._encrypt).toHaveBeenCalledWith('tenant-bob', config.clientSecret);
    });
  });

  describe('Multiple integrations per tenant', () => {
    it('should store multiple integrations independently', async () => {
      const tenantId = 'tenant-alice-001';

      const notionConfig: CreateOAuthConfigRequest = {
        clientId: 'notion-client-id',
        clientSecret: 'notion-client-secret-1234567890',
        redirectUri: 'https://app.example.com/oauth/callback/notion',
        authEndpoint: 'https://api.notion.com/v1/oauth/authorize',
        tokenEndpoint: 'https://api.notion.com/v1/oauth/token'
      };

      const githubConfig: CreateOAuthConfigRequest = {
        clientId: 'github-client-id',
        clientSecret: 'github-client-secret-1234567890',
        redirectUri: 'https://app.example.com/oauth/callback/github',
        authEndpoint: 'https://github.com/login/oauth/authorize',
        tokenEndpoint: 'https://github.com/login/oauth/access_token'
      };

      (mockVault as any)._client.post.mockResolvedValue({});

      await storage.storeTenantOAuthConfig(tenantId, 'notion', notionConfig);
      await storage.storeTenantOAuthConfig(tenantId, 'github', githubConfig);

      expect((mockVault as any)._client.post).toHaveBeenCalledWith(
        expect.stringContaining(`${tenantId}/oauth-configs/notion`),
        expect.any(Object)
      );

      expect((mockVault as any)._client.post).toHaveBeenCalledWith(
        expect.stringContaining(`${tenantId}/oauth-configs/github`),
        expect.any(Object)
      );
    });
  });
});
