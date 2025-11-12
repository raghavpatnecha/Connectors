# Tenant OAuth Management API

## Overview

This document describes the REST API endpoints for managing multi-tenant OAuth integrations in the Connectors Platform. These endpoints allow you to dynamically add tenants, initiate OAuth flows, store credentials, and manage integrations without restarting the gateway.

**Base URL:** `http://localhost:3000` (development)

**Authentication:** See [Authentication](#authentication) section

---

## Table of Contents

- [Authentication](#authentication)
- [OAuth Flow Endpoints](#oauth-flow-endpoints)
  - [Initiate OAuth Authorization](#post-oauthauthorizeintegration)
  - [OAuth Callback Handler](#get-oauthcallbackintegration)
- [Credential Management](#credential-management)
  - [Store Credentials](#post-tenantstenantidintegrationintegrationcredentials)
  - [Get Credentials Status](#get-tenantstenantidintegrationintegration)
  - [Revoke Credentials](#delete-tenantstenantidintegrationintegrationcredentials)
  - [Refresh Credentials](#post-tenantstenantidintegrationintegrationrefresh)
- [Tenant Management](#tenant-management)
  - [List Tenant Integrations](#get-tenantstenantidintegrations)
  - [Get Tenant Status](#get-tenantstenantidstatus)
  - [Create Tenant](#post-tenants)
  - [Delete Tenant](#delete-tenantstenantid)
- [Admin Endpoints](#admin-endpoints)
  - [List All Tenants](#get-admintenants)
  - [System Health Check](#get-adminhealthtenants)
- [Error Responses](#error-responses)
- [Examples](#examples)

---

## Authentication

**Current State (Development):**
No authentication required for `localhost`. All endpoints are open.

**Production Recommendations:**

### Option 1: API Keys

```bash
curl -H "X-API-Key: your-api-key" \
  http://localhost:3000/tenants/tenant-123/integrations
```

### Option 2: JWT Bearer Token

```bash
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:3000/tenants/tenant-123/integrations
```

### Option 3: OAuth 2.0 Client Credentials

```bash
# Get access token
curl -X POST http://localhost:3000/oauth/token \
  -u "client_id:client_secret" \
  -d "grant_type=client_credentials"

# Use token
curl -H "Authorization: Bearer {access_token}" \
  http://localhost:3000/tenants/tenant-123/integrations
```

**Tenant Isolation:**

The `tenantId` should be extracted from the authenticated session/token, not from the request body:

```typescript
// Middleware example
function extractTenantId(req: Request) {
  // From JWT
  const token = jwt.verify(req.headers.authorization, SECRET);
  return token.tenantId;

  // From API key lookup
  const apiKey = req.headers['x-api-key'];
  return await lookupTenantFromApiKey(apiKey);

  // From session
  return req.session.tenantId;
}
```

---

## OAuth Flow Endpoints

### POST /oauth/authorize/:integration

Initiates OAuth authorization flow for a tenant and integration.

**Parameters:**
- `integration` (path) - Integration name (notion, github, slack, etc.)

**Query Parameters:**
- `tenant_id` (string, required) - Tenant identifier
- `redirect_uri` (string, optional) - Custom redirect URI after OAuth completion
- `scopes` (string, optional) - Comma-separated OAuth scopes (if applicable)

**Request Example:**

```bash
curl -X POST "http://localhost:3000/oauth/authorize/notion?tenant_id=tenant-123&redirect_uri=https://myapp.com/oauth-success"
```

**Response:** `200 OK`

```json
{
  "authorizationUrl": "https://api.notion.com/v1/oauth/authorize?client_id=abc123&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth%2Fcallback%2Fnotion&response_type=code&state=csrf_token_xyz",
  "state": "csrf_token_xyz",
  "integration": "notion",
  "tenantId": "tenant-123",
  "expiresAt": "2025-11-12T10:35:00Z"
}
```

**Usage:**

```javascript
// 1. Client initiates OAuth
const { data } = await axios.post('/oauth/authorize/notion', null, {
  params: { tenant_id: 'tenant-123' }
});

// 2. Redirect user to authorization URL
window.location.href = data.authorizationUrl;

// 3. User grants permissions on Notion
// 4. Notion redirects to callback endpoint
// 5. Gateway handles callback and stores credentials
```

**Errors:**

| Code | Message | Description |
|------|---------|-------------|
| 400 | Missing tenant_id | tenant_id query parameter required |
| 404 | Integration not found | Integration not registered in gateway |
| 500 | OAuth config missing | OAuth client ID/secret not configured |

---

### GET /oauth/callback/:integration

OAuth provider redirects here after user authorization.

**Parameters:**
- `integration` (path) - Integration name

**Query Parameters:**
- `code` (string, required) - Authorization code from provider
- `state` (string, required) - CSRF token for validation
- `error` (string, optional) - Error code if authorization failed
- `error_description` (string, optional) - Human-readable error description

**Successful Callback:**

```
GET /oauth/callback/notion?code=abc123def456&state=csrf_token_xyz
```

**Response:** `302 Redirect`

Redirects to success page with tenant integration status.

**Process:**
1. Validate CSRF state token
2. Exchange authorization code for access token
3. Create tenant encryption key if needed
4. Encrypt and store credentials in Vault
5. Schedule automatic token refresh (if applicable)
6. Redirect to success page or custom redirect_uri

**Error Callback:**

```
GET /oauth/callback/notion?error=access_denied&error_description=User+cancelled+authorization&state=csrf_token_xyz
```

**Response:** `302 Redirect`

Redirects to error page with error details.

**Implementation Note:**

This endpoint is handled automatically by the gateway. You typically don't call it directly - the OAuth provider redirects the user's browser to it.

---

## Credential Management

### POST /tenants/:tenantId/integrations/:integration/credentials

Manually store OAuth credentials for a tenant integration. Useful for:
- Service account credentials
- Pre-authenticated tokens
- Migrating existing credentials
- Testing

**Parameters:**
- `tenantId` (path, required) - Tenant identifier
- `integration` (path, required) - Integration name (notion, github, etc.)

**Request Body:**

```json
{
  "accessToken": "secret_abc123...",
  "refreshToken": "refresh_xyz789...",
  "expiresIn": 3600,
  "tokenType": "bearer",
  "scopes": ["read:pages", "write:pages"]
}
```

**Fields:**
- `accessToken` (string, required) - OAuth access token
- `refreshToken` (string, optional) - OAuth refresh token (if provided by integration)
- `expiresIn` (number, optional) - Token lifetime in seconds (0 or null for non-expiring tokens)
- `tokenType` (string, optional, default: "bearer") - Token type
- `scopes` (array<string>, optional) - Granted OAuth scopes

**Request Example:**

```bash
curl -X POST http://localhost:3000/tenants/tenant-123/integrations/notion/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "secret_abc123...",
    "tokenType": "bearer",
    "expiresIn": 0
  }'
```

**Response:** `201 Created`

```json
{
  "success": true,
  "tenantId": "tenant-123",
  "integration": "notion",
  "stored": {
    "encryptedAt": "2025-11-12T10:30:00Z",
    "encryptionKey": "transit/keys/tenant-123",
    "vaultPath": "secret/data/tenant-123/notion",
    "expiresAt": null,
    "autoRefresh": false
  }
}
```

**Errors:**

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid request | Missing required fields or invalid format |
| 404 | Integration not found | Integration not registered |
| 500 | Vault error | Failed to store credentials in Vault |

---

### GET /tenants/:tenantId/integrations/:integration

Get credential status for a tenant integration (not the actual tokens).

**Parameters:**
- `tenantId` (path, required) - Tenant identifier
- `integration` (path, required) - Integration name

**Request Example:**

```bash
curl http://localhost:3000/tenants/tenant-123/integrations/notion
```

**Response:** `200 OK`

```json
{
  "tenantId": "tenant-123",
  "integration": "notion",
  "hasCredentials": true,
  "status": {
    "tokenType": "bearer",
    "expiresAt": null,
    "scopes": [],
    "createdAt": "2025-11-12T10:30:00Z",
    "updatedAt": "2025-11-12T10:30:00Z",
    "refreshCount": 0,
    "lastRefresh": null,
    "nextRefresh": null,
    "autoRefresh": false
  },
  "metadata": {
    "botId": "bot-123",
    "workspaceId": "ws-456",
    "workspaceName": "Acme Workspace"
  }
}
```

**Response (No Credentials):** `200 OK`

```json
{
  "tenantId": "tenant-123",
  "integration": "notion",
  "hasCredentials": false
}
```

**Errors:**

| Code | Message | Description |
|------|---------|-------------|
| 404 | Tenant not found | Tenant has no integrations |
| 404 | Integration not found | Integration not registered |

---

### DELETE /tenants/:tenantId/integrations/:integration/credentials

Revoke and delete OAuth credentials for a tenant integration.

**Parameters:**
- `tenantId` (path, required) - Tenant identifier
- `integration` (path, required) - Integration name

**Request Example:**

```bash
curl -X DELETE http://localhost:3000/tenants/tenant-123/integrations/notion/credentials
```

**Response:** `200 OK`

```json
{
  "success": true,
  "tenantId": "tenant-123",
  "integration": "notion",
  "revoked": {
    "vaultPath": "secret/data/tenant-123/notion",
    "revokedAt": "2025-11-12T11:00:00Z",
    "refreshCancelled": true
  }
}
```

**Process:**
1. Cancel scheduled token refresh (if any)
2. Delete credentials from Vault
3. Clear any cached tokens
4. Optionally revoke token with OAuth provider

**Errors:**

| Code | Message | Description |
|------|---------|-------------|
| 404 | Credentials not found | No credentials exist for this integration |
| 500 | Vault error | Failed to delete from Vault |

---

### POST /tenants/:tenantId/integrations/:integration/refresh

Manually trigger OAuth token refresh.

**Parameters:**
- `tenantId` (path, required) - Tenant identifier
- `integration` (path, required) - Integration name

**Request Example:**

```bash
curl -X POST http://localhost:3000/tenants/tenant-123/integrations/github/refresh
```

**Response:** `200 OK`

```json
{
  "success": true,
  "tenantId": "tenant-123",
  "integration": "github",
  "refreshed": {
    "refreshedAt": "2025-11-12T11:05:00Z",
    "expiresAt": "2025-11-12T12:05:00Z",
    "nextRefresh": "2025-11-12T12:00:00Z"
  }
}
```

**Errors:**

| Code | Message | Description |
|------|---------|-------------|
| 400 | Refresh not supported | Integration doesn't support token refresh (e.g., Notion) |
| 400 | No refresh token | Refresh token not available |
| 401 | Refresh failed | OAuth provider rejected refresh request |
| 404 | Credentials not found | No credentials exist |

**Note:** Notion tokens don't expire, so refresh is not applicable.

---

## Tenant Management

### GET /tenants/:tenantId/integrations

List all integrations for a tenant, including credential status.

**Parameters:**
- `tenantId` (path, required) - Tenant identifier

**Query Parameters:**
- `status` (string, optional) - Filter by status: `active`, `expired`, `all` (default: `all`)

**Request Example:**

```bash
curl http://localhost:3000/tenants/tenant-123/integrations?status=active
```

**Response:** `200 OK`

```json
{
  "tenantId": "tenant-123",
  "integrations": [
    {
      "name": "notion",
      "category": "productivity",
      "hasCredentials": true,
      "status": "active",
      "createdAt": "2025-11-12T10:30:00Z",
      "expiresAt": null,
      "metadata": {
        "botId": "bot-123",
        "workspaceId": "ws-456"
      }
    },
    {
      "name": "github",
      "category": "code",
      "hasCredentials": true,
      "status": "active",
      "createdAt": "2025-11-12T09:15:00Z",
      "expiresAt": "2025-11-12T12:15:00Z",
      "nextRefresh": "2025-11-12T12:10:00Z"
    },
    {
      "name": "slack",
      "category": "communication",
      "hasCredentials": false,
      "status": "not_configured"
    }
  ],
  "summary": {
    "total": 3,
    "active": 2,
    "notConfigured": 1,
    "expired": 0
  }
}
```

**Errors:**

| Code | Message | Description |
|------|---------|-------------|
| 404 | Tenant not found | Tenant doesn't exist |

---

### GET /tenants/:tenantId/status

Get comprehensive status for a tenant including integrations, usage, and health.

**Parameters:**
- `tenantId` (path, required) - Tenant identifier

**Request Example:**

```bash
curl http://localhost:3000/tenants/tenant-123/status
```

**Response:** `200 OK`

```json
{
  "tenantId": "tenant-123",
  "status": "active",
  "integrations": {
    "total": 3,
    "active": 2,
    "healthy": 2,
    "unhealthy": 0
  },
  "vault": {
    "encryptionKey": "transit/keys/tenant-123",
    "keyVersion": 1,
    "credentialsStored": 2
  },
  "usage": {
    "apiCalls": 1547,
    "lastActivity": "2025-11-12T11:00:00Z",
    "quotaUsed": "15.47%",
    "quotaLimit": 10000
  },
  "health": {
    "overall": "healthy",
    "checks": {
      "vault": "healthy",
      "credentials": "healthy",
      "integrations": "healthy"
    }
  }
}
```

**Errors:**

| Code | Message | Description |
|------|---------|-------------|
| 404 | Tenant not found | Tenant doesn't exist |

---

### POST /tenants

Create a new tenant with optional initial integrations.

**Request Body:**

```json
{
  "tenantId": "tenant-new",
  "name": "New Tenant Inc.",
  "metadata": {
    "organization": "New Tenant Inc.",
    "plan": "enterprise",
    "region": "us-west-2"
  },
  "integrations": [
    {
      "name": "notion",
      "autoInitiate": true
    }
  ]
}
```

**Fields:**
- `tenantId` (string, required) - Unique tenant identifier
- `name` (string, optional) - Display name for tenant
- `metadata` (object, optional) - Custom metadata
- `integrations` (array, optional) - Initial integrations to configure

**Request Example:**

```bash
curl -X POST http://localhost:3000/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant-new",
    "name": "New Tenant Inc.",
    "integrations": [{"name": "notion"}]
  }'
```

**Response:** `201 Created`

```json
{
  "success": true,
  "tenant": {
    "tenantId": "tenant-new",
    "name": "New Tenant Inc.",
    "createdAt": "2025-11-12T11:10:00Z",
    "vault": {
      "encryptionKey": "transit/keys/tenant-new",
      "keyCreated": true
    },
    "integrations": {
      "configured": 0,
      "available": 3
    }
  },
  "nextSteps": [
    "Initiate OAuth flow: POST /oauth/authorize/notion?tenant_id=tenant-new",
    "Or store credentials: POST /tenants/tenant-new/integrations/notion/credentials"
  ]
}
```

**Errors:**

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid tenant ID | Tenant ID format invalid |
| 409 | Tenant already exists | Tenant with this ID already exists |
| 500 | Vault error | Failed to create encryption key |

---

### DELETE /tenants/:tenantId

Delete a tenant and all associated credentials.

**Parameters:**
- `tenantId` (path, required) - Tenant identifier

**Query Parameters:**
- `confirm` (boolean, required) - Must be `true` to confirm deletion

**Request Example:**

```bash
curl -X DELETE "http://localhost:3000/tenants/tenant-123?confirm=true"
```

**Response:** `200 OK`

```json
{
  "success": true,
  "tenantId": "tenant-123",
  "deleted": {
    "credentials": 2,
    "integrations": ["notion", "github"],
    "vaultPath": "secret/data/tenant-123/",
    "encryptionKey": "transit/keys/tenant-123",
    "deletedAt": "2025-11-12T11:15:00Z"
  }
}
```

**Process:**
1. Cancel all scheduled token refreshes
2. Delete all credentials from Vault
3. Delete encryption key
4. Clear all cached data

**Errors:**

| Code | Message | Description |
|------|---------|-------------|
| 400 | Confirmation required | Must include confirm=true |
| 404 | Tenant not found | Tenant doesn't exist |
| 500 | Vault error | Failed to delete from Vault |

**Warning:** This action is irreversible. All OAuth credentials will be lost.

---

## Admin Endpoints

### GET /admin/tenants

List all tenants in the system (admin only).

**Query Parameters:**
- `limit` (number, optional, default: 50) - Results per page
- `offset` (number, optional, default: 0) - Pagination offset
- `status` (string, optional) - Filter by status: `active`, `inactive`, `all`

**Request Example:**

```bash
curl http://localhost:3000/admin/tenants?limit=10&offset=0
```

**Response:** `200 OK`

```json
{
  "tenants": [
    {
      "tenantId": "tenant-001",
      "name": "Acme Corporation",
      "status": "active",
      "integrations": 2,
      "createdAt": "2025-11-01T10:00:00Z",
      "lastActivity": "2025-11-12T11:00:00Z"
    },
    {
      "tenantId": "tenant-002",
      "name": "Beta Industries",
      "status": "active",
      "integrations": 1,
      "createdAt": "2025-11-05T14:30:00Z",
      "lastActivity": "2025-11-12T10:45:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### GET /admin/health/tenants

System-wide health check for all tenant integrations.

**Request Example:**

```bash
curl http://localhost:3000/admin/health/tenants
```

**Response:** `200 OK`

```json
{
  "overall": "healthy",
  "timestamp": "2025-11-12T11:20:00Z",
  "summary": {
    "totalTenants": 25,
    "totalIntegrations": 57,
    "healthy": 55,
    "unhealthy": 2
  },
  "vault": {
    "status": "healthy",
    "latency": 12
  },
  "integrations": {
    "notion": {
      "tenants": 18,
      "healthy": 18,
      "unhealthy": 0
    },
    "github": {
      "tenants": 20,
      "healthy": 18,
      "unhealthy": 2
    },
    "slack": {
      "tenants": 19,
      "healthy": 19,
      "unhealthy": 0
    }
  },
  "issues": [
    {
      "tenantId": "tenant-007",
      "integration": "github",
      "issue": "Token expired and refresh failed",
      "since": "2025-11-12T10:00:00Z"
    },
    {
      "tenantId": "tenant-015",
      "integration": "github",
      "issue": "Rate limit exceeded",
      "since": "2025-11-12T11:10:00Z"
    }
  ]
}
```

**Response (Unhealthy):** `503 Service Unavailable`

Same format as above but with `overall: "unhealthy"` and more issues listed.

---

## Error Responses

All endpoints return errors in consistent format:

```json
{
  "error": {
    "code": "CREDENTIAL_NOT_FOUND",
    "message": "OAuth credentials not found for tenant-123/notion",
    "details": {
      "tenantId": "tenant-123",
      "integration": "notion",
      "vaultPath": "secret/data/tenant-123/notion"
    },
    "timestamp": "2025-11-12T11:25:00Z",
    "requestId": "req-abc-123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Missing required fields or invalid format |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `TENANT_NOT_FOUND` | 404 | Tenant doesn't exist |
| `INTEGRATION_NOT_FOUND` | 404 | Integration not registered |
| `CREDENTIAL_NOT_FOUND` | 404 | No credentials for integration |
| `TENANT_ALREADY_EXISTS` | 409 | Tenant ID already in use |
| `VAULT_ERROR` | 500 | Vault operation failed |
| `OAUTH_ERROR` | 500 | OAuth provider error |
| `TOKEN_REFRESH_FAILED` | 500 | Failed to refresh token |
| `SERVICE_UNAVAILABLE` | 503 | System temporarily unavailable |

---

## Examples

### Complete OAuth Flow (Notion)

**Step 1: Initiate OAuth**

```bash
curl -X POST "http://localhost:3000/oauth/authorize/notion?tenant_id=tenant-123"
```

Response:
```json
{
  "authorizationUrl": "https://api.notion.com/v1/oauth/authorize?client_id=...&state=xyz",
  "state": "xyz"
}
```

**Step 2: Redirect User**

```javascript
window.location.href = response.data.authorizationUrl;
```

**Step 3: User Grants Permissions**

User approves in Notion UI, Notion redirects to:
```
GET /oauth/callback/notion?code=abc123&state=xyz
```

**Step 4: Gateway Processes Callback**

Gateway automatically:
- Validates state
- Exchanges code for token
- Stores encrypted credentials
- Redirects to success page

**Step 5: Verify Credentials Stored**

```bash
curl http://localhost:3000/tenants/tenant-123/integrations/notion
```

Response:
```json
{
  "tenantId": "tenant-123",
  "integration": "notion",
  "hasCredentials": true,
  "status": {
    "tokenType": "bearer",
    "expiresAt": null,
    "createdAt": "2025-11-12T11:30:00Z"
  }
}
```

**Step 6: Use Integration**

```bash
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "notion.createPage",
    "integration": "notion",
    "tenantId": "tenant-123",
    "parameters": {
      "parent": {"database_id": "db-id"},
      "properties": {
        "Name": {"title": [{"text": {"content": "Test Page"}}]}
      }
    }
  }'
```

### Manual Credential Storage

```bash
# Store Notion credentials manually
curl -X POST http://localhost:3000/tenants/tenant-123/integrations/notion/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "secret_abc123...",
    "tokenType": "bearer",
    "expiresIn": 0
  }'

# Verify stored
curl http://localhost:3000/tenants/tenant-123/integrations/notion

# Test with API call
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "notion.search",
    "integration": "notion",
    "tenantId": "tenant-123",
    "parameters": {"query": "project"}
  }'
```

### GitHub OAuth with Refresh

```bash
# Initiate OAuth for GitHub
curl -X POST "http://localhost:3000/oauth/authorize/github?tenant_id=tenant-123"

# After OAuth flow completes, check status
curl http://localhost:3000/tenants/tenant-123/integrations/github

# Response shows expiry and next refresh
{
  "hasCredentials": true,
  "status": {
    "expiresAt": "2025-11-12T12:30:00Z",
    "nextRefresh": "2025-11-12T12:25:00Z",
    "autoRefresh": true
  }
}

# Manually trigger refresh if needed
curl -X POST http://localhost:3000/tenants/tenant-123/integrations/github/refresh
```

### Multi-Tenant Management

```bash
# Create new tenant
curl -X POST http://localhost:3000/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "tenant-new",
    "name": "New Company Inc."
  }'

# Add Notion integration
curl -X POST "http://localhost:3000/oauth/authorize/notion?tenant_id=tenant-new"

# Add GitHub integration
curl -X POST "http://localhost:3000/oauth/authorize/github?tenant_id=tenant-new"

# List all integrations for tenant
curl http://localhost:3000/tenants/tenant-new/integrations

# Get tenant status
curl http://localhost:3000/tenants/tenant-new/status

# Revoke specific integration
curl -X DELETE http://localhost:3000/tenants/tenant-new/integrations/github/credentials

# Delete entire tenant
curl -X DELETE "http://localhost:3000/tenants/tenant-new?confirm=true"
```

### Admin Operations

```bash
# List all tenants
curl http://localhost:3000/admin/tenants?limit=50

# System health check
curl http://localhost:3000/admin/health/tenants

# Find tenants with issues
curl http://localhost:3000/admin/tenants?status=unhealthy
```

---

## Rate Limiting

**Per-Tenant Rate Limits:**
- OAuth flow initiation: 10 requests/minute
- Credential operations: 100 requests/minute
- API calls (tool invocation): Per integration rate limit

**Admin Endpoints:**
- List operations: 60 requests/minute
- Health checks: 120 requests/minute

**Rate Limit Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699789200
```

**Rate Limit Exceeded Response:** `429 Too Many Requests`

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded for tenant-123",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2025-11-12T12:00:00Z"
    }
  }
}
```

---

## Webhooks (Future)

**Planned webhook events:**
- `tenant.created` - New tenant created
- `credentials.stored` - Credentials stored for tenant
- `credentials.refreshed` - Token refreshed successfully
- `credentials.expired` - Token expired and refresh failed
- `credentials.revoked` - Credentials deleted
- `tenant.deleted` - Tenant deleted

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ConnectorsTenantClient } from '@connectors/client';

const client = new ConnectorsTenantClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key'
});

// Initiate OAuth
const auth = await client.oauth.authorize('notion', {
  tenantId: 'tenant-123',
  redirectUri: 'https://myapp.com/callback'
});

window.location.href = auth.authorizationUrl;

// List integrations
const integrations = await client.tenants.listIntegrations('tenant-123');

// Store credentials manually
await client.tenants.storeCredentials('tenant-123', 'notion', {
  accessToken: 'secret_...',
  tokenType: 'bearer'
});

// Invoke tool
const result = await client.tools.invoke({
  toolId: 'notion.createPage',
  integration: 'notion',
  tenantId: 'tenant-123',
  parameters: { /* ... */ }
});
```

### Python

```python
from connectors import ConnectorsTenantClient

client = ConnectorsTenantClient(
    base_url='http://localhost:3000',
    api_key='your-api-key'
)

# Initiate OAuth
auth = client.oauth.authorize('notion', tenant_id='tenant-123')
print(f"Redirect user to: {auth['authorizationUrl']}")

# List integrations
integrations = client.tenants.list_integrations('tenant-123')

# Store credentials
client.tenants.store_credentials(
    tenant_id='tenant-123',
    integration='notion',
    access_token='secret_...',
    token_type='bearer'
)

# Invoke tool
result = client.tools.invoke(
    tool_id='notion.createPage',
    integration='notion',
    tenant_id='tenant-123',
    parameters={'parent': {'database_id': 'db-id'}}
)
```

---

## Security Considerations

1. **Never log access tokens or refresh tokens**
2. **Always validate tenantId from authenticated session**
3. **Use HTTPS in production**
4. **Implement rate limiting per tenant**
5. **Enable Vault audit logging**
6. **Rotate encryption keys periodically**
7. **Monitor for credential access patterns**
8. **Implement webhook signature verification**

---

## References

- [Multi-Tenant Setup Guide](MULTI_TENANT_SETUP.md)
- [Migration Guide](MIGRATION_SINGLE_TO_MULTI_TENANT.md)
- [OAuth Implementation](oauth-implementation-guide.md)
- [Vault Integration](vault-integration.md)
