/**
 * Vault Client Tests
 *
 * Comprehensive test suite for HashiCorp Vault integration
 */

import { VaultClient } from '../../src/auth/vault-client';
import { OAuthCredentials } from '../../src/auth/oauth-manager';

// Mock node-vault
jest.mock('node-vault');
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

describe('VaultClient', () => {
  let vaultClient: VaultClient;
  let mockVault: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock vault instance
    mockVault = {
      write: jest.fn().mockResolvedValue({ data: {} }),
      read: jest.fn(),
      delete: jest.fn().mockResolvedValue({}),
      list: jest.fn(),
      health: jest.fn().mockResolvedValue({ sealed: false })
    };

    // Mock the vault constructor
    const vault = require('node-vault');
    vault.mockReturnValue(mockVault);

    // Create vault client instance
    vaultClient = new VaultClient(
      'http://localhost:8200',
      'test-token',
      'linkedin-mcp'
    );
  });

  describe('storeCredentials', () => {
    const mockCredentials: OAuthCredentials = {
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-456',
      expiresAt: Date.now() + 3600000,
      scopes: ['openid', 'profile'],
      tenantId: 'tenant-123'
    };

    it('should store encrypted credentials in Vault', async () => {
      // Mock transit key check (key exists)
      mockVault.read.mockResolvedValue({ data: { keys: {} } });

      // Mock encryption responses
      mockVault.write
        .mockResolvedValueOnce({ data: { ciphertext: 'vault:v1:encrypted-access' } })
        .mockResolvedValueOnce({ data: { ciphertext: 'vault:v1:encrypted-refresh' } })
        .mockResolvedValueOnce({ data: {} }); // Store operation

      await vaultClient.storeCredentials('tenant-123', 'linkedin', mockCredentials);

      // Should check for transit key
      expect(mockVault.read).toHaveBeenCalledWith('transit/keys/linkedin-tenant-123');

      // Should encrypt access token
      expect(mockVault.write).toHaveBeenCalledWith(
        'transit/encrypt/linkedin-tenant-123',
        expect.objectContaining({ plaintext: expect.any(String) })
      );

      // Should store encrypted credentials
      expect(mockVault.write).toHaveBeenCalledWith(
        'secret/data/linkedin-mcp/tenant-123/linkedin',
        expect.objectContaining({
          data: expect.objectContaining({
            access_token: 'vault:v1:encrypted-access',
            refresh_token: 'vault:v1:encrypted-refresh',
            expires_at: mockCredentials.expiresAt,
            scopes: mockCredentials.scopes,
            tenant_id: 'tenant-123'
          })
        })
      );
    });

    it('should create transit key if it does not exist', async () => {
      // Mock key not found
      mockVault.read.mockRejectedValue({
        response: { statusCode: 404 }
      });

      mockVault.write.mockResolvedValue({ data: { ciphertext: 'encrypted' } });

      await vaultClient.storeCredentials('tenant-123', 'linkedin', mockCredentials);

      // Should create new transit key
      expect(mockVault.write).toHaveBeenCalledWith(
        'transit/keys/linkedin-tenant-123',
        expect.objectContaining({
          type: 'aes256-gcm96',
          exportable: false,
          allow_plaintext_backup: false
        })
      );
    });

    it('should handle credentials without refresh token', async () => {
      const credsWithoutRefresh: OAuthCredentials = {
        accessToken: 'access-token',
        expiresAt: Date.now() + 3600000,
        scopes: ['openid'],
        tenantId: 'tenant-123'
      };

      mockVault.read.mockResolvedValue({ data: { keys: {} } });
      mockVault.write.mockResolvedValue({ data: { ciphertext: 'encrypted' } });

      await vaultClient.storeCredentials('tenant-123', 'linkedin', credsWithoutRefresh);

      expect(mockVault.write).toHaveBeenCalledWith(
        'secret/data/linkedin-mcp/tenant-123/linkedin',
        expect.objectContaining({
          data: expect.objectContaining({
            refresh_token: null
          })
        })
      );
    });

    it('should throw error on vault write failure', async () => {
      mockVault.read.mockResolvedValue({ data: { keys: {} } });
      mockVault.write.mockRejectedValue(new Error('Vault write failed'));

      await expect(
        vaultClient.storeCredentials('tenant-123', 'linkedin', mockCredentials)
      ).rejects.toThrow('Failed to store credentials');
    });
  });

  describe('getCredentials', () => {
    it('should retrieve and decrypt credentials from Vault', async () => {
      const mockVaultData = {
        data: {
          data: {
            access_token: 'vault:v1:encrypted-access',
            refresh_token: 'vault:v1:encrypted-refresh',
            expires_at: Date.now() + 3600000,
            scopes: ['openid', 'profile'],
            tenant_id: 'tenant-123'
          }
        }
      };

      mockVault.read.mockResolvedValue(mockVaultData);
      mockVault.write
        .mockResolvedValueOnce({
          data: { plaintext: Buffer.from('access-token-123').toString('base64') }
        })
        .mockResolvedValueOnce({
          data: { plaintext: Buffer.from('refresh-token-456').toString('base64') }
        });

      const credentials = await vaultClient.getCredentials('tenant-123', 'linkedin');

      expect(credentials).toMatchObject({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        scopes: ['openid', 'profile'],
        tenantId: 'tenant-123'
      });
    });

    it('should handle credentials without refresh token', async () => {
      const mockVaultData = {
        data: {
          data: {
            access_token: 'vault:v1:encrypted-access',
            refresh_token: null,
            expires_at: Date.now() + 3600000,
            scopes: ['openid'],
            tenant_id: 'tenant-123'
          }
        }
      };

      mockVault.read.mockResolvedValue(mockVaultData);
      mockVault.write.mockResolvedValue({
        data: { plaintext: Buffer.from('access-token').toString('base64') }
      });

      const credentials = await vaultClient.getCredentials('tenant-123', 'linkedin');

      expect(credentials.refreshToken).toBeUndefined();
    });

    it('should throw error when credentials not found', async () => {
      mockVault.read.mockRejectedValue({
        response: { statusCode: 404 }
      });

      await expect(
        vaultClient.getCredentials('tenant-123', 'linkedin')
      ).rejects.toThrow('No credentials found for tenant tenant-123');
    });

    it('should throw error on vault read failure', async () => {
      mockVault.read.mockRejectedValue(new Error('Vault read failed'));

      await expect(
        vaultClient.getCredentials('tenant-123', 'linkedin')
      ).rejects.toThrow('Failed to retrieve credentials');
    });
  });

  describe('deleteCredentials', () => {
    it('should delete credentials from Vault', async () => {
      mockVault.delete.mockResolvedValue({});

      await vaultClient.deleteCredentials('tenant-123', 'linkedin');

      expect(mockVault.delete).toHaveBeenCalledWith(
        'secret/data/linkedin-mcp/tenant-123/linkedin'
      );
    });

    it('should throw error on deletion failure', async () => {
      mockVault.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(
        vaultClient.deleteCredentials('tenant-123', 'linkedin')
      ).rejects.toThrow('Delete failed');
    });
  });

  describe('listTenantCredentials', () => {
    it('should list all credentials for a tenant', async () => {
      mockVault.list.mockResolvedValue({
        data: { keys: ['linkedin', 'github', 'slack'] }
      });

      const credentials = await vaultClient.listTenantCredentials('tenant-123');

      expect(credentials).toEqual(['linkedin', 'github', 'slack']);
      expect(mockVault.list).toHaveBeenCalledWith(
        'secret/metadata/linkedin-mcp/tenant-123'
      );
    });

    it('should return empty array when tenant has no credentials', async () => {
      mockVault.list.mockRejectedValue({
        response: { statusCode: 404 }
      });

      const credentials = await vaultClient.listTenantCredentials('tenant-123');

      expect(credentials).toEqual([]);
    });

    it('should throw error on list failure', async () => {
      mockVault.list.mockRejectedValue(new Error('List failed'));

      await expect(
        vaultClient.listTenantCredentials('tenant-123')
      ).rejects.toThrow('List failed');
    });
  });

  describe('healthCheck', () => {
    it('should return true when Vault is healthy and unsealed', async () => {
      mockVault.health.mockResolvedValue({ sealed: false });

      const isHealthy = await vaultClient.healthCheck();

      expect(isHealthy).toBe(true);
    });

    it('should return false when Vault is sealed', async () => {
      mockVault.health.mockResolvedValue({ sealed: true });

      const isHealthy = await vaultClient.healthCheck();

      expect(isHealthy).toBe(false);
    });

    it('should return false on health check failure', async () => {
      mockVault.health.mockRejectedValue(new Error('Connection failed'));

      const isHealthy = await vaultClient.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe('encryption/decryption', () => {
    it('should properly encrypt and decrypt data round-trip', async () => {
      const plaintext = 'sensitive-data';
      const base64Plain = Buffer.from(plaintext).toString('base64');
      const ciphertext = 'vault:v1:encrypted-data';

      // Mock key check
      mockVault.read.mockResolvedValueOnce({ data: { keys: {} } });

      // Mock encryption calls for store
      mockVault.write.mockResolvedValueOnce({ data: { ciphertext } }); // encrypt access token

      // Mock final store operation
      mockVault.write.mockResolvedValueOnce({ data: {} });

      const credentials: OAuthCredentials = {
        accessToken: plaintext,
        expiresAt: Date.now() + 3600000,
        scopes: ['openid'],
        tenantId: 'tenant-123'
      };

      await vaultClient.storeCredentials('tenant-123', 'linkedin', credentials);

      // Reset mocks for retrieval
      jest.clearAllMocks();

      // Mock read operation for getCredentials
      mockVault.read.mockResolvedValueOnce({
        data: {
          data: {
            access_token: ciphertext,
            refresh_token: null,
            expires_at: credentials.expiresAt,
            scopes: credentials.scopes,
            tenant_id: 'tenant-123'
          }
        }
      });

      // Mock decryption
      mockVault.write.mockResolvedValueOnce({ data: { plaintext: base64Plain } });

      const retrieved = await vaultClient.getCredentials('tenant-123', 'linkedin');

      expect(retrieved.accessToken).toBe(plaintext);
      expect(retrieved.scopes).toEqual(['openid']);
    });
  });
});
