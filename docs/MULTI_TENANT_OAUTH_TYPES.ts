/**
 * Multi-Tenant OAuth Type Definitions
 * Connectors Platform - OAuth Management
 *
 * This file contains NEW type definitions for multi-tenant OAuth architecture.
 * These types should be merged into gateway/src/auth/types.ts
 */

// =============================================================================
// OAuth App Configuration (NEW)
// =============================================================================

/**
 * Tenant OAuth app configuration
 * Represents an OAuth app created by a tenant for a specific integration
 */
export interface TenantOAuthApp {
  /** Tenant identifier */
  tenantId: string;

  /** Integration name (e.g., "notion", "github", "slack") */
  integration: string;

  /** OAuth client ID from the integration's developer portal */
  clientId: string;

  /** OAuth client secret (stored encrypted in Vault) */
  clientSecret: string;

  /** OAuth authorization endpoint URL */
  authEndpoint: string;

  /** OAuth token endpoint URL */
  tokenEndpoint: string;

  /** OAuth callback/redirect URI */
  redirectUri: string;

  /** OAuth scopes requested */
  scopes?: string[];

  /** Metadata for tracking and management */
  metadata: TenantOAuthAppMetadata;
}

/**
 * Metadata for OAuth app configuration
 */
export interface TenantOAuthAppMetadata {
  /** When the OAuth app was registered */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;

  /** Who created/registered the app ("api", "config-file", or user ID) */
  createdBy: string;

  /** Environment this app is used in */
  environment: 'production' | 'staging' | 'development';

  /** Optional description */
  description?: string;

  /** Additional custom metadata */
  [key: string]: unknown;
}

/**
 * OAuth app configuration input (API request body)
 */
export interface OAuthAppConfigInput {
  /** OAuth client ID */
  clientId: string;

  /** OAuth client secret (will be encrypted) */
  clientSecret: string;

  /** OAuth authorization endpoint URL */
  authEndpoint?: string;

  /** OAuth token endpoint URL */
  tokenEndpoint?: string;

  /** OAuth callback/redirect URI */
  redirectUri?: string;

  /** OAuth scopes */
  scopes?: string[];

  /** Optional metadata */
  metadata?: {
    environment?: 'production' | 'staging' | 'development';
    description?: string;
    [key: string]: unknown;
  };
}

/**
 * OAuth app configuration response (API response, clientSecret masked)
 */
export interface OAuthAppConfigResponse {
  /** Tenant identifier */
  tenantId: string;

  /** Integration name */
  integration: string;

  /** OAuth client ID */
  clientId: string;

  /** OAuth client secret (masked as "********") */
  clientSecret: string;

  /** OAuth authorization endpoint URL */
  authEndpoint: string;

  /** OAuth token endpoint URL */
  tokenEndpoint: string;

  /** OAuth callback/redirect URI */
  redirectUri: string;

  /** OAuth scopes */
  scopes: string[];

  /** Metadata */
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    environment: string;
    description?: string;
  };
}

/**
 * Encrypted OAuth app data stored in Vault
 */
export interface EncryptedOAuthApp {
  /** OAuth client ID (plaintext) */
  clientId: string;

  /** Encrypted client secret (Vault ciphertext) */
  clientSecret: string;

  /** OAuth authorization endpoint URL */
  authEndpoint: string;

  /** OAuth token endpoint URL */
  tokenEndpoint: string;

  /** OAuth callback/redirect URI */
  redirectUri: string;

  /** OAuth scopes */
  scopes: string[];
}

// =============================================================================
// Config File Schema (NEW)
// =============================================================================

/**
 * OAuth apps configuration file schema
 */
export interface OAuthAppsConfig {
  /** Schema version */
  version: string;

  /** List of tenants and their OAuth apps */
  tenants: TenantConfig[];

  /** Default values per integration type */
  defaults?: Record<string, IntegrationDefaults>;
}

/**
 * Tenant configuration in config file
 */
export interface TenantConfig {
  /** Tenant identifier */
  tenantId: string;

  /** Human-readable display name */
  displayName?: string;

  /** Environment */
  environment?: 'production' | 'staging' | 'development';

  /** List of integrations for this tenant */
  integrations: IntegrationConfig[];
}

/**
 * Integration configuration in config file
 */
export interface IntegrationConfig {
  /** Integration name */
  integration: string;

