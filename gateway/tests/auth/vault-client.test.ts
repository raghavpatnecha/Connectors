/**
 * Tests for VaultClient
 * Connectors Platform - OAuth credential storage tests
 */

import { VaultClient } from '../../src/auth/vault-client';
import { OAuthCredentials } from '../../src/auth/types';
import {
  VaultError,
  CredentialNotFoundError,
  VaultEncryptionError
} from '../../src/errors/oauth-errors';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VaultClient', () => {
  let vaultClient: VaultClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
      request: jest.fn()
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Initialize VaultClient
    vaultClient = new VaultClient({
      address: 'http://localhost:8200',
      token: 'test-token',
      transitEngine: 'transit',
      kvEngine: 'secret',
      timeout: 5000,
      maxRetries: 3
    });
  });

  describe('storeCredentials', () => {
    it('should store encrypted OAuth credentials', async () => {
      const tenantId = 'tenant-123';
      const integration = 'github';
      const creds: OAuthCredentials = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        expiresAt: new Date('2025-12-31T23:59:59Z'),
        scopes: ['repo', 'user'],
        tokenType: 'Bearer',
        integration
      };

      // Mock encryption key check
      mockAxiosInstance.get.mockResolvedValueOnce({ data: {} });

      // Mock access token encryption
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { ciphertext: 'vault:v1:encrypted-access' } }
      });

      // Mock refresh token encryption
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { ciphertext: 'vault:v1:encrypted-refresh' } }
      });

      // Mock KV storage
      mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });

      await vaultClient.storeCredentials(tenantId, integration, creds);

      // Verify encryption key was checked
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/v1/transit/keys/tenant-123'
      );

      // Verify tokens were encrypted
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/transit/encrypt/tenant-123',
        expect.objectContaining({
          plaintext: expect.any(String)
        })
      );

      // Verify credentials were stored
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/secret/data/tenant-123/github',
        expect.objectContaining({
          data: expect.objectContaining({
            accessToken: 'vault:v1:encrypted-access',
            refreshToken: 'vault:v1:encrypted-refresh'
          }),
          metadata: expect.objectContaining({
            integration: 'github',
            autoRefresh: true
          })
        })
      );
    });

    it('should create encryption key if it does not exist', async () => {
      const tenantId = 'new-tenant';
      const integration = 'slack';
      const creds: OAuthCredentials = {
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresAt: new Date(),
        scopes: ['chat:write'],
        integration
      };

      // Mock encryption key not found
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('404'));

      // Mock encryption key creation
      mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });

      // Mock token encryption
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { ciphertext: 'vault:v1:encrypted-access' } }
      });
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { ciphertext: 'vault:v1:encrypted-refresh' } }
      });

      // Mock KV storage
      mockAxiosInstance.post.mockResolvedValueOnce({ data: {} });

      await vaultClient.storeCredentials(tenantId, integration, creds);

      // Verify key was created
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/transit/keys/new-tenant',
        expect.objectContaining({
          type: 'aes256-gcm96',
          exportable: false
        })
      );
    });

    it('should throw VaultError on storage failure', async () => {
      const creds: OAuthCredentials = {
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresAt: new Date(),
        scopes: [],
        integration: 'test'
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: {} });
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        vaultClient.storeCredentials('tenant', 'test', creds)
      ).rejects.toThrow(VaultError);
    });
  });

  describe('getCredentials', () => {
    it('should retrieve and decrypt OAuth credentials', async () => {
      const tenantId = 'tenant-123';
      const integration = 'github';

      // Mock KV retrieval
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          data: {
            data: {
              accessToken: 'vault:v1:encrypted-access',
              refreshToken: 'vault:v1:encrypted-refresh',
              expiresAt: '2025-12-31T23:59:59Z',
              scopes: ['repo', 'user'],
              tokenType: 'Bearer'
            }
          }
        }
      });

      // Mock access token decryption
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          data: {
            plaintext: Buffer.from('decrypted-access-token').toString('base64')
          }
        }
      });

      // Mock refresh token decryption
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: {
          data: {
            plaintext: Buffer.from('decrypted-refresh-token').toString('base64')
          }
        }
      });

      const result = await vaultClient.getCredentials(tenantId, integration);

      expect(result).toEqual({
        accessToken: 'decrypted-access-token',
        refreshToken: 'decrypted-refresh-token',
        expiresAt: new Date('2025-12-31T23:59:59Z'),
        scopes: ['repo', 'user'],
        tokenType: 'Bearer',
        integration: 'github'
      });

      // Verify decryption calls
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/transit/decrypt/tenant-123',
        { ciphertext: 'vault:v1:encrypted-access' }
      );
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/v1/transit/decrypt/tenant-123',
        { ciphertext: 'vault:v1:encrypted-refresh' }
      );
    });

    it('should throw CredentialNotFoundError when credentials do not exist', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { data: null }
      });

      await expect(
        vaultClient.getCredentials('tenant', 'nonexistent')
      ).rejects.toThrow(CredentialNotFoundError);
    });

    it('should throw VaultError on retrieval failure', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        vaultClient.getCredentials('tenant', 'test')
      ).rejects.toThrow(VaultError);
    });
  });

  describe('deleteCredentials', () => {
    it('should delete OAuth credentials', async () => {
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: {} });

      await vaultClient.deleteCredentials('tenant-123', 'github');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        '/v1/secret/data/tenant-123/github'
      );
    });

    it('should throw VaultError on deletion failure', async () => {
      mockAxiosInstance.delete.mockRejectedValueOnce(new Error('Access denied'));

      await expect(
        vaultClient.deleteCredentials('tenant', 'test')
      ).rejects.toThrow(VaultError);
    });
  });

  describe('listIntegrations', () => {
    it('should list all integrations for a tenant', async () => {
      mockAxiosInstance.request.mockResolvedValueOnce({
        data: {
          data: {
            keys: ['github', 'slack', 'jira']
          }
        }
      });

      const result = await vaultClient.listIntegrations('tenant-123');

      expect(result).toEqual(['github', 'slack', 'jira']);
      expect(mockAxiosInstance.request).toHaveBeenCalledWith({
        method: 'LIST',
        url: '/v1/secret/metadata/tenant-123'
      });
    });

    it('should return empty array on error', async () => {
      mockAxiosInstance.request.mockRejectedValueOnce(new Error('Not found'));

      const result = await vaultClient.listIntegrations('tenant-123');

      expect(result).toEqual([]);
    });
  });

  describe('hasCredentials', () => {
    it('should return true when credentials exist', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: {
          data: {
            data: {
              accessToken: 'encrypted',
              refreshToken: 'encrypted',
              expiresAt: new Date().toISOString(),
              scopes: [],
              tokenType: 'Bearer'
            }
          }
        }
      });

      mockAxiosInstance.post.mockResolvedValue({
        data: { data: { plaintext: Buffer.from('token').toString('base64') } }
      });

      const result = await vaultClient.hasCredentials('tenant', 'github');

      expect(result).toBe(true);
    });

    it('should return false when credentials do not exist', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { data: null }
      });

      const result = await vaultClient.hasCredentials('tenant', 'nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('healthCheck', () => {
    it('should return true when Vault is healthy', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ status: 200 });

      const result = await vaultClient.healthCheck();

      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/v1/sys/health');
    });

    it('should return false when Vault is unhealthy', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await vaultClient.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('retry logic', () => {
    it('should retry failed operations with exponential backoff', async () => {
      jest.useFakeTimers();

      const creds: OAuthCredentials = {
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresAt: new Date(),
        scopes: [],
        integration: 'test'
      };

      // Mock encryption key exists
      mockAxiosInstance.get.mockResolvedValueOnce({ data: {} });

      // Mock encryption - fail twice, then succeed
      mockAxiosInstance.post
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({
          data: { data: { ciphertext: 'vault:v1:encrypted' } }
        })
        .mockResolvedValueOnce({
          data: { data: { ciphertext: 'vault:v1:encrypted' } }
        })
        .mockResolvedValueOnce({ data: {} });

      const promise = vaultClient.storeCredentials('tenant', 'test', creds);

      // Fast-forward through retry delays
      await jest.runAllTimersAsync();

      await promise;

      // Should have been called 3 times (initial + 2 retries)
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(5); // 3 encrypt attempts + 1 success + 1 refresh + 1 store

      jest.useRealTimers();
    });
  });
});
