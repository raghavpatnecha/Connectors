/**
 * OAuth Manager Tests
 *
 * Comprehensive test suite for LinkedIn OAuth 2.0 manager
 */

import { OAuthManager, OAuthCredentials, OAuthConfig } from '../../src/auth/oauth-manager';
import { VaultClient } from '../../src/auth/vault-client';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('../../src/auth/vault-client');
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OAuthManager', () => {
  let oauthManager: OAuthManager;
  let mockVaultClient: jest.Mocked<VaultClient>;
  let config: OAuthConfig;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock vault client
    mockVaultClient = {
      storeCredentials: jest.fn().mockResolvedValue(undefined),
      getCredentials: jest.fn(),
      deleteCredentials: jest.fn().mockResolvedValue(undefined),
      listTenantCredentials: jest.fn().mockResolvedValue([]),
      healthCheck: jest.fn().mockResolvedValue(true)
    } as any;

    // OAuth config
    config = {
      clientId: 'test-client-id',
      clientSecret: 'test-secret',
      redirectUri: 'http://localhost:3001/oauth/callback',
      scopes: ['openid', 'profile', 'email', 'w_member_social']
    };

    // Create OAuth manager instance
    oauthManager = new OAuthManager(config, mockVaultClient);
  });

  describe('generateAuthUrl', () => {
    it('should generate valid authorization URL with all required parameters', () => {
      const tenantId = 'tenant-123';
      const url = oauthManager.generateAuthUrl(tenantId);

      expect(url).toContain('https://www.linkedin.com/oauth/v2/authorization');
      expect(url).toContain('response_type=code');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Foauth%2Fcallback');
      // URLSearchParams uses '+' for spaces, not '%20'
      expect(url).toMatch(/scope=(openid(\+|%20)profile(\+|%20)email(\+|%20)w_member_social)/);
      expect(url).toContain('state=');
    });

    it('should include custom state parameter when provided', () => {
      const tenantId = 'tenant-123';
      const customState = 'custom-state-value';
      const url = oauthManager.generateAuthUrl(tenantId, customState);

      expect(url).toContain(`state=${customState}`);
    });

    it('should generate unique state for each call', () => {
      const url1 = oauthManager.generateAuthUrl('tenant-1');
      const url2 = oauthManager.generateAuthUrl('tenant-1');

      const state1 = new URL(url1).searchParams.get('state');
      const state2 = new URL(url2).searchParams.get('state');

      expect(state1).not.toBe(state2);
    });

    it('should include tenant ID in generated state', () => {
      const tenantId = 'tenant-123';
      const url = oauthManager.generateAuthUrl(tenantId);
      const state = new URL(url).searchParams.get('state');

      expect(state).toContain(tenantId);
    });
  });

  describe('handleCallback', () => {
    const mockTokenResponse = {
      data: {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-456',
        expires_in: 3600,
        scope: 'openid profile email'
      }
    };

    it('should exchange authorization code for access token', async () => {
      mockedAxios.post.mockResolvedValue(mockTokenResponse);

      const code = 'auth-code-123';
      const tenantId = 'tenant-123';

      const credentials = await oauthManager.handleCallback(code, tenantId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.linkedin.com/oauth/v2/accessToken',
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      );

      expect(credentials).toMatchObject({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        scopes: ['openid', 'profile', 'email'],
        tenantId: 'tenant-123'
      });

      expect(credentials.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should store credentials in Vault after successful exchange', async () => {
      mockedAxios.post.mockResolvedValue(mockTokenResponse);

      const credentials = await oauthManager.handleCallback('auth-code', 'tenant-123');

      expect(mockVaultClient.storeCredentials).toHaveBeenCalledWith(
        'tenant-123',
        'linkedin',
        credentials
      );
    });

    it('should handle missing refresh token gracefully', async () => {
      const responseWithoutRefresh = {
        data: {
          access_token: 'access-token-123',
          expires_in: 3600,
          scope: 'openid profile'
        }
      };

      mockedAxios.post.mockResolvedValue(responseWithoutRefresh);

      const credentials = await oauthManager.handleCallback('auth-code', 'tenant-123');

      expect(credentials.refreshToken).toBeUndefined();
    });

    it('should throw error on invalid authorization code', async () => {
      mockedAxios.post.mockRejectedValue({
        message: 'Invalid authorization code',
        response: { data: { error: 'invalid_grant' } }
      });

      await expect(
        oauthManager.handleCallback('invalid-code', 'tenant-123')
      ).rejects.toThrow('OAuth authentication failed');
    });

    it('should handle network errors during token exchange', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(
        oauthManager.handleCallback('auth-code', 'tenant-123')
      ).rejects.toThrow('OAuth authentication failed: Network error');
    });
  });

  describe('refreshToken', () => {
    const mockRefreshResponse = {
      data: {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        scope: 'openid profile'
      }
    };

    beforeEach(() => {
      mockVaultClient.getCredentials.mockResolvedValue({
        accessToken: 'old-access-token',
        refreshToken: 'old-refresh-token',
        expiresAt: Date.now() + 1000,
        scopes: ['openid', 'profile'],
        tenantId: 'tenant-123'
      });
    });

    it('should refresh access token using refresh token', async () => {
      mockedAxios.post.mockResolvedValue(mockRefreshResponse);

      const credentials = await oauthManager.refreshToken('tenant-123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://www.linkedin.com/oauth/v2/accessToken',
        expect.objectContaining({
          toString: expect.any(Function)
        }),
        expect.any(Object)
      );

      expect(credentials.accessToken).toBe('new-access-token');
      expect(credentials.refreshToken).toBe('new-refresh-token');
    });

    it('should update credentials in Vault after refresh', async () => {
      mockedAxios.post.mockResolvedValue(mockRefreshResponse);

      const credentials = await oauthManager.refreshToken('tenant-123');

      expect(mockVaultClient.storeCredentials).toHaveBeenCalledWith(
        'tenant-123',
        'linkedin',
        credentials
      );
    });

    it('should throw error when no refresh token is available', async () => {
      mockVaultClient.getCredentials.mockResolvedValue({
        accessToken: 'access-token',
        expiresAt: Date.now() + 1000,
        scopes: ['openid'],
        tenantId: 'tenant-123'
      } as OAuthCredentials);

      await expect(
        oauthManager.refreshToken('tenant-123')
      ).rejects.toThrow('No refresh token available');
    });

    it('should preserve old refresh token if new one not provided', async () => {
      const responseWithoutNewRefresh = {
        data: {
          access_token: 'new-access-token',
          expires_in: 3600
        }
      };

      mockedAxios.post.mockResolvedValue(responseWithoutNewRefresh);

      const credentials = await oauthManager.refreshToken('tenant-123');

      expect(credentials.refreshToken).toBe('old-refresh-token');
    });

    it('should handle refresh token expiration', async () => {
      mockedAxios.post.mockRejectedValue({
        message: 'Invalid refresh token',
        response: { data: { error: 'invalid_grant' } }
      });

      await expect(
        oauthManager.refreshToken('tenant-123')
      ).rejects.toThrow('Token refresh failed');
    });
  });

  describe('getValidToken', () => {
    it('should return token if not expiring soon', async () => {
      const futureExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      mockVaultClient.getCredentials.mockResolvedValue({
        accessToken: 'valid-token',
        expiresAt: futureExpiry,
        scopes: ['openid'],
        tenantId: 'tenant-123'
      } as OAuthCredentials);

      const token = await oauthManager.getValidToken('tenant-123');

      expect(token).toBe('valid-token');
      expect(mockVaultClient.getCredentials).toHaveBeenCalledTimes(1);
    });

    it('should refresh token if expiring within 5 minutes', async () => {
      const soonExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes
      mockVaultClient.getCredentials.mockResolvedValue({
        accessToken: 'expiring-token',
        refreshToken: 'refresh-token',
        expiresAt: soonExpiry,
        scopes: ['openid'],
        tenantId: 'tenant-123'
      } as OAuthCredentials);

      mockedAxios.post.mockResolvedValue({
        data: {
          access_token: 'refreshed-token',
          refresh_token: 'new-refresh',
          expires_in: 3600
        }
      });

      const token = await oauthManager.getValidToken('tenant-123');

      expect(token).toBe('refreshed-token');
    });

    it('should handle expired token by refreshing', async () => {
      const pastExpiry = Date.now() - 1000; // Already expired
      mockVaultClient.getCredentials.mockResolvedValue({
        accessToken: 'expired-token',
        refreshToken: 'refresh-token',
        expiresAt: pastExpiry,
        scopes: ['openid'],
        tenantId: 'tenant-123'
      } as OAuthCredentials);

      mockedAxios.post.mockResolvedValue({
        data: {
          access_token: 'new-token',
          refresh_token: 'new-refresh',
          expires_in: 3600
        }
      });

      const token = await oauthManager.getValidToken('tenant-123');

      expect(token).toBe('new-token');
    });
  });

  describe('hasValidCredentials', () => {
    it('should return true when credentials exist', async () => {
      mockVaultClient.getCredentials.mockResolvedValue({
        accessToken: 'token',
        expiresAt: Date.now() + 1000,
        scopes: ['openid'],
        tenantId: 'tenant-123'
      } as OAuthCredentials);

      const hasCredentials = await oauthManager.hasValidCredentials('tenant-123');

      expect(hasCredentials).toBe(true);
    });

    it('should return false when credentials do not exist', async () => {
      mockVaultClient.getCredentials.mockRejectedValue(new Error('Not found'));

      const hasCredentials = await oauthManager.hasValidCredentials('tenant-123');

      expect(hasCredentials).toBe(false);
    });
  });

  describe('revokeToken', () => {
    it('should delete credentials from Vault', async () => {
      mockVaultClient.getCredentials.mockResolvedValue({
        accessToken: 'token',
        expiresAt: Date.now() + 1000,
        scopes: ['openid'],
        tenantId: 'tenant-123'
      } as OAuthCredentials);

      await oauthManager.revokeToken('tenant-123');

      expect(mockVaultClient.deleteCredentials).toHaveBeenCalledWith('tenant-123', 'linkedin');
    });

    it('should handle errors during revocation', async () => {
      mockVaultClient.getCredentials.mockResolvedValue({
        accessToken: 'token',
        expiresAt: Date.now() + 1000,
        scopes: ['openid'],
        tenantId: 'tenant-123'
      } as OAuthCredentials);

      mockVaultClient.deleteCredentials.mockRejectedValue(new Error('Vault error'));

      await expect(
        oauthManager.revokeToken('tenant-123')
      ).rejects.toThrow('Vault error');
    });
  });

  describe('verifyState', () => {
    it('should verify valid state parameter', () => {
      const tenantId = 'tenant-123';
      const url = oauthManager.generateAuthUrl(tenantId);
      const state = new URL(url).searchParams.get('state');

      const isValid = oauthManager.verifyState(state!, tenantId);

      expect(isValid).toBe(true);
    });

    it('should reject state with wrong tenant ID', () => {
      const url = oauthManager.generateAuthUrl('tenant-123');
      const state = new URL(url).searchParams.get('state');

      const isValid = oauthManager.verifyState(state!, 'tenant-456');

      expect(isValid).toBe(false);
    });

    it('should reject malformed state parameter', () => {
      const isValid = oauthManager.verifyState('invalid-state', 'tenant-123');

      expect(isValid).toBe(false);
    });

    it('should reject expired state (older than 10 minutes)', () => {
      // Create old state manually
      const oldTimestamp = (Date.now() - 11 * 60 * 1000).toString(36);
      const oldState = `tenant-123:${oldTimestamp}:random`;

      const isValid = oauthManager.verifyState(oldState, 'tenant-123');

      expect(isValid).toBe(false);
    });
  });
});
