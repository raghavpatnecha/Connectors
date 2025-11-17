/**
 * Token manager for Product Hunt API tokens
 *
 * Handles token retrieval and caching for multi-tenant scenarios
 */

import { VaultClient } from './vault-client.js';
import { logger } from '../utils/logger.js';
import { TokenError } from '../utils/error-handler.js';

export class TokenManager {
  private vaultClient: VaultClient;
  private tokenCache: Map<string, { token: string; cachedAt: number }> = new Map();
  private cacheTTL: number = 3600000; // 1 hour in milliseconds

  constructor(vaultClient: VaultClient) {
    this.vaultClient = vaultClient;
  }

  /**
   * Get valid API token for a tenant
   * Uses cache with TTL to reduce Vault calls
   */
  async getToken(tenantId: string): Promise<string> {
    // Check cache first
    const cached = this.tokenCache.get(tenantId);
    if (cached) {
      const age = Date.now() - cached.cachedAt;
      if (age < this.cacheTTL) {
        logger.debug('Using cached API token', { tenantId, age });
        return cached.token;
      }
      logger.debug('Cached token expired', { tenantId, age });
    }

    // Fetch from Vault
    const token = await this.vaultClient.getToken(tenantId);

    if (!token) {
      throw new TokenError(
        `No Product Hunt API token found for tenant: ${tenantId}. Please configure the token in Vault.`
      );
    }

    // Update cache
    this.tokenCache.set(tenantId, {
      token,
      cachedAt: Date.now(),
    });

    logger.info('API token retrieved from Vault', { tenantId });

    return token;
  }

  /**
   * Store API token for a tenant
   */
  async storeToken(tenantId: string, apiToken: string): Promise<void> {
    // Ensure encryption key exists
    await this.vaultClient.ensureEncryptionKey(tenantId);

    // Store in Vault
    await this.vaultClient.storeToken(tenantId, apiToken);

    // Update cache
    this.tokenCache.set(tenantId, {
      token: apiToken,
      cachedAt: Date.now(),
    });

    logger.info('API token stored and cached', { tenantId });
  }

  /**
   * Revoke (delete) API token for a tenant
   */
  async revokeToken(tenantId: string): Promise<void> {
    // Delete from Vault
    await this.vaultClient.deleteToken(tenantId);

    // Remove from cache
    this.tokenCache.delete(tenantId);

    logger.info('API token revoked', { tenantId });
  }

  /**
   * Clear the token cache (useful for testing)
   */
  clearCache(): void {
    this.tokenCache.clear();
    logger.debug('Token cache cleared');
  }

  /**
   * Check if tenant has a token configured
   */
  async hasToken(tenantId: string): Promise<boolean> {
    // Check cache first
    if (this.tokenCache.has(tenantId)) {
      return true;
    }

    // Check Vault
    return this.vaultClient.hasToken(tenantId);
  }
}
