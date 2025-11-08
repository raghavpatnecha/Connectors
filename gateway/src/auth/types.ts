/**
 * OAuth and authentication type definitions for MCP Gateway
 * Connectors Platform - OAuth Management
 */

/**
 * OAuth credentials stored in Vault
 */
export interface OAuthCredentials {
  /** OAuth access token (encrypted in Vault) */
  accessToken: string;

  /** OAuth refresh token (encrypted in Vault) */
  refreshToken: string;

  /** Token expiration timestamp */
  expiresAt: Date;

  /** OAuth scopes granted */
  scopes: string[];

  /** Token type (usually "Bearer") */
  tokenType?: string;

  /** Integration identifier (e.g., "github", "slack") */
  integration: string;
}

/**
 * Raw OAuth token response from provider
 */
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  token_type: string;
}

/**
 * Vault-encrypted credential data
 */
export interface EncryptedCredentials {
  /** Encrypted access token (Vault ciphertext) */
  accessToken: string;

  /** Encrypted refresh token (Vault ciphertext) */
  refreshToken: string;

  /** Token expiration timestamp */
  expiresAt: string;

  /** OAuth scopes */
  scopes: string[];

  /** Token type */
  tokenType: string;
}

/**
 * Credential metadata for tracking
 */
export interface CredentialMetadata {
  /** Created timestamp */
  createdAt: Date;

  /** Last updated timestamp */
  updatedAt: Date;

  /** Created by (service/user) */
  createdBy: string;

  /** Integration name */
  integration: string;

  /** Auto-refresh enabled */
  autoRefresh: boolean;

  /** Number of refreshes performed */
  refreshCount: number;
}

/**
 * Vault storage path components
 */
export interface VaultPath {
  /** Tenant identifier */
  tenantId: string;

  /** Integration identifier */
  integration: string;
}

/**
 * Refresh job configuration
 */
export interface RefreshJob {
  /** Unique job ID */
  id: string;

  /** Tenant ID */
  tenantId: string;

  /** Integration name */
  integration: string;

  /** Scheduled run time */
  runAt: Date;

  /** Retry count */
  retryCount: number;

  /** Job status */
  status: 'pending' | 'running' | 'completed' | 'failed';
}

/**
 * MCP request with OAuth context
 */
export interface MCPRequest {
  /** Tenant identifier */
  tenantId: string;

  /** Integration name */
  integration: string;

  /** HTTP method */
  method: string;

  /** Request path */
  path: string;

  /** Request headers */
  headers?: Record<string, string>;

  /** Request body */
  body?: unknown;

  /** Retry flag (internal) */
  _retry?: boolean;
}

/**
 * MCP response
 */
export interface MCPResponse {
  /** HTTP status code */
  status: number;

  /** Response headers */
  headers: Record<string, string>;

  /** Response data */
  data: unknown;

  /** Error message if failed */
  error?: string;
}

/**
 * Vault configuration
 */
export interface VaultConfig {
  /** Vault server address */
  address: string;

  /** Vault token */
  token: string;

  /** Transit engine mount path */
  transitEngine?: string;

  /** KV v2 mount path */
  kvEngine?: string;

  /** Request timeout (ms) */
  timeout?: number;

  /** Max retries */
  maxRetries?: number;
}

/**
 * OAuth client configuration for refresh
 */
export interface OAuthClientConfig {
  /** Client ID */
  clientId: string;

  /** Client secret */
  clientSecret: string;

  /** Token endpoint URL */
  tokenEndpoint: string;

  /** Authorization endpoint URL */
  authEndpoint: string;

  /** Redirect URI */
  redirectUri?: string;
}
