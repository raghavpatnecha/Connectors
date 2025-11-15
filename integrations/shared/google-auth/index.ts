/**
 * Shared Google OAuth Authentication Module
 * Entry point for all Google Workspace MCP servers
 */

export { OAuthManager, OAuthConfig } from './oauth-manager.js';
export { VaultClient, StoredCredentials } from './vault-client.js';
export { GoogleClientFactory } from './google-client-factory.js';
export {
  GOOGLE_OAUTH_CONFIG,
  GOOGLE_SCOPES,
  SCOPE_SETS,
  GoogleOAuthConfig,
  validateOAuthConfig,
  getScopesForService,
  hasRequiredScopes,
} from './oauth-config.js';