  /** OAuth client ID */
  clientId: string;

  /** OAuth client secret */
  clientSecret: string;

  /** OAuth authorization endpoint (optional if in defaults) */
  authEndpoint?: string;

  /** OAuth token endpoint (optional if in defaults) */
  tokenEndpoint?: string;

  /** OAuth callback URI */
  redirectUri?: string;

  /** OAuth scopes (optional if in defaults) */
  scopes?: string[];
}

/**
 * Default integration configuration
 */
export interface IntegrationDefaults {
  /** Default authorization endpoint */
  authEndpoint: string;

  /** Default token endpoint */
  tokenEndpoint: string;

  /** Default scopes */
  scopes: string[];
}

// =============================================================================
// OAuth Config Manager (NEW)
// =============================================================================

/**
 * OAuth configuration source
 */
export type OAuthConfigSource = 'vault' | 'config-file' | 'memory';

/**
 * OAuth app lookup result
 */
export interface OAuthAppLookupResult {
  /** OAuth app configuration */
  app: TenantOAuthApp;

  /** Where the config was loaded from */
  source: OAuthConfigSource;

  /** Cache hit indicator */
  cached: boolean;
}

/**
 * OAuth config manager options
 */
export interface OAuthConfigManagerOptions {
  /** Vault client for storage */
  vaultClient?: VaultClient;

  /** Path to config file (optional) */
  configFilePath?: string;

  /** Enable caching */
  enableCache?: boolean;

  /** Cache TTL in milliseconds */
  cacheTTL?: number;

  /** Prefer config file over Vault (for dev) */
  preferConfigFile?: boolean;
}

// =============================================================================
// API Types (NEW)
// =============================================================================

/**
 * API request to register OAuth app
 */
export interface RegisterOAuthAppRequest {
  body: OAuthAppConfigInput;
  params: {
    tenantId: string;
    integration: string;
  };
  auth?: {
    tenantId: string;
    role: 'tenant' | 'admin';
  };
}

/**
 * API response for OAuth app registration
 */
export interface RegisterOAuthAppResponse {
  success: boolean;
  tenantId: string;
  integration: string;
  vaultPath: string;
  createdAt: string;
  error?: string;
}

/**
 * API request to get OAuth app
 */
export interface GetOAuthAppRequest {
  params: {
    tenantId: string;
    integration: string;
  };
  auth?: {
    tenantId: string;
    role: 'tenant' | 'admin';
  };
}

/**
 * API response for OAuth app retrieval
 */
export interface GetOAuthAppResponse {
  success: boolean;
  data?: OAuthAppConfigResponse;
  error?: string;
}

/**
 * API request to update OAuth app
 */
export interface UpdateOAuthAppRequest {
  body: Partial<OAuthAppConfigInput>;
  params: {
    tenantId: string;
    integration: string;
  };
  auth?: {
    tenantId: string;
    role: 'tenant' | 'admin';
  };
}

/**
 * API response for OAuth app update
 */
export interface UpdateOAuthAppResponse {
  success: boolean;
  tenantId: string;
  integration: string;
  updatedAt: string;
  error?: string;
}

/**
 * API request to delete OAuth app
 */
export interface DeleteOAuthAppRequest {
  params: {
    tenantId: string;
    integration: string;
  };
  query?: {
    deleteUserCredentials?: boolean;
  };
  auth?: {
    tenantId: string;
    role: 'tenant' | 'admin';
  };
}

/**
 * API response for OAuth app deletion
 */
export interface DeleteOAuthAppResponse {
  success: boolean;
  tenantId: string;
  integration: string;
  deletedAt: string;
  userCredentialsDeleted: boolean;
  error?: string;
}

/**
 * API request to list OAuth apps
 */
export interface ListOAuthAppsRequest {
  params: {
    tenantId: string;
  };
  auth?: {
    tenantId: string;
    role: 'tenant' | 'admin';
  };
}

/**
 * OAuth app summary in list response
 */
export interface OAuthAppSummary {
  integration: string;
  clientId: string;
  hasUserCredentials: boolean;
  createdAt: string;
}

/**
 * API response for listing OAuth apps
 */
export interface ListOAuthAppsResponse {
  success: boolean;
  tenantId: string;
  integrations: OAuthAppSummary[];
  error?: string;
}

