# OAuth Refactoring Plan: Multi-Tenant Architecture

**Version:** 1.0.0
**Date:** 2025-11-12
**Status:** Implementation Roadmap

---

## Executive Summary

This document outlines the step-by-step refactoring plan to transform the current Notion-specific OAuth implementation into a unified multi-tenant OAuth architecture that supports all integrations.

**Goals:**
1. ✅ Support multi-tenant OAuth apps (each tenant creates their own apps)
2. ✅ Enable both API and config file credential registration
3. ✅ Eliminate code duplication
4. ✅ Maintain backward compatibility with Notion integration
5. ✅ Ensure zero downtime during migration

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Code Duplication Audit](#code-duplication-audit)
3. [Notion-Specific Code Audit](#notion-specific-code-audit)
4. [File-by-File Changes](#file-by-file-changes)
5. [Implementation Phases](#implementation-phases)
6. [Testing Strategy](#testing-strategy)
7. [Rollback Plan](#rollback-plan)

---

## Current State Analysis

### Files Analyzed

| File | Purpose | Multi-Tenant Ready? | Needs Changes? |
|------|---------|---------------------|----------------|
| `gateway/src/auth/vault-client.ts` | Vault operations for credentials | ✅ Yes | ⚠️ Minor (add OAuth app methods) |
| `gateway/src/auth/oauth-proxy.ts` | OAuth proxy with auto-refresh | ⚠️ Partial | ✅ Yes (use VaultClient for configs) |
| `gateway/src/auth/refresh-scheduler.ts` | Token refresh scheduler | ✅ Yes | ❌ No |
| `gateway/src/auth/types.ts` | Type definitions | ⚠️ Partial | ✅ Yes (add new types) |
| `gateway/src/errors/oauth-errors.ts` | Error classes | ✅ Yes | ⚠️ Minor (add OAuth app errors) |
| `vault/scripts/init-notion-oauth.sh` | Notion-specific init script | ❌ No | ✅ Yes (generalize) |
| `vault/configs/notion-oauth-config.json` | Notion OAuth config | ❌ No | ✅ Yes (convert to multi-tenant) |
| `vault/policies/notion-oauth-policy.hcl` | Notion-specific policy | ❌ No | ✅ Yes (already have generic) |

### Current Architecture Strengths

✅ **Well-designed abstractions:**
- `VaultClient` already supports multi-tenant paths (`secret/data/{tenantId}/{integration}`)
- `OAuthProxy` has clean separation of concerns
- `RefreshScheduler` is integration-agnostic

✅ **Security best practices:**
- Per-tenant encryption with Transit engine
- Proper error handling
- Audit logging ready

### Current Architecture Gaps

❌ **Missing OAuth app credential storage:**
- No mechanism to store/retrieve OAuth client configs from Vault
- Configs registered programmatically via `registerOAuthConfig()`, not persisted

❌ **Notion-specific code paths:**
- Init script hardcoded for Notion
- Config file schema Notion-specific
- No generic templates for other integrations

❌ **No API for OAuth app management:**
- Can't register OAuth apps via REST API
- Can't update/delete OAuth apps
- No listing endpoint

---

## Code Duplication Audit

### Identified Duplication

**1. Vault Path Building**

**Current State:**
- `VaultClient._buildKVPath()` builds user credential paths
- No equivalent for OAuth app paths
- Path pattern duplicated in init script

**Recommended Fix:**
- Add `_buildOAuthAppPath()` method
- Create `VaultPathBuilder` utility class
- Use consistent path patterns everywhere

**2. Encryption/Decryption**

**Current State:**
- `VaultClient._encrypt()` and `_decrypt()` methods (good)
- Used for user tokens
- Should also be used for OAuth app secrets

**Recommended Fix:**
- ✅ No changes needed (already reusable)
- Document usage for OAuth app secrets

**3. Policy Definitions**

**Current State:**
- `oauth-policy.hcl` (generic, good)
- `notion-oauth-policy.hcl` (Notion-specific, redundant)

**Recommended Fix:**
- Use `oauth-policy.hcl` for all integrations
- Deprecate `notion-oauth-policy.hcl`
- Add OAuth app path to generic policy

**4. Endpoint Configuration**

**Current State:**
- Endpoints hardcoded in Notion config file
- Would be duplicated for each integration

**Recommended Fix:**
- Create `IntegrationDefaults` registry
- Store in `gateway/config/integration-defaults.json`
- Load defaults at startup

---

## Notion-Specific Code Audit

### Files to Generalize

#### 1. `vault/scripts/init-notion-oauth.sh`

**Notion-Specific Code:**

```bash
# Line 43-45
POLICY_FILE="${VAULT_DIR}/policies/notion-oauth-policy.hcl"
CONFIG_FILE="${VAULT_DIR}/configs/notion-oauth-config.json"

# Line 56
POLICY_NAME="notion-oauth"

# Line 203-204
local key_name="notion-${tenant_id}"

# Line 284
local cred_path="${KV_MOUNT}/data/tenants/${tenant_id}/notion"
```

**Generalization Plan:**

```bash
# New script: vault/scripts/init-oauth.sh

# Accept integration as parameter
INTEGRATION="${1:-notion}"  # Default to notion for backward compat

# Generic paths
POLICY_FILE="${VAULT_DIR}/policies/oauth-policy.hcl"
POLICY_NAME="oauth-apps"

# Generic key name (per-tenant, not per-integration)
local key_name="${tenant_id}"

# Generic credential path
local cred_path="${KV_MOUNT}/data/tenants/${tenant_id}/${INTEGRATION}"
```

#### 2. `vault/configs/notion-oauth-config.json`

**Notion-Specific Schema:**

```json
{
  "oauth": {
    "provider": "notion",
    "endpoints": {
      "authorization": { "url": "https://api.notion.com/v1/oauth/authorize" },
      "token": { "url": "https://api.notion.com/v1/oauth/token" }
    }
  }
}
```

**Generalization Plan:**

Replace with multi-tenant config:

```json
{
  "version": "1.0.0",
  "tenants": [
    {
      "tenantId": "test-tenant-001",
      "integrations": [
        {
          "integration": "notion",
          "clientId": "notion_test_abc123",
          "clientSecret": "secret_test_xyz789"
        }
      ]
    }
  ],
  "defaults": {
    "notion": {
      "authEndpoint": "https://api.notion.com/v1/oauth/authorize",
      "tokenEndpoint": "https://api.notion.com/v1/oauth/token"
    }
  }
}
```

#### 3. `vault/policies/notion-oauth-policy.hcl`

**Notion-Specific Paths:**

```hcl
# Line 20
path "secret/data/tenants/*/notion" {
  capabilities = ["create", "read", "update", "delete"]
}

# Line 50
path "transit/encrypt/notion-*" {
  capabilities = ["update"]
}
```

**Generalization Plan:**

Use existing `oauth-policy.hcl` which already has generic paths:

```hcl
# Generic for all integrations
path "secret/data/*" {
  capabilities = ["create", "read", "update", "delete"]
}

# Generic transit encryption
path "transit/encrypt/*" {
  capabilities = ["update"]
}
```

Add OAuth app paths:

```hcl
# OAuth app credentials
path "secret/data/oauth-apps/*" {
  capabilities = ["create", "read", "update", "delete"]
}
```

---

## File-by-File Changes

### Phase 1: Foundation (No Breaking Changes)

#### 1.1 Update `gateway/src/auth/types.ts`

**Changes:**
- Add new types from `MULTI_TENANT_OAUTH_TYPES.ts`
- Keep existing types for backward compatibility

**Impact:** ✅ No breaking changes

**Files Modified:** 1

**Estimated Effort:** 2 hours

**Code Changes:**

```typescript
// ADD: New interfaces for OAuth app management

export interface TenantOAuthApp {
  tenantId: string;
  integration: string;
  clientId: string;
  clientSecret: string;
  authEndpoint: string;
  tokenEndpoint: string;
  redirectUri: string;
  scopes?: string[];
  metadata: TenantOAuthAppMetadata;
}

export interface TenantOAuthAppMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  environment: 'production' | 'staging' | 'development';
  description?: string;
}

// ... (See MULTI_TENANT_OAUTH_TYPES.ts for full definitions)
```

#### 1.2 Extend `gateway/src/auth/vault-client.ts`

**Changes:**
- Add methods for OAuth app credential management
- Add `_buildOAuthAppPath()` helper
- Add `storeOAuthApp()`, `getOAuthApp()`, `deleteOAuthApp()`, `listOAuthApps()`

**Impact:** ✅ Additive only, no breaking changes

**Files Modified:** 1

**Estimated Effort:** 4 hours

**Code Changes:**

```typescript
export class VaultClient {
  // ... existing code ...

  /**
   * Store OAuth app credentials (NEW)
   */
  async storeOAuthApp(
    tenantId: string,
    integration: string,
    app: TenantOAuthApp
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Ensure encryption key exists
      await this._ensureEncryptionKey(tenantId);

      // Encrypt client secret
      const encryptedSecret = await this._encrypt(tenantId, app.clientSecret);

      // Prepare encrypted app data
      const encryptedApp: EncryptedOAuthApp = {
        clientId: app.clientId,
        clientSecret: encryptedSecret,
        authEndpoint: app.authEndpoint,
        tokenEndpoint: app.tokenEndpoint,
        redirectUri: app.redirectUri,
        scopes: app.scopes || []
      };

      // Store in KV v2
      const path = this._buildOAuthAppPath(tenantId, integration);
      await this._retryOperation(async () => {
        await this._client.post(`/v1/${path}`, {
          data: encryptedApp,
          metadata: app.metadata
        });
      });

      const duration = Date.now() - startTime;
      logger.info('OAuth app stored successfully', {
        tenantId,
        integration,
        duration
      });
    } catch (error) {
      logger.error('Failed to store OAuth app', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new VaultError(
        'Failed to store OAuth app',
        'store',
        this._buildOAuthAppPath(tenantId, integration),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Retrieve and decrypt OAuth app credentials (NEW)
   */
  async getOAuthApp(
    tenantId: string,
    integration: string
  ): Promise<TenantOAuthApp> {
    const startTime = Date.now();

    try {
      const path = this._buildOAuthAppPath(tenantId, integration);
      const response = await this._retryOperation(async () => {
        return await this._client.get(`/v1/${path}`);
      });

      if (!response.data?.data?.data) {
        throw new CredentialNotFoundError(integration, tenantId, path);
      }

      const encryptedApp: EncryptedOAuthApp = response.data.data.data;
      const metadata = response.data.data.metadata;

      // Decrypt client secret
      const clientSecret = await this._decrypt(tenantId, encryptedApp.clientSecret);

      const app: TenantOAuthApp = {
        tenantId,
        integration,
        clientId: encryptedApp.clientId,
        clientSecret,
        authEndpoint: encryptedApp.authEndpoint,
        tokenEndpoint: encryptedApp.tokenEndpoint,
        redirectUri: encryptedApp.redirectUri,
        scopes: encryptedApp.scopes,
        metadata: {
          createdAt: new Date(metadata.createdAt),
          updatedAt: new Date(metadata.updatedAt),
          createdBy: metadata.createdBy,
          environment: metadata.environment
        }
      };

      const duration = Date.now() - startTime;
      logger.debug('OAuth app retrieved successfully', {
        tenantId,
        integration,
        duration
      });

      return app;
    } catch (error) {
      if (error instanceof CredentialNotFoundError) {
        throw error;
      }

      logger.error('Failed to retrieve OAuth app', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new VaultError(
        'Failed to retrieve OAuth app',
        'get',
        this._buildOAuthAppPath(tenantId, integration),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Delete OAuth app credentials (NEW)
   */
  async deleteOAuthApp(tenantId: string, integration: string): Promise<void> {
    try {
      const path = this._buildOAuthAppPath(tenantId, integration);
      await this._retryOperation(async () => {
        await this._client.delete(`/v1/${path}`);
      });

      logger.info('OAuth app deleted', { tenantId, integration });
    } catch (error) {
      logger.error('Failed to delete OAuth app', {
        tenantId,
        integration,
        error: error instanceof Error ? error.message : String(error)
      });
      throw new VaultError(
        'Failed to delete OAuth app',
        'delete',
        this._buildOAuthAppPath(tenantId, integration),
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * List all OAuth apps for a tenant (NEW)
   */
  async listOAuthApps(tenantId: string): Promise<string[]> {
    try {
      const metadataPath = `oauth-apps/metadata/${tenantId}`;
      const response = await this._client.request({
        method: 'LIST',
        url: `/v1/${this._kvEngine}/${metadataPath}`
      });

      return response.data?.data?.keys || [];
    } catch (error) {
      logger.error('Failed to list OAuth apps', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Build KV v2 path for OAuth apps (NEW)
   */
  private _buildOAuthAppPath(tenantId: string, integration: string): string {
    return `${this._kvEngine}/data/oauth-apps/${tenantId}/${integration}`;
  }

  // ... existing methods ...
}
```

#### 1.3 Create `gateway/src/auth/oauth-config-manager.ts` (NEW FILE)

**Purpose:** Unified interface for OAuth app config management (Vault + Config File)

**Impact:** ✅ New file, no breaking changes

**Files Created:** 1

**Estimated Effort:** 6 hours

**Code:**

```typescript
/**
 * OAuth Config Manager - Unified interface for OAuth app configuration
 * Supports both Vault (production) and config file (dev/testing)
 */

import { promises as fs } from 'fs';
import { createLogger } from 'winston';
import { VaultClient } from './vault-client';
import {
  TenantOAuthApp,
  OAuthAppsConfig,
  OAuthConfigSource,
  OAuthAppLookupResult,
  OAuthConfigManagerOptions,
  IntegrationDefaults
} from './types';
import { InvalidOAuthConfigError } from '../errors/oauth-errors';

const logger = createLogger({
  defaultMeta: { service: 'oauth-config-manager' }
});

export class OAuthConfigManager {
  private readonly _vault?: VaultClient;
  private readonly _configFilePath?: string;
  private readonly _preferConfigFile: boolean;
  private readonly _enableCache: boolean;
  private readonly _cacheTTL: number;

  // In-memory caches
  private _configFileApps: Map<string, TenantOAuthApp> = new Map();
  private _vaultAppsCache: Map<string, { app: TenantOAuthApp; cachedAt: number }> = new Map();
  private _integrationDefaults: Map<string, IntegrationDefaults> = new Map();

  constructor(options: OAuthConfigManagerOptions) {
    this._vault = options.vaultClient;
    this._configFilePath = options.configFilePath;
    this._preferConfigFile = options.preferConfigFile || false;
    this._enableCache = options.enableCache !== false;
    this._cacheTTL = options.cacheTTL || 300000; // 5 minutes default

    logger.info('OAuthConfigManager initialized', {
      hasVault: !!this._vault,
      hasConfigFile: !!this._configFilePath,
      preferConfigFile: this._preferConfigFile,
      enableCache: this._enableCache
    });
  }

  /**
   * Initialize the config manager
   * Loads config file if present
   */
  async initialize(): Promise<void> {
    if (this._configFilePath) {
      await this._loadConfigFile();
    }
  }

  /**
   * Get OAuth app configuration for tenant and integration
   */
  async getOAuthApp(tenantId: string, integration: string): Promise<OAuthAppLookupResult> {
    const cacheKey = `${tenantId}:${integration}`;

    // Check cache first
    if (this._enableCache) {
      const cached = this._vaultAppsCache.get(cacheKey);
      if (cached && Date.now() - cached.cachedAt < this._cacheTTL) {
        logger.debug('OAuth app cache hit', { tenantId, integration });
        return {
          app: cached.app,
          source: 'vault',
          cached: true
        };
      }
    }

    // Try config file first if preferred
    if (this._preferConfigFile && this._configFileApps.size > 0) {
      const app = this._configFileApps.get(cacheKey);
      if (app) {
        return {
          app,
          source: 'config-file',
          cached: false
        };
      }
    }

    // Try Vault
    if (this._vault) {
      try {
        const app = await this._vault.getOAuthApp(tenantId, integration);

        // Cache if enabled
        if (this._enableCache) {
          this._vaultAppsCache.set(cacheKey, {
            app,
            cachedAt: Date.now()
          });
        }

        return {
          app,
          source: 'vault',
          cached: false
        };
      } catch (error) {
        // If Vault fails and config file exists, try config file as fallback
        if (this._configFileApps.size > 0) {
          const app = this._configFileApps.get(cacheKey);
          if (app) {
            logger.warn('Vault failed, using config file fallback', {
              tenantId,
              integration,
              error: error instanceof Error ? error.message : String(error)
            });
            return {
              app,
              source: 'config-file',
              cached: false
            };
          }
        }

        throw error;
      }
    }

    // Try config file as last resort
    if (this._configFileApps.size > 0) {
      const app = this._configFileApps.get(cacheKey);
      if (app) {
        return {
          app,
          source: 'config-file',
          cached: false
        };
      }
    }

    throw new InvalidOAuthConfigError(
      `No OAuth app found for tenant '${tenantId}' and integration '${integration}'`,
      integration,
      []
    );
  }

  /**
   * Register OAuth app via API
   */
  async registerOAuthApp(app: TenantOAuthApp): Promise<void> {
    if (!this._vault) {
      throw new Error('Vault client not configured');
    }

    await this._vault.storeOAuthApp(app.tenantId, app.integration, app);

    // Invalidate cache
    if (this._enableCache) {
      const cacheKey = `${app.tenantId}:${app.integration}`;
      this._vaultAppsCache.delete(cacheKey);
    }
  }

  /**
   * Load OAuth apps from config file
   */
  private async _loadConfigFile(): Promise<void> {
    if (!this._configFilePath) {
      return;
    }

    try {
      const content = await fs.readFile(this._configFilePath, 'utf-8');
      const config: OAuthAppsConfig = JSON.parse(content);

      // Load integration defaults
      if (config.defaults) {
        for (const [integration, defaults] of Object.entries(config.defaults)) {
          this._integrationDefaults.set(integration, defaults);
        }
      }

      // Load tenant OAuth apps
      let loadedCount = 0;
      for (const tenant of config.tenants) {
        for (const integration of tenant.integrations) {
          // Merge with defaults
          const defaults = this._integrationDefaults.get(integration.integration);

          const app: TenantOAuthApp = {
            tenantId: tenant.tenantId,
            integration: integration.integration,
            clientId: integration.clientId,
            clientSecret: integration.clientSecret,
            authEndpoint: integration.authEndpoint || defaults?.authEndpoint || '',
            tokenEndpoint: integration.tokenEndpoint || defaults?.tokenEndpoint || '',
            redirectUri: integration.redirectUri || '',
            scopes: integration.scopes || defaults?.scopes || [],
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'config-file',
              environment: tenant.environment || 'development'
            }
          };

          const cacheKey = `${app.tenantId}:${app.integration}`;
          this._configFileApps.set(cacheKey, app);
          loadedCount++;
        }
      }

      logger.info('Loaded OAuth apps from config file', {
        path: this._configFilePath,
        tenantsCount: config.tenants.length,
        appsCount: loadedCount
      });
    } catch (error) {
      logger.error('Failed to load OAuth apps config file', {
        path: this._configFilePath,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this._vaultAppsCache.clear();
    logger.debug('OAuth app cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this._vaultAppsCache.size,
      keys: Array.from(this._vaultAppsCache.keys())
    };
  }
}
```

#### 1.4 Update `gateway/src/errors/oauth-errors.ts`

**Changes:**
- Add `OAuthAppNotFoundError`
- Add `OAuthAppConfigError`

**Impact:** ✅ Additive only

**Files Modified:** 1

**Estimated Effort:** 1 hour

**Code Changes:**

```typescript
/**
 * OAuth app not found in Vault or config
 */
export class OAuthAppNotFoundError extends OAuthError {
  constructor(
    integration: string,
    tenantId: string
  ) {
    super(
      `OAuth app not found for integration '${integration}' and tenant '${tenantId}'`,
      integration,
      tenantId
    );
    this.name = 'OAuthAppNotFoundError';
  }
}

/**
 * OAuth app configuration error
 */
export class OAuthAppConfigError extends OAuthError {
  constructor(
    message: string,
    integration: string,
    tenantId: string,
    public readonly validationErrors: string[]
  ) {
    super(message, integration, tenantId);
    this.name = 'OAuthAppConfigError';
  }
}
```

#### 1.5 Update `vault/policies/oauth-policy.hcl`

**Changes:**
- Add OAuth app credential paths

**Impact:** ✅ Additive only

**Files Modified:** 1

**Estimated Effort:** 1 hour

**Code Changes:**

```hcl
# ADD: OAuth App Credentials Management
# Path: secret/data/oauth-apps/{tenant-id}/{integration}

path "secret/data/oauth-apps/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "secret/metadata/oauth-apps/*" {
  capabilities = ["read", "list", "delete"]
}

# ... (keep existing paths) ...
```

### Phase 2: API Endpoints

#### 2.1 Create `gateway/src/api/oauth-apps-controller.ts` (NEW FILE)

**Purpose:** REST API endpoints for OAuth app management

**Impact:** ✅ New file, no breaking changes

**Files Created:** 1

**Estimated Effort:** 8 hours

**Code:** (See architecture doc for endpoint specifications)

```typescript
/**
 * OAuth Apps Controller - REST API for OAuth app management
 */

import { Router, Request, Response } from 'express';
import { OAuthConfigManager } from '../auth/oauth-config-manager';
import {
  RegisterOAuthAppRequest,
  GetOAuthAppRequest,
  UpdateOAuthAppRequest,
  DeleteOAuthAppRequest,
  ListOAuthAppsRequest
} from '../auth/types';

export class OAuthAppsController {
  private readonly _configManager: OAuthConfigManager;
  private readonly _router: Router;

  constructor(configManager: OAuthConfigManager) {
    this._configManager = configManager;
    this._router = Router();
    this._setupRoutes();
  }

  private _setupRoutes(): void {
    // POST /api/v1/oauth-apps/:tenantId/:integration
    this._router.post('/:tenantId/:integration', this._registerOAuthApp.bind(this));

    // GET /api/v1/oauth-apps/:tenantId/:integration
    this._router.get('/:tenantId/:integration', this._getOAuthApp.bind(this));

    // PUT /api/v1/oauth-apps/:tenantId/:integration
    this._router.put('/:tenantId/:integration', this._updateOAuthApp.bind(this));

    // DELETE /api/v1/oauth-apps/:tenantId/:integration
    this._router.delete('/:tenantId/:integration', this._deleteOAuthApp.bind(this));

    // GET /api/v1/oauth-apps/:tenantId
    this._router.get('/:tenantId', this._listOAuthApps.bind(this));
  }

  private async _registerOAuthApp(req: Request, res: Response): Promise<void> {
    // Implementation...
  }

  // ... (other methods)

  get router(): Router {
    return this._router;
  }
}
```

### Phase 3: Refactor OAuthProxy

#### 3.1 Update `gateway/src/auth/oauth-proxy.ts`

**Changes:**
- Remove `_oauthConfigs` Map
- Use `OAuthConfigManager` instead
- Update `_performRefresh()` to fetch config dynamically

**Impact:** ⚠️ Breaking changes to initialization, but backward compatible via migration helper

**Files Modified:** 1

**Estimated Effort:** 4 hours

**Code Changes:**

```typescript
export class OAuthProxy {
  private readonly _vault: VaultClient;
  private readonly _scheduler: RefreshScheduler;
  private readonly _mcpClient: AxiosInstance;
  private readonly _configManager: OAuthConfigManager;  // NEW: Replace _oauthConfigs

  constructor(
    vault: VaultClient,
    mcpBaseUrl: string,
    configManager: OAuthConfigManager  // NEW: Inject config manager
  ) {
    this._vault = vault;
    this._configManager = configManager;

    // ... rest of initialization ...
  }

  /**
   * @deprecated Use OAuthConfigManager.registerOAuthApp() instead
   */
  registerOAuthConfig(integration: string, config: OAuthClientConfig): void {
    logger.warn('registerOAuthConfig is deprecated. Use OAuthConfigManager.registerOAuthApp()');
    // Migration helper: convert to TenantOAuthApp and store in Vault
    // (implementation omitted for brevity)
  }

  /**
   * Perform OAuth token refresh with provider (UPDATED)
   */
  private async _performRefresh(
    integration: string,
    refreshToken: string,
    tenantId: string  // NEW: Add tenantId parameter
  ): Promise<OAuthTokenResponse> {
    // NEW: Fetch config dynamically from OAuthConfigManager
    const { app } = await this._configManager.getOAuthApp(tenantId, integration);

    try {
      const basicAuth = Buffer.from(
        `${app.clientId}:${app.clientSecret}`
      ).toString('base64');

      const response = await axios.post(
        app.tokenEndpoint,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('OAuth token refresh failed', {
        integration,
        tenantId,
        status: error.response?.status,
        error: error.message
      });

      throw new TokenRefreshError(
        `OAuth refresh failed: ${error.message}`,
        integration,
        tenantId,
        error.response?.status !== 400,
        error
      );
    }
  }

  // ... rest of methods updated to use _configManager ...
}
```

### Phase 4: Generalize Scripts

#### 4.1 Create `vault/scripts/init-oauth.sh` (NEW FILE)

**Purpose:** Generic OAuth initialization script for any integration

**Impact:** ✅ New file, `init-notion-oauth.sh` kept for backward compat

**Files Created:** 1

**Estimated Effort:** 4 hours

**Code:**

```bash
#!/bin/bash

################################################################################
# Generic OAuth Vault Initialization Script
################################################################################

set -euo pipefail

# Parse arguments
INTEGRATION="${1:-}"
TENANT_ID="${2:-test-tenant-001}"

if [ -z "$INTEGRATION" ]; then
  echo "Usage: $0 <integration> [tenant-id]"
  echo "Example: $0 notion alice"
  echo "Example: $0 github bob"
  exit 1
fi

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VAULT_DIR="$(dirname "$SCRIPT_DIR")"
POLICY_FILE="${VAULT_DIR}/policies/oauth-policy.hcl"
POLICY_NAME="oauth-apps"

# Vault paths
KV_MOUNT="secret"
TRANSIT_MOUNT="transit"

# ... (rest of implementation, genericized) ...
```

#### 4.2 Create `gateway/config/oauth-apps.example.json` (NEW FILE)

**Purpose:** Example multi-tenant OAuth config file

**Impact:** ✅ New file, documentation

**Files Created:** 1

**Estimated Effort:** 2 hours

**Code:** (See architecture doc for full schema)

### Phase 5: Testing & Documentation

#### 5.1 Create Test Suite

**Files to Create:**
- `gateway/tests/auth/oauth-config-manager.test.ts`
- `gateway/tests/api/oauth-apps-controller.test.ts`
- `gateway/tests/integration/multi-tenant-oauth.integration.test.ts`

**Estimated Effort:** 12 hours

#### 5.2 Update Documentation

**Files to Update:**
- `docs/OAUTH_IMPLEMENTATION_SUMMARY.md`
- `docs/USING_CONNECTORS_PLATFORM.md`

**Files to Create:**
- `docs/MULTI_TENANT_OAUTH_GUIDE.md` (user guide)
- `docs/OAUTH_API_REFERENCE.md` (API docs)

**Estimated Effort:** 8 hours

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goals:**
- Add OAuth app storage to Vault
- Create OAuthConfigManager
- Update types and policies
- **No breaking changes**

**Tasks:**
1. ✅ Update `types.ts` (2h)
2. ✅ Extend `VaultClient` (4h)
3. ✅ Create `OAuthConfigManager` (6h)
4. ✅ Update `oauth-errors.ts` (1h)
5. ✅ Update `oauth-policy.hcl` (1h)
6. ✅ Write unit tests (6h)

**Total:** 20 hours (1 week)

**Deliverables:**
- OAuth app storage functional
- Config file support working
- All tests passing

### Phase 2: API Layer (Week 2)

**Goals:**
- REST API for OAuth app management
- API authentication
- Integration tests

**Tasks:**
1. ✅ Create `OAuthAppsController` (8h)
2. ✅ Add API routes to gateway (2h)
3. ✅ Implement authentication middleware (4h)
4. ✅ Write integration tests (6h)
5. ✅ API documentation (4h)

**Total:** 24 hours (1 week)

**Deliverables:**
- Functional REST API
- API tests passing
- Documentation complete

### Phase 3: Refactor OAuthProxy (Week 3)

**Goals:**
- Remove hardcoded configs
- Use OAuthConfigManager
- Maintain backward compatibility

**Tasks:**
1. ✅ Update `OAuthProxy` to use `OAuthConfigManager` (4h)
2. ✅ Add migration helper for deprecated methods (2h)
3. ✅ Update initialization code (2h)
4. ✅ Update existing tests (4h)
5. ✅ End-to-end testing (4h)

**Total:** 16 hours (0.5 week)

**Deliverables:**
- OAuthProxy refactored
- All tests passing
- No regressions

### Phase 4: Generalize Scripts & Cleanup (Week 3-4)

**Goals:**
- Generic init script
- Multi-tenant config examples
- Deprecate Notion-specific code

**Tasks:**
1. ✅ Create `init-oauth.sh` (4h)
2. ✅ Create `oauth-apps.example.json` (2h)
3. ✅ Update Notion integration to use new flow (4h)
4. ✅ Deprecation warnings (2h)
5. ✅ Documentation updates (8h)

**Total:** 20 hours (0.5 week)

**Deliverables:**
- Generic scripts working
- Notion migration complete
- Documentation updated

### Phase 5: Testing & Production Rollout (Week 4)

**Goals:**
- Comprehensive testing
- Staging deployment
- Production rollout

**Tasks:**
1. ✅ End-to-end testing (8h)
2. ✅ Performance testing (4h)
3. ✅ Security audit (4h)
4. ✅ Staging deployment (4h)
5. ✅ Production rollout (4h)

**Total:** 24 hours (1 week)

**Deliverables:**
- Production-ready system
- All tests passing
- Monitoring in place

**TOTAL PROJECT:** ~104 hours (~3 weeks)

---

## Testing Strategy

### Unit Tests

**Coverage Target:** 85%+

**Test Files:**
- `vault-client.test.ts` (OAuth app methods)
- `oauth-config-manager.test.ts` (full coverage)
- `oauth-apps-controller.test.ts` (all endpoints)
- `oauth-proxy.test.ts` (updated for new flow)

**Key Scenarios:**
- ✅ Store/retrieve OAuth app credentials
- ✅ Encrypt/decrypt client secrets
- ✅ Config file loading
- ✅ Cache functionality
- ✅ Error handling
- ✅ Validation

### Integration Tests

**Test Files:**
- `multi-tenant-oauth.integration.test.ts`
- `oauth-flow.integration.test.ts` (updated)

**Key Scenarios:**
- ✅ Complete OAuth flow (multiple tenants)
- ✅ Token refresh with dynamic config
- ✅ API registration → OAuth flow → token usage
- ✅ Config file → OAuth flow → token usage
- ✅ Vault failover to config file
- ✅ Multi-integration support

### End-to-End Tests

**Scenarios:**
- ✅ Alice registers Notion OAuth app via API
- ✅ Alice completes OAuth flow
- ✅ Alice uses Notion integration
- ✅ Bob registers GitHub OAuth app via config file
- ✅ Bob completes OAuth flow
- ✅ Both tenants' tokens auto-refresh

### Performance Tests

**Metrics:**
- OAuth app lookup latency: <50ms
- Config cache hit rate: >90%
- API endpoint response time: <200ms
- Vault operations: <100ms

---

## Rollback Plan

### Rollback Triggers

- Tests fail after Phase 3
- Production errors >5% after deployment
- Performance degradation >20%
- Security vulnerability discovered

### Rollback Procedures

**Phase 1 Rollback:**
- ✅ No rollback needed (additive only)

**Phase 2 Rollback:**
- Disable API endpoints
- Remove routes from gateway
- ✅ No data loss

**Phase 3 Rollback:**
1. Revert `OAuthProxy` changes
2. Use old `registerOAuthConfig()` method
3. Load configs at startup (backward compat mode)

**Phase 4 Rollback:**
- Use old `init-notion-oauth.sh`
- Keep Notion-specific config file
- Disable generic scripts

**Data Rollback:**
- All OAuth app data in Vault (versioned)
- Can restore previous versions via Vault
- No data loss

---

## Migration Checklist

### Pre-Migration

- [ ] Review and approve architecture
- [ ] Review and approve refactoring plan
- [ ] Set up development environment
- [ ] Create feature branch
- [ ] Backup Vault data

### Phase 1

- [ ] Add new types
- [ ] Extend VaultClient
- [ ] Create OAuthConfigManager
- [ ] Update policies
- [ ] Write unit tests
- [ ] Code review
- [ ] Merge to main

### Phase 2

- [ ] Create API controller
- [ ] Add API routes
- [ ] Implement auth middleware
- [ ] Write integration tests
- [ ] API documentation
- [ ] Code review
- [ ] Merge to main

### Phase 3

- [ ] Refactor OAuthProxy
- [ ] Add migration helper
- [ ] Update tests
- [ ] End-to-end testing
- [ ] Code review
- [ ] Merge to main

### Phase 4

- [ ] Create generic scripts
- [ ] Create example configs
- [ ] Update Notion integration
- [ ] Update documentation
- [ ] Code review
- [ ] Merge to main

### Phase 5

- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Deploy to staging
- [ ] Smoke testing
- [ ] Deploy to production
- [ ] Monitor metrics

### Post-Migration

- [ ] Verify all tenants working
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Deprecate old methods
- [ ] Update README
- [ ] Close tickets

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking changes to existing Notion integration | Low | High | Maintain backward compat, thorough testing |
| Vault unavailability during migration | Low | High | Config file fallback, staged rollout |
| Performance degradation | Medium | Medium | Caching, performance testing |
| Security vulnerabilities | Low | High | Security audit, encrypted storage |
| Config file secrets leaked | Medium | High | Documentation, .gitignore, warnings |
| API authentication bypass | Low | High | Auth middleware, rate limiting |

---

## Success Criteria

### Functional Requirements

✅ **Multi-tenant support:**
- Multiple tenants can register OAuth apps
- Per-tenant isolation enforced
- No cross-tenant data leakage

✅ **API and config file support:**
- Both approaches work equally well
- Seamless fallback between sources
- Config file works for local dev

✅ **Backward compatibility:**
- Existing Notion integration still works
- No data migration required for existing users
- Deprecation warnings for old methods

### Non-Functional Requirements

✅ **Performance:**
- OAuth app lookup <50ms
- API response time <200ms
- Token refresh <500ms

✅ **Security:**
- All secrets encrypted in Vault
- Per-tenant encryption keys
- Audit logging enabled
- API authentication enforced

✅ **Reliability:**
- 99.9% uptime
- Graceful fallback on Vault failure
- Automatic retry on transient errors

✅ **Maintainability:**
- Code coverage >85%
- Documentation complete
- No code duplication
- Clear error messages

---

## Conclusion

This refactoring plan provides a comprehensive roadmap for transforming the Notion-specific OAuth implementation into a unified multi-tenant architecture. The phased approach ensures:

1. **Zero Downtime:** All changes are backward compatible until Phase 3
2. **Low Risk:** Each phase is independently testable and deployable
3. **High Quality:** Comprehensive testing at every level
4. **Future-Proof:** Scalable to hundreds of integrations and tenants

**Estimated Timeline:** 3-4 weeks
**Estimated Effort:** 104 hours
**Team Size:** 2-3 developers

**Next Steps:**
1. Get stakeholder approval
2. Create GitHub issues for each phase
3. Set up CI/CD pipeline
4. Begin Phase 1 implementation
