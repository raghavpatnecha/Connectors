# Multi-Tenant OAuth Architecture

**Version:** 1.0.0
**Date:** 2025-11-12
**Status:** Design Specification

---

## Executive Summary

This document defines the unified multi-tenant OAuth architecture for the Connectors Platform. The architecture supports multiple tenants (Alice, Bob, Carol, etc.), where each tenant creates their own OAuth applications for integrations (Notion, GitHub, Slack, etc.) and provides credentials to the platform.

**Key Objectives:**
1. Per-tenant OAuth app isolation
2. Support both API (production) and config file (dev/testing) approaches
3. No code duplication between approaches
4. Backward compatible with existing Notion integration
5. Secure credential storage with HashiCorp Vault

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Model](#data-model)
3. [Storage Architecture](#storage-architecture)
4. [API Design](#api-design)
5. [Config File Schema](#config-file-schema)
6. [Flow Diagrams](#flow-diagrams)
7. [Security Model](#security-model)
8. [Migration Strategy](#migration-strategy)

---

## Architecture Overview

### Current vs. Target Architecture

**Current State:**
- OAuth client configs (clientId, clientSecret) registered programmatically via `OAuthProxy.registerOAuthConfig()`
- User credentials (access_token, refresh_token) stored in Vault at `secret/data/{tenantId}/{integration}`
- Notion-specific initialization scripts
- No mechanism to store OAuth app credentials in Vault

**Target State:**
- OAuth app credentials stored in Vault at `secret/data/oauth-apps/{tenantId}/{integration}`
- Support both API endpoint and config file for registering OAuth apps
- Unified `OAuthConfigManager` to abstract storage mechanism
- Generic initialization scripts for any integration

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Tenant (Alice)                           │
│  - Creates OAuth apps in Notion, GitHub, Slack, etc.           │
│  - Provides credentials via API or config file                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
          ┌───────────────────────────────────────┐
          │    Credential Registration Layer       │
          │  ┌──────────────┐  ┌───────────────┐  │
          │  │  REST API    │  │  Config File  │  │
          │  │  (Prod)      │  │  (Dev/Test)   │  │
          │  └──────┬───────┘  └───────┬───────┘  │
          │         │                  │           │
          │         └──────────┬───────┘           │
          │                    ▼                   │
          │       ┌───────────────────────┐        │
          │       │ OAuthConfigManager   │        │
          │       │ (Unified Interface)  │        │
          │       └───────────┬───────────┘        │
          └───────────────────┼───────────────────┘
                              ▼
          ┌────────────────────────────────────────┐
          │        HashiCorp Vault                  │
          │  ┌──────────────────────────────────┐  │
          │  │  OAuth App Credentials (KV v2)   │  │
          │  │  secret/data/oauth-apps/         │  │
          │  │    {tenantId}/{integration}      │  │
          │  │                                  │  │
          │  │  - clientId                      │  │
          │  │  - clientSecret (encrypted)      │  │
          │  │  - endpoints (auth, token)       │  │
          │  │  - metadata                      │  │
          │  └──────────────────────────────────┘  │
          │                                         │
          │  ┌──────────────────────────────────┐  │
          │  │  User OAuth Tokens (KV v2)       │  │
          │  │  secret/data/{tenantId}/         │  │
          │  │    {integration}                 │  │
          │  │                                  │  │
          │  │  - accessToken (encrypted)       │  │
          │  │  - refreshToken (encrypted)      │  │
          │  │  - expiresAt, scopes             │  │
          │  └──────────────────────────────────┘  │
          │                                         │
          │  ┌──────────────────────────────────┐  │
          │  │  Transit Encryption Engine       │  │
          │  │  - Per-tenant keys               │  │
          │  │  - AES-256-GCM encryption        │  │
          │  └──────────────────────────────────┘  │
          └────────────────────────────────────────┘
                              ▼
          ┌────────────────────────────────────────┐
          │           OAuth Proxy                   │
          │  - Retrieves OAuth app config           │
          │  - Retrieves user tokens                │
          │  - Injects auth headers                 │
          │  - Handles token refresh                │
          └────────────────────────────────────────┘
```

---

## Data Model

### OAuth App Configuration

OAuth app credentials provided by tenants for each integration:

```typescript
interface TenantOAuthApp {
  // Tenant and integration identification
  tenantId: string;
  integration: string;

  // OAuth app credentials (from tenant's OAuth app)
  clientId: string;
  clientSecret: string;  // Encrypted in Vault

  // OAuth endpoints (integration-specific)
  authEndpoint: string;
  tokenEndpoint: string;
  redirectUri: string;

  // Optional configuration
  scopes?: string[];

  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;  // "api" | "config-file" | user ID
    environment: 'production' | 'staging' | 'development';
    description?: string;
  };
}
```

### User OAuth Credentials

User credentials obtained after OAuth flow completion (EXISTING):

```typescript
interface OAuthCredentials {
  // User tokens
  accessToken: string;      // Encrypted in Vault
  refreshToken: string;     // Encrypted in Vault
  expiresAt: Date;
  scopes: string[];
  tokenType: string;

  // Integration identification
  integration: string;
}
```

### Relationship

```
Tenant (Alice)
  │
  ├── OAuth App (Notion)
  │     ├── clientId: "notion-abc123"
  │     ├── clientSecret: "encrypted:vault:v1:..."
  │     └── endpoints: { auth, token }
  │
  ├── OAuth App (GitHub)
  │     ├── clientId: "github-xyz789"
  │     ├── clientSecret: "encrypted:vault:v1:..."
  │     └── endpoints: { auth, token }
  │
  └── User Credentials (per integration)
        ├── Notion
        │     ├── accessToken: "encrypted:vault:v1:..."
        │     └── refreshToken: "encrypted:vault:v1:..."
        │
        └── GitHub
              ├── accessToken: "encrypted:vault:v1:..."
              └── refreshToken: "encrypted:vault:v1:..."
```

---

## Storage Architecture

### Vault Storage Paths

**1. OAuth App Credentials (NEW)**

```
secret/data/oauth-apps/{tenantId}/{integration}
```

**Example:**
```
secret/data/oauth-apps/alice/notion
secret/data/oauth-apps/alice/github
secret/data/oauth-apps/bob/notion
```

**Data Structure:**
```json
{
  "data": {
    "clientId": "notion_abc123xyz",
    "clientSecret": "vault:v1:encrypted_client_secret_here",
    "authEndpoint": "https://api.notion.com/v1/oauth/authorize",
    "tokenEndpoint": "https://api.notion.com/v1/oauth/token",
    "redirectUri": "https://platform.example.com/oauth/callback/alice/notion",
    "scopes": ["read_content", "update_content"]
  },
  "metadata": {
    "createdAt": "2025-11-12T10:00:00Z",
    "updatedAt": "2025-11-12T10:00:00Z",
    "createdBy": "api",
    "environment": "production"
  }
}
```

**2. User OAuth Tokens (EXISTING)**

```
secret/data/{tenantId}/{integration}
```

**Example:**
```
secret/data/alice/notion
secret/data/alice/github
secret/data/bob/notion
```

**Data Structure:**
```json
{
  "data": {
    "accessToken": "vault:v1:encrypted_access_token",
    "refreshToken": "vault:v1:encrypted_refresh_token",
    "expiresAt": "2025-11-12T12:00:00Z",
    "scopes": ["read_content", "update_content"],
    "tokenType": "Bearer"
  },
  "metadata": {
    "createdAt": "2025-11-12T10:30:00Z",
    "updatedAt": "2025-11-12T10:30:00Z",
    "createdBy": "oauth-proxy",
    "integration": "notion",
    "autoRefresh": true,
    "refreshCount": 0
  }
}
```

**3. Transit Encryption Keys (EXISTING)**

```
transit/keys/{tenantId}
```

**Example:**
```
transit/keys/alice
transit/keys/bob
```

### Vault Policy

**Updated OAuth Policy (oauth-apps.hcl):**

```hcl
# OAuth App Credentials - Per-tenant OAuth app registration
# Path: secret/data/oauth-apps/{tenant-id}/{integration}
path "secret/data/oauth-apps/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "secret/metadata/oauth-apps/*" {
  capabilities = ["read", "list", "delete"]
}

# User OAuth Tokens - Per-tenant user credentials
# Path: secret/data/{tenant-id}/{integration}
path "secret/data/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "secret/metadata/*" {
  capabilities = ["read", "list", "delete"]
}

# Transit encryption for all credentials
path "transit/encrypt/*" {
  capabilities = ["update"]
}

path "transit/decrypt/*" {
  capabilities = ["update"]
}

path "transit/keys/*" {
  capabilities = ["create", "read", "update", "list"]
  allowed_parameters = {
    "type" = ["aes256-gcm96"]
    "exportable" = [false]
  }
}

# Token management
path "auth/token/lookup-self" {
  capabilities = ["read"]
}

path "auth/token/renew-self" {
  capabilities = ["update"]
}
```

---

## API Design

### REST API Endpoints

**Base Path:** `/api/v1/oauth-apps`

#### 1. Register OAuth App

**Endpoint:** `POST /api/v1/oauth-apps/{tenantId}/{integration}`

**Description:** Register OAuth app credentials for a tenant and integration

**Request Body:**
```json
{
  "clientId": "notion_abc123xyz",
  "clientSecret": "secret_xyz789abc",
  "authEndpoint": "https://api.notion.com/v1/oauth/authorize",
  "tokenEndpoint": "https://api.notion.com/v1/oauth/token",
  "redirectUri": "https://platform.example.com/oauth/callback/alice/notion",
  "scopes": ["read_content", "update_content"],
  "metadata": {
    "environment": "production",
    "description": "Alice's Notion workspace integration"
  }
}
```

**Response:**
```json
{
  "success": true,
  "tenantId": "alice",
  "integration": "notion",
  "vaultPath": "secret/data/oauth-apps/alice/notion",
  "createdAt": "2025-11-12T10:00:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "InvalidOAuthConfig",
  "message": "Missing required field: clientId",
  "missingFields": ["clientId"]
}
```

#### 2. Get OAuth App Config

**Endpoint:** `GET /api/v1/oauth-apps/{tenantId}/{integration}`

**Description:** Retrieve OAuth app configuration (clientSecret is masked)

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": "alice",
    "integration": "notion",
    "clientId": "notion_abc123xyz",
    "clientSecret": "********",
    "authEndpoint": "https://api.notion.com/v1/oauth/authorize",
    "tokenEndpoint": "https://api.notion.com/v1/oauth/token",
    "redirectUri": "https://platform.example.com/oauth/callback/alice/notion",
    "scopes": ["read_content", "update_content"],
    "metadata": {
      "createdAt": "2025-11-12T10:00:00Z",
      "updatedAt": "2025-11-12T10:00:00Z",
      "environment": "production"
    }
  }
}
```

#### 3. Update OAuth App

**Endpoint:** `PUT /api/v1/oauth-apps/{tenantId}/{integration}`

**Description:** Update OAuth app credentials (e.g., after rotating client secret)

**Request Body:**
```json
{
  "clientSecret": "new_secret_abc123",
  "redirectUri": "https://new-platform.example.com/oauth/callback/alice/notion"
}
```

**Response:**
```json
{
  "success": true,
  "tenantId": "alice",
  "integration": "notion",
  "updatedAt": "2025-11-12T11:00:00Z"
}
```

#### 4. Delete OAuth App

**Endpoint:** `DELETE /api/v1/oauth-apps/{tenantId}/{integration}`

**Description:** Remove OAuth app registration and associated user credentials

**Query Parameters:**
- `deleteUserCredentials` (boolean, default: false) - Also delete user OAuth tokens

**Response:**
```json
{
  "success": true,
  "tenantId": "alice",
  "integration": "notion",
  "deletedAt": "2025-11-12T12:00:00Z",
  "userCredentialsDeleted": false
}
```

#### 5. List OAuth Apps

**Endpoint:** `GET /api/v1/oauth-apps/{tenantId}`

**Description:** List all OAuth apps registered for a tenant

**Response:**
```json
{
  "success": true,
  "tenantId": "alice",
  "integrations": [
    {
      "integration": "notion",
      "clientId": "notion_abc123xyz",
      "hasUserCredentials": true,
      "createdAt": "2025-11-12T10:00:00Z"
    },
    {
      "integration": "github",
      "clientId": "github_xyz789abc",
      "hasUserCredentials": false,
      "createdAt": "2025-11-12T10:30:00Z"
    }
  ]
}
```

### Authentication & Authorization

**API Security:**
- All endpoints require authentication via `X-API-Key` header or JWT bearer token
- Tenants can only access their own OAuth apps (tenant ID derived from auth token)
- Admin users can access all tenants' OAuth apps

**Example Request:**
```bash
curl -X POST https://gateway.example.com/api/v1/oauth-apps/alice/notion \
  -H "X-API-Key: tenant_api_key_alice_xyz123" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "notion_abc123xyz",
    "clientSecret": "secret_xyz789abc",
    "authEndpoint": "https://api.notion.com/v1/oauth/authorize",
    "tokenEndpoint": "https://api.notion.com/v1/oauth/token",
    "redirectUri": "https://platform.example.com/oauth/callback/alice/notion"
  }'
```

---

## Config File Schema

### Purpose

Config file approach is designed for:
- Development and testing
- Quick local setup without API calls
- CI/CD environments
- Single-tenant deployments

### File Location

```
gateway/config/oauth-apps.json
```

Or via environment variable:
```
OAUTH_APPS_CONFIG=/path/to/oauth-apps.json
```

### Schema

**oauth-apps.json:**

```json
{
  "$schema": "https://connectors-platform.example.com/schemas/oauth-apps-config.schema.json",
  "version": "1.0.0",
  "tenants": [
    {
      "tenantId": "alice",
      "displayName": "Alice's Workspace",
      "environment": "development",
      "integrations": [
        {
          "integration": "notion",
          "clientId": "notion_dev_alice_123",
          "clientSecret": "secret_alice_notion_xyz",
          "authEndpoint": "https://api.notion.com/v1/oauth/authorize",
          "tokenEndpoint": "https://api.notion.com/v1/oauth/token",
          "redirectUri": "http://localhost:3000/oauth/callback/alice/notion",
          "scopes": ["read_content", "update_content"]
        },
        {
          "integration": "github",
          "clientId": "github_dev_alice_456",
          "clientSecret": "secret_alice_github_abc",
          "authEndpoint": "https://github.com/login/oauth/authorize",
          "tokenEndpoint": "https://github.com/login/oauth/access_token",
          "redirectUri": "http://localhost:3000/oauth/callback/alice/github",
          "scopes": ["repo", "user"]
        }
      ]
    },
    {
      "tenantId": "bob",
      "displayName": "Bob's Workspace",
      "environment": "development",
      "integrations": [
        {
          "integration": "notion",
          "clientId": "notion_dev_bob_789",
          "clientSecret": "secret_bob_notion_def",
          "authEndpoint": "https://api.notion.com/v1/oauth/authorize",
          "tokenEndpoint": "https://api.notion.com/v1/oauth/token",
          "redirectUri": "http://localhost:3000/oauth/callback/bob/notion",
          "scopes": ["read_content"]
        }
      ]
    }
  ],
  "defaults": {
    "notion": {
      "authEndpoint": "https://api.notion.com/v1/oauth/authorize",
      "tokenEndpoint": "https://api.notion.com/v1/oauth/token",
      "scopes": ["read_content", "update_content", "insert_content"]
    },
    "github": {
      "authEndpoint": "https://github.com/login/oauth/authorize",
      "tokenEndpoint": "https://github.com/login/oauth/access_token",
      "scopes": ["repo", "user", "workflow"]
    },
    "slack": {
      "authEndpoint": "https://slack.com/oauth/v2/authorize",
      "tokenEndpoint": "https://slack.com/api/oauth.v2.access",
      "scopes": ["channels:read", "chat:write", "users:read"]
    }
  }
}
```

### JSON Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "OAuth Apps Configuration",
  "type": "object",
  "required": ["version", "tenants"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "tenants": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/tenant"
      }
    },
    "defaults": {
      "type": "object",
      "additionalProperties": {
        "$ref": "#/definitions/integrationDefaults"
      }
    }
  },
  "definitions": {
    "tenant": {
      "type": "object",
      "required": ["tenantId", "integrations"],
      "properties": {
        "tenantId": {
          "type": "string",
          "pattern": "^[a-z0-9-]+$"
        },
        "displayName": {
          "type": "string"
        },
        "environment": {
          "type": "string",
          "enum": ["production", "staging", "development"]
        },
        "integrations": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/integration"
          }
        }
      }
    },
    "integration": {
      "type": "object",
      "required": ["integration", "clientId", "clientSecret"],
      "properties": {
        "integration": {
          "type": "string",
          "enum": ["notion", "github", "slack", "google", "microsoft"]
        },
        "clientId": {
          "type": "string",
          "minLength": 1
        },
        "clientSecret": {
          "type": "string",
          "minLength": 1
        },
        "authEndpoint": {
          "type": "string",
          "format": "uri"
        },
        "tokenEndpoint": {
          "type": "string",
          "format": "uri"
        },
        "redirectUri": {
          "type": "string",
          "format": "uri"
        },
        "scopes": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    },
    "integrationDefaults": {
      "type": "object",
      "properties": {
        "authEndpoint": {
          "type": "string",
          "format": "uri"
        },
        "tokenEndpoint": {
          "type": "string",
          "format": "uri"
        },
        "scopes": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    }
  }
}
```

### Config File Loading

**Priority:**
1. Environment variable `OAUTH_APPS_CONFIG`
2. `gateway/config/oauth-apps.json`
3. Fallback to API/Vault only

**Security Notes:**
- Config file should NEVER be committed with real secrets
- Use `.env` or environment variables for sensitive values
- In production, prefer API approach over config file

---

## Flow Diagrams

### 1. OAuth App Registration Flow (API Approach)

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│ Tenant  │                 │ Gateway │                 │  Vault  │
│ (Alice) │                 │   API   │                 │         │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │ POST /oauth-apps/alice/   │                           │
     │      notion               │                           │
     ├──────────────────────────>│                           │
     │ {clientId, clientSecret}  │                           │
     │                           │                           │
     │                           │ Validate request          │
     │                           ├─────────┐                 │
     │                           │         │                 │
     │                           │<────────┘                 │
     │                           │                           │
     │                           │ Ensure encryption key     │
     │                           │ (transit/keys/alice)      │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │<──────────────────────────┤
     │                           │ Key exists/created        │
     │                           │                           │
     │                           │ Encrypt clientSecret      │
     │                           │ (transit/encrypt/alice)   │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │<──────────────────────────┤
     │                           │ Encrypted ciphertext      │
     │                           │                           │
     │                           │ Store OAuth app config    │
     │                           │ (secret/oauth-apps/       │
     │                           │  alice/notion)            │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │<──────────────────────────┤
     │                           │ Stored successfully       │
     │                           │                           │
     │<──────────────────────────┤                           │
     │ {success: true}           │                           │
     │                           │                           │
```

### 2. OAuth App Registration Flow (Config File Approach)

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│  Dev    │                 │ Gateway │                 │  Vault  │
│ (Local) │                 │ Startup │                 │         │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │ Create oauth-apps.json    │                           │
     ├─────────┐                 │                           │
     │         │                 │                           │
     │<────────┘                 │                           │
     │                           │                           │
     │ Start gateway             │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │ Load oauth-apps.json      │
     │                           ├─────────┐                 │
     │                           │         │                 │
     │                           │<────────┘                 │
     │                           │                           │
     │                           │ For each tenant/integration
     │                           ├─────────┐                 │
     │                           │         │                 │
     │                           │         │ Ensure encryption key
     │                           │         ├────────────────>│
     │                           │         │                 │
     │                           │         │<────────────────┤
     │                           │         │                 │
     │                           │         │ Encrypt clientSecret
     │                           │         ├────────────────>│
     │                           │         │                 │
     │                           │         │<────────────────┤
     │                           │         │                 │
     │                           │         │ Store in Vault  │
     │                           │         ├────────────────>│
     │                           │         │                 │
     │                           │         │<────────────────┤
     │                           │<────────┘                 │
     │                           │                           │
     │<──────────────────────────┤                           │
     │ Gateway ready             │                           │
     │                           │                           │
```

### 3. End-to-End OAuth Flow (User Authorization)

```
┌─────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│User │  │ Gateway │  │  Vault  │  │  Notion │  │   MCP   │
│Alice│  │ (OAuth) │  │         │  │  OAuth  │  │  Server │
└──┬──┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘
   │          │             │             │             │
   │ Initiate OAuth         │             │             │
   ├─────────>│             │             │             │
   │          │             │             │             │
   │          │ Get OAuth app config      │             │
   │          │ (alice/notion)            │             │
   │          ├────────────>│             │             │
   │          │             │             │             │
   │          │<────────────┤             │             │
   │          │ {clientId, endpoints}     │             │
   │          │             │             │             │
   │          │ Build authorization URL   │             │
   │          ├─────────┐   │             │             │
   │          │         │   │             │             │
   │          │<────────┘   │             │             │
   │          │             │             │             │
   │<─────────┤             │             │             │
   │ Redirect to Notion     │             │             │
   │          │             │             │             │
   ├──────────┼─────────────┼────────────>│             │
   │          │             │             │             │
   │          │             │   User approves           │
   │<─────────┼─────────────┼─────────────┤             │
   │ Redirect to callback   │             │             │
   │ ?code=xyz&state=abc    │             │             │
   │          │             │             │             │
   ├─────────>│             │             │             │
   │          │             │             │             │
   │          │ Validate state             │             │
   │          ├─────────┐   │             │             │
   │          │         │   │             │             │
   │          │<────────┘   │             │             │
   │          │             │             │             │
   │          │ Get OAuth app config      │             │
   │          │ (decrypt clientSecret)    │             │
   │          ├────────────>│             │             │
   │          │             │             │             │
   │          │<────────────┤             │             │
   │          │             │             │             │
   │          │ Exchange code for token   │             │
   │          ├─────────────┼────────────>│             │
   │          │             │             │             │
   │          │<────────────┼─────────────┤             │
   │          │ {access_token, ...}       │             │
   │          │             │             │             │
   │          │ Encrypt & store user tokens
   │          ├────────────>│             │             │
   │          │             │             │             │
   │          │<────────────┤             │             │
   │          │             │             │             │
   │          │ Schedule token refresh    │             │
   │          ├─────────┐   │             │             │
   │          │         │   │             │             │
   │          │<────────┘   │             │             │
   │          │             │             │             │
   │<─────────┤             │             │             │
   │ Success! │             │             │             │
   │          │             │             │             │
   │ Use Notion integration │             │             │
   ├─────────>│             │             │             │
   │          │             │             │             │
   │          │ Get user tokens (decrypt) │             │
   │          ├────────────>│             │             │
   │          │             │             │             │
   │          │<────────────┤             │             │
   │          │             │             │             │
   │          │ Inject auth & forward     │             │
   │          ├─────────────┼─────────────┼────────────>│
   │          │             │             │             │
   │          │<────────────┼─────────────┼─────────────┤
   │          │             │             │             │
   │<─────────┤             │             │             │
   │ Response │             │             │             │
   │          │             │             │             │
```

### 4. Token Refresh Flow

```
┌─────────────┐         ┌─────────┐         ┌─────────┐
│  Refresh    │         │  Vault  │         │  Notion │
│  Scheduler  │         │         │         │  OAuth  │
└──────┬──────┘         └────┬────┘         └────┬────┘
       │                     │                    │
       │ Time to refresh     │                    │
       │ (5 min before expiry)                    │
       ├─────────┐           │                    │
       │         │           │                    │
       │<────────┘           │                    │
       │                     │                    │
       │ Get OAuth app config│                    │
       │ (alice/notion)      │                    │
       ├────────────────────>│                    │
       │                     │                    │
       │<────────────────────┤                    │
       │ {clientId, clientSecret}                 │
       │                     │                    │
       │ Get user refresh token                   │
       ├────────────────────>│                    │
       │                     │                    │
       │<────────────────────┤                    │
       │ {refreshToken}      │                    │
       │                     │                    │
       │ Call token endpoint │                    │
       │ with refresh_token  │                    │
       ├─────────────────────┼───────────────────>│
       │                     │                    │
       │<────────────────────┼────────────────────┤
       │ {access_token, ...} │                    │
       │                     │                    │
       │ Encrypt & store new tokens               │
       ├────────────────────>│                    │
       │                     │                    │
       │<────────────────────┤                    │
       │                     │                    │
       │ Schedule next refresh                    │
       ├─────────┐           │                    │
       │         │           │                    │
       │<────────┘           │                    │
       │                     │                    │
```

---

## Security Model

### Threat Model

**Threats:**
1. Unauthorized access to OAuth app credentials (clientId, clientSecret)
2. Unauthorized access to user OAuth tokens
3. Man-in-the-middle attacks during OAuth flow
4. Credential leakage via logs or error messages
5. Token replay attacks

**Mitigations:**

| Threat | Mitigation |
|--------|-----------|
| Unauthorized access to OAuth apps | Per-tenant Vault policies, API key authentication |
| Unauthorized access to user tokens | Per-tenant encryption with Transit engine |
| MITM attacks | HTTPS everywhere, state parameter validation |
| Credential leakage | Mask secrets in logs/API responses, secure error handling |
| Token replay | Short-lived access tokens, token binding |

### Encryption Strategy

**1. OAuth App Client Secrets**

- **Storage:** Encrypted in Vault using Transit engine
- **Encryption Key:** Per-tenant key (`transit/keys/{tenantId}`)
- **Algorithm:** AES-256-GCM
- **Key Rotation:** Manual (recommended every 90 days)

**2. User OAuth Tokens**

- **Storage:** Encrypted in Vault using Transit engine
- **Encryption Key:** Same per-tenant key (`transit/keys/{tenantId}`)
- **Algorithm:** AES-256-GCM
- **Key Rotation:** Automatic on token refresh

### Access Control

**Vault Policies:**

```hcl
# Tenant-specific policy (applied per tenant)
path "secret/data/oauth-apps/{{identity.entity.metadata.tenant_id}}/*" {
  capabilities = ["read", "list"]
}

path "secret/data/{{identity.entity.metadata.tenant_id}}/*" {
  capabilities = ["read", "list"]
}

path "transit/encrypt/{{identity.entity.metadata.tenant_id}}" {
  capabilities = ["update"]
}

path "transit/decrypt/{{identity.entity.metadata.tenant_id}}" {
  capabilities = ["update"]
}
```

**Admin Policy:**

```hcl
# Full access to all OAuth apps and credentials
path "secret/data/oauth-apps/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "secret/data/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "transit/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
```

### Audit Logging

**All operations logged:**
- OAuth app registration/updates/deletions
- User credential storage/retrieval
- Token encryption/decryption
- Token refresh attempts (success/failure)

**Audit Log Format:**

```json
{
  "time": "2025-11-12T10:00:00Z",
  "type": "response",
  "auth": {
    "token_type": "service",
    "metadata": {
      "tenant_id": "alice"
    }
  },
  "request": {
    "operation": "read",
    "path": "secret/data/oauth-apps/alice/notion"
  },
  "response": {
    "data": {
      "clientId": "notion_abc123xyz"
    }
  }
}
```

---

## Migration Strategy

### Phase 1: Add OAuth App Storage (No Breaking Changes)

**Changes:**
1. Add `OAuthConfigManager` class
2. Add API endpoints for OAuth app management
3. Add config file loader
4. Update VaultClient to support OAuth app paths
5. Update Vault policies

**Backward Compatibility:**
- Existing `OAuthProxy.registerOAuthConfig()` still works
- Existing Notion integration unchanged
- No data migration required

### Phase 2: Refactor OAuthProxy

**Changes:**
1. Update `OAuthProxy` to use `OAuthConfigManager`
2. Remove hardcoded `_oauthConfigs` Map
3. Fetch OAuth app configs from Vault dynamically

**Migration:**
- Convert in-memory configs to Vault storage
- Update initialization code

### Phase 3: Generalize Init Scripts

**Changes:**
1. Create generic `init-oauth.sh` script
2. Support multiple integrations
3. Deprecate `init-notion-oauth.sh`

**Migration:**
- Script accepts `--integration` flag
- Uses same Vault structure

### Phase 4: Update Notion Integration

**Changes:**
1. Remove Notion-specific code paths
2. Use unified OAuth flow
3. Update documentation

**Testing:**
- Verify Notion OAuth flow still works
- Test with multiple tenants
- Test API and config file approaches

### Rollback Plan

**If issues arise:**
1. Phase 1: No rollback needed (additive only)
2. Phase 2: Revert OAuthProxy changes, use old `registerOAuthConfig()`
3. Phase 3: Keep old init script
4. Phase 4: Keep Notion-specific code path as fallback

---

## Appendix

### A. Environment Variables

```bash
# OAuth config source
OAUTH_APPS_CONFIG=/path/to/oauth-apps.json  # Optional, defaults to config/oauth-apps.json

# Vault configuration
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=your-vault-token

# Gateway configuration
GATEWAY_BASE_URL=http://localhost:3000
OAUTH_CALLBACK_BASE_URL=http://localhost:3000/oauth/callback

# Security
API_KEY_ALICE=alice_api_key_xyz123
API_KEY_BOB=bob_api_key_abc456
```

### B. Integration Templates

**Notion:**
```json
{
  "integration": "notion",
  "authEndpoint": "https://api.notion.com/v1/oauth/authorize",
  "tokenEndpoint": "https://api.notion.com/v1/oauth/token",
  "scopes": ["read_content", "update_content", "insert_content"]
}
```

**GitHub:**
```json
{
  "integration": "github",
  "authEndpoint": "https://github.com/login/oauth/authorize",
  "tokenEndpoint": "https://github.com/login/oauth/access_token",
  "scopes": ["repo", "user", "workflow"]
}
```

**Slack:**
```json
{
  "integration": "slack",
  "authEndpoint": "https://slack.com/oauth/v2/authorize",
  "tokenEndpoint": "https://slack.com/api/oauth.v2.access",
  "scopes": ["channels:read", "chat:write", "users:read"]
}
```

### C. Testing Checklist

- [ ] Register OAuth app via API
- [ ] Register OAuth app via config file
- [ ] Complete OAuth flow for user
- [ ] Verify tokens encrypted in Vault
- [ ] Test token refresh
- [ ] Test multi-tenant isolation
- [ ] Test error handling (invalid credentials, expired tokens)
- [ ] Test API authentication
- [ ] Verify audit logs
- [ ] Test backward compatibility with Notion

---

## Conclusion

This multi-tenant OAuth architecture provides:

✅ **Scalability:** Supports unlimited tenants and integrations
✅ **Flexibility:** API and config file approaches
✅ **Security:** Per-tenant encryption, Vault policies, audit logging
✅ **Developer Experience:** Simple config file for local dev
✅ **Production-Ready:** API-based credential management
✅ **Backward Compatible:** Existing Notion integration continues to work

**Next Steps:**
1. Review and approve architecture
2. Implement Phase 1 (OAuth app storage)
3. Create comprehensive tests
4. Update documentation
5. Roll out to production
