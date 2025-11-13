/**
 * Reddit Unified MCP - Auth Type Definitions
 *
 * Comprehensive type definitions for Reddit OAuth 2.0 authentication,
 * session management, and Vault integration.
 *
 * @module auth/types
 */

/**
 * OAuth 2.0 token response from Reddit
 */
export interface RedditOAuthTokens {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

/**
 * OAuth credentials with metadata
 */
export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scopes: string[];
  tokenType: 'bearer';
}

/**
 * Reddit OAuth configuration
 */
export interface RedditOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  userAgent: string;
  scopes: string[];
}

/**
 * Session data stored in cache
 */
export interface SessionData {
  tenantId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  scopes: string[];
  username?: string;
  createdAt: number;
  lastUsedAt: number;
}

/**
 * Vault credential storage format
 */
export interface VaultCredentials {
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  scopes: string[];
  created_at: string;
  metadata: {
    tenant_id: string;
    integration: string;
    username?: string;
  };
}

/**
 * Vault configuration
 */
export interface VaultConfig {
  address: string;
  token: string;
  namespace?: string;
  transitEngine: string;
  kvEngine: string;
}

/**
 * Token refresh result
 */
export interface TokenRefreshResult {
  success: boolean;
  credentials?: OAuthCredentials;
  error?: string;
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  valid: boolean;
  session?: SessionData;
  reason?: string;
}

/**
 * OAuth error response
 */
export interface OAuthErrorResponse {
  error: string;
  error_description?: string;
}

/**
 * Tenant context for multi-tenant auth
 */
export interface TenantContext {
  tenantId: string;
  encryptionKeyId: string;
  metadata?: Record<string, unknown>;
}