// =============================================================================
// Vault Types (Extensions to existing types)
// =============================================================================

/**
 * Extended Vault config with OAuth app support
 */
export interface ExtendedVaultConfig extends VaultConfig {
  /** Base path for OAuth apps (default: "oauth-apps") */
  oauthAppsPath?: string;
}

/**
 * Vault path builder for OAuth apps
 */
export interface OAuthAppVaultPath {
  /** Tenant identifier */
  tenantId: string;

  /** Integration name */
  integration: string;

  /** Full KV v2 data path */
  dataPath: string;

  /** Full KV v2 metadata path */
  metadataPath: string;

  /** Transit encryption key name */
  transitKey: string;
}

// =============================================================================
// Error Types (NEW)
// =============================================================================

/**
 * OAuth app configuration error
 */
export interface OAuthAppConfigError {
  /** Error type */
  type: 'missing_fields' | 'invalid_format' | 'vault_error' | 'not_found' | 'unauthorized';

  /** Error message */
  message: string;

  /** Missing or invalid fields */
  fields?: string[];

  /** Tenant ID */
  tenantId?: string;

  /** Integration name */
  integration?: string;
}

// =============================================================================
// Validation Types (NEW)
// =============================================================================

/**
 * OAuth app validation result
 */
export interface OAuthAppValidationResult {
  /** Is the configuration valid */
  valid: boolean;

  /** Validation errors */
  errors: OAuthAppValidationError[];

  /** Validation warnings */
  warnings: OAuthAppValidationWarning[];
}

/**
 * OAuth app validation error
 */
export interface OAuthAppValidationError {
  /** Field name */
  field: string;

  /** Error message */
  message: string;

  /** Severity */
  severity: 'error';
}

/**
 * OAuth app validation warning
 */
export interface OAuthAppValidationWarning {
  /** Field name */
  field: string;

  /** Warning message */
  message: string;

  /** Severity */
  severity: 'warning';
}

// =============================================================================
// Migration Types (NEW)
// =============================================================================

/**
 * OAuth config migration options
 */
export interface OAuthConfigMigrationOptions {
  /** Source of configs to migrate */
  source: 'memory' | 'config-file';

  /** Dry run (don't actually write to Vault) */
  dryRun?: boolean;

  /** Skip existing configs in Vault */
  skipExisting?: boolean;

  /** Validation mode */
  validateOnly?: boolean;
}

/**
 * OAuth config migration result
 */
export interface OAuthConfigMigrationResult {
  /** Total configs processed */
  total: number;

  /** Successfully migrated */
  migrated: number;

  /** Skipped (already exist) */
  skipped: number;

  /** Failed to migrate */
  failed: number;

  /** Detailed results */
  details: OAuthConfigMigrationDetail[];
}

/**
 * OAuth config migration detail
 */
export interface OAuthConfigMigrationDetail {
  /** Tenant ID */
  tenantId: string;

  /** Integration name */
  integration: string;

  /** Migration status */
  status: 'success' | 'skipped' | 'failed';

  /** Vault path (if successful) */
  vaultPath?: string;

  /** Error message (if failed) */
  error?: string;
}

// =============================================================================
// Type Guards (NEW)
// =============================================================================

/**
 * Type guard for TenantOAuthApp
 */
export function isTenantOAuthApp(obj: unknown): obj is TenantOAuthApp {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'tenantId' in obj &&
    'integration' in obj &&
    'clientId' in obj &&
    'clientSecret' in obj &&
    'authEndpoint' in obj &&
    'tokenEndpoint' in obj
  );
}

/**
 * Type guard for OAuthAppsConfig
 */
export function isOAuthAppsConfig(obj: unknown): obj is OAuthAppsConfig {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'version' in obj &&
    'tenants' in obj &&
    Array.isArray((obj as OAuthAppsConfig).tenants)
  );
}

// =============================================================================
// Re-exports of existing types (for convenience)
// =============================================================================

// These types already exist in gateway/src/auth/types.ts
// Re-exported here for convenience in multi-tenant context

export type {
  OAuthCredentials,
  OAuthTokenResponse,
  EncryptedCredentials,
  CredentialMetadata,
  VaultPath,
  RefreshJob,
  MCPRequest,
  MCPResponse,
  VaultConfig,
  OAuthClientConfig
} from './types';
