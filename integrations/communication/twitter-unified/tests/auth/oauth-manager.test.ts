/**
 * OAuth Manager Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { OAuthManager } from '../../src/auth/oauth-manager';
import { VaultClient } from '../../src/auth/vault-client';

describe('OAuthManager', () => {
  let oauthManager: OAuthManager;
  let mockVaultClient: jest.Mocked<VaultClient>;

  beforeEach(() => {
    mockVaultClient = {
      storeOAuthCredentials: jest.fn(),
      getOAuthCredentials: jest.fn(),
      deleteCredentials: jest.fn(),
      healthCheck: jest.fn()
    } as any;

    oauthManager = new OAuthManager(
      {
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret'
      },
      mockVaultClient
    );
  });

  describe('storeCredentials', () => {
    it('should store OAuth credentials in Vault', async () => {
      const tenantId = 'test-tenant';
      const credentials = {
        accessToken: 'test-access-token',
        accessTokenSecret: 'test-secret',
        socialDataApiKey: 'social-key'
      };

      await oauthManager.storeCredentials(tenantId, credentials);

      expect(mockVaultClient.storeOAuthCredentials).toHaveBeenCalledWith(
        tenantId,
        expect.objectContaining({
          accessToken: 'test-access-token',
          accessTokenSecret: 'test-secret',
          socialDataApiKey: 'social-key'
        })
      );
    });
  });

  describe('getCredentials', () => {
    it('should retrieve OAuth credentials from Vault', async () => {
      const tenantId = 'test-tenant';
      mockVaultClient.getOAuthCredentials.mockResolvedValue({
        accessToken: 'stored-token',
        accessTokenSecret: 'stored-secret',
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret'
      });

      const result = await oauthManager.getCredentials(tenantId);

      expect(result).toEqual({
        apiKey: 'test-api-key',
        apiSecret: 'test-api-secret',
        accessToken: 'stored-token',
        accessTokenSecret: 'stored-secret'
      });
    });

    it('should return null when credentials not found', async () => {
      mockVaultClient.getOAuthCredentials.mockResolvedValue(null);

      const result = await oauthManager.getCredentials('nonexistent-tenant');

      expect(result).toBeNull();
    });
  });
});
