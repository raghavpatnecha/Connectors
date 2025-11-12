# Multi-Tenant Setup Guide

## Overview

The Connectors Platform is designed from the ground up to support **multi-tenancy**, allowing you to manage OAuth credentials and integrations for multiple tenants (users, teams, organizations) in a single deployment.

**Key Features:**
- **Per-tenant credential isolation** - Each tenant's OAuth tokens are encrypted with tenant-specific keys
- **Per-tenant integration management** - Enable different integrations for different tenants
- **Secure credential storage** - HashiCorp Vault with Transit encryption engine
- **Automatic token refresh** - Background refresh of OAuth tokens before expiry
- **Audit logging** - Track all credential access and modifications

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   Connectors Gateway                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Integration Registry                        │   │
│  │  - Notion (productivity)                            │   │
│  │  - GitHub (code) [future]                           │   │
│  │  - Slack (communication) [future]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │            OAuth Proxy                               │   │
│  │  - Transparent credential injection                  │   │
│  │  - Auto-refresh before expiry                        │   │
│  └──────────────────────┬──────────────────────────────┘   │
└─────────────────────────┼──────────────────────────────────┘
                          │
         ┌────────────────▼────────────────┐
         │    HashiCorp Vault              │
         │  ┌──────────────────────────┐   │
         │  │  KV v2 (Credentials)     │   │
         │  │  secret/                 │   │
         │  │  ├─ tenant-1/            │   │
         │  │  │  ├─ notion            │   │
         │  │  │  └─ github            │   │
         │  │  ├─ tenant-2/            │   │
         │  │  │  └─ slack             │   │
         │  │  └─ tenant-3/            │   │
         │  │     └─ notion            │   │
         │  └──────────────────────────┘   │
         │                                  │
         │  ┌──────────────────────────┐   │
         │  │  Transit (Encryption)    │   │
         │  │  transit/keys/           │   │
         │  │  ├─ tenant-1             │   │
         │  │  ├─ tenant-2             │   │
         │  │  └─ tenant-3             │   │
         │  └──────────────────────────┘   │
         └──────────────────────────────────┘
```

**Per-Tenant Isolation:**
- Each tenant has a unique encryption key in Vault Transit engine
- Credentials stored at path: `secret/data/{tenantId}/{integration}`
- Tokens encrypted with key: `transit/keys/{tenantId}`
- No cross-tenant access possible

---

## Quick Start

### Prerequisites

1. **Vault running and initialized**
   ```bash
   docker compose up -d vault
   ```

2. **KV v2 and Transit engines enabled**
   ```bash
   # These are initialized automatically by init-vault.sh
   vault secrets enable -path=secret -version=2 kv
   vault secrets enable -path=transit transit
   ```

3. **Gateway configured**
   ```bash
   cd gateway
   cp .env.example .env
   # Edit .env with your settings
   ```

---

## Option A: API Approach (Production)

**Best for:** Dynamic tenant onboarding, SaaS deployments, automated provisioning

### 1. Start OAuth Flow for Tenant

The tenant initiates OAuth authorization for an integration:

**Endpoint:** `GET /oauth/authorize/:integration`

```bash
# Example: Tenant wants to connect Notion
curl "http://localhost:3000/oauth/authorize/notion?tenant_id=tenant-123&redirect_uri=https://myapp.com/callback"
```

**Response:**
```json
{
  "authorizationUrl": "https://api.notion.com/v1/oauth/authorize?client_id=...&state=...",
  "state": "csrf-token-abc123"
}
```

**Flow:**
1. Gateway generates CSRF token and stores in session
2. Returns authorization URL for the integration's OAuth provider
3. Tenant is redirected to provider (e.g., Notion) to grant permissions
4. Provider redirects back to gateway callback

### 2. OAuth Callback Handler

After tenant grants permissions, provider redirects to:

**Endpoint:** `GET /oauth/callback/:integration`

```bash
# Notion redirects here after authorization
# Example: /oauth/callback/notion?code=abc123&state=csrf-token-abc123
```

**Process:**
1. Gateway validates CSRF state token
2. Exchanges authorization code for access token
3. Encrypts tokens with tenant-specific key
4. Stores in Vault at `secret/data/{tenantId}/notion`
5. Schedules automatic token refresh
6. Redirects tenant to success page

### 3. Store Credentials Directly (Alternative)

For manual credential provisioning or service accounts:

**Endpoint:** `POST /tenants/:tenantId/integrations/:integration/credentials`

```bash
curl -X POST http://localhost:3000/tenants/tenant-123/integrations/notion/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "secret_abc123...",
    "tokenType": "bearer",
    "expiresIn": 0,
    "scopes": ["read:pages", "write:pages"]
  }'
```

**Response:**
```json
{
  "success": true,
  "tenantId": "tenant-123",
  "integration": "notion",
  "encryptedAt": "2025-11-12T10:30:00Z",
  "expiresAt": null
}
```

**Note:** Notion tokens don't expire, so `expiresIn: 0` and `expiresAt: null`

### 4. List Tenant Integrations

**Endpoint:** `GET /tenants/:tenantId/integrations`

```bash
curl http://localhost:3000/tenants/tenant-123/integrations
```

**Response:**
```json
{
  "tenantId": "tenant-123",
  "integrations": [
    {
      "name": "notion",
      "category": "productivity",
      "hasCredentials": true,
      "createdAt": "2025-11-12T10:30:00Z",
      "expiresAt": null
    },
    {
      "name": "github",
      "category": "code",
      "hasCredentials": false
    }
  ]
}
```

### 5. Revoke Integration

**Endpoint:** `DELETE /tenants/:tenantId/integrations/:integration/credentials`

```bash
curl -X DELETE http://localhost:3000/tenants/tenant-123/integrations/notion/credentials
```

**Response:**
```json
{
  "success": true,
  "tenantId": "tenant-123",
  "integration": "notion",
  "revokedAt": "2025-11-12T11:00:00Z"
}
```

### 6. Using Integration as Tenant

When making API calls, include `tenantId` in the request:

```javascript
// JavaScript example
const response = await axios.post('http://localhost:3000/api/v1/tools/invoke', {
  toolId: 'notion.createPage',
  integration: 'notion',
  tenantId: 'tenant-123',  // Gateway uses this to fetch credentials
  parameters: {
    parent: { database_id: 'db-id' },
    properties: {
      Name: { title: [{ text: { content: 'New Page' } }] }
    }
  }
});
```

**Process:**
1. Gateway receives request with `tenantId`
2. Fetches encrypted credentials from Vault: `secret/data/tenant-123/notion`
3. Decrypts using tenant-specific key: `transit/keys/tenant-123`
4. Injects `Authorization: Bearer {token}` header
5. Forwards request to Notion MCP server
6. Returns response to client

---

## Option B: Config File Approach (Development/Testing)

**Best for:** Development, testing, small deployments with fixed tenants

### 1. Create Tenant Configuration File

Create `gateway/config/tenants.json`:

```json
{
  "tenants": [
    {
      "id": "tenant-001",
      "name": "Acme Corporation",
      "integrations": [
        {
          "name": "notion",
          "credentials": {
            "accessToken": "${VAULT:secret/data/tenant-001/notion:access_token}",
            "tokenType": "bearer"
          }
        },
        {
          "name": "github",
          "credentials": {
            "accessToken": "${VAULT:secret/data/tenant-001/github:access_token}",
            "refreshToken": "${VAULT:secret/data/tenant-001/github:refresh_token}",
            "expiresAt": "${VAULT:secret/data/tenant-001/github:expires_at}",
            "tokenType": "bearer"
          }
        }
      ]
    },
    {
      "id": "tenant-002",
      "name": "Beta Industries",
      "integrations": [
        {
          "name": "notion",
          "credentials": {
            "accessToken": "${VAULT:secret/data/tenant-002/notion:access_token}",
            "tokenType": "bearer"
          }
        }
      ]
    }
  ]
}
```

### 2. Store Credentials in Vault Manually

```bash
# For tenant-001 Notion integration
vault kv put secret/tenant-001/notion \
  access_token="secret_notion_token_abc123" \
  token_type="bearer" \
  bot_id="bot-123" \
  workspace_id="ws-456" \
  created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# For tenant-001 GitHub integration
vault kv put secret/tenant-001/github \
  access_token="ghp_abc123..." \
  refresh_token="ghr_xyz789..." \
  expires_at="$(date -d '+1 hour' -u +%Y-%m-%dT%H:%M:%SZ)" \
  token_type="bearer"

# For tenant-002 Notion integration
vault kv put secret/tenant-002/notion \
  access_token="secret_notion_token_def456" \
  token_type="bearer" \
  bot_id="bot-789" \
  workspace_id="ws-012"
```

### 3. Encrypt Credentials

Credentials are automatically encrypted when stored in Vault. The VaultClient:
1. Creates a tenant-specific encryption key if it doesn't exist
2. Encrypts `accessToken` and `refreshToken` using Transit engine
3. Stores encrypted values in KV v2

**Manual encryption (advanced):**

```bash
# Create encryption key for tenant
vault write transit/keys/tenant-001 type=aes256-gcm96

# Encrypt a token
echo -n "secret_token_value" | base64 | \
  vault write -field=ciphertext transit/encrypt/tenant-001 plaintext=-

# Decrypt a token
vault write -field=plaintext transit/decrypt/tenant-001 \
  ciphertext="vault:v1:abc123..." | base64 -d
```

### 4. Load Configuration on Gateway Start

Update `gateway/src/server.ts` to load tenant config:

```typescript
import { loadTenantConfig } from './config/tenant-loader';

// On startup
const tenantConfig = await loadTenantConfig('config/tenants.json');
await vaultClient.syncTenantConfig(tenantConfig);
```

### 5. Using Config File Approach

Once configured, usage is identical to API approach:

```javascript
const response = await axios.post('http://localhost:3000/api/v1/tools/invoke', {
  toolId: 'notion.createPage',
  integration: 'notion',
  tenantId: 'tenant-001',  // From config file
  parameters: { /* ... */ }
});
```

---

## Adding a New Tenant

### Quick Method (Manual)

```bash
# 1. Create encryption key for tenant
vault write transit/keys/tenant-new type=aes256-gcm96

# 2. Add tenant's Notion credentials
vault kv put secret/tenant-new/notion \
  access_token="secret_token_xyz" \
  token_type="bearer" \
  bot_id="bot-new" \
  workspace_id="ws-new" \
  created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 3. Test credentials retrieval
curl http://localhost:3000/tenants/tenant-new/integrations
```

### OAuth Flow Method (Recommended)

```bash
# 1. Initiate OAuth flow
curl "http://localhost:3000/oauth/authorize/notion?tenant_id=tenant-new&redirect_uri=https://myapp.com/callback"

# 2. User grants permissions in browser
# Notion redirects to: /oauth/callback/notion?code=...&state=...

# 3. Gateway automatically:
#    - Creates encryption key (tenant-new)
#    - Exchanges code for token
#    - Encrypts and stores credentials
#    - Schedules token refresh

# 4. Verify credentials stored
curl http://localhost:3000/tenants/tenant-new/integrations/notion
```

---

## Adding a New Integration for Existing Tenant

### Example: Add GitHub to tenant-001

```bash
# Option A: OAuth Flow
curl "http://localhost:3000/oauth/authorize/github?tenant_id=tenant-001&redirect_uri=https://myapp.com/callback"

# Option B: Manual credential storage
vault kv put secret/tenant-001/github \
  access_token="ghp_github_token" \
  refresh_token="ghr_refresh_token" \
  expires_at="$(date -d '+1 hour' -u +%Y-%m-%dT%H:%M:%SZ)" \
  token_type="bearer" \
  scopes="repo,user"

# Option C: API endpoint
curl -X POST http://localhost:3000/tenants/tenant-001/integrations/github/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "ghp_github_token",
    "refreshToken": "ghr_refresh_token",
    "expiresIn": 3600,
    "tokenType": "bearer",
    "scopes": ["repo", "user"]
  }'
```

---

## Environment Variables

### Gateway Configuration

```bash
# Vault connection
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=your-vault-token

# Vault engines
VAULT_TRANSIT_ENGINE=transit
VAULT_KV_ENGINE=secret

# Notion OAuth (for OAuth flow)
NOTION_CLIENT_ID=your-notion-client-id
NOTION_CLIENT_SECRET=your-notion-client-secret
NOTION_REDIRECT_URI=http://localhost:3000/oauth/callback/notion

# GitHub OAuth (future)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3000/oauth/callback/github

# Multi-tenant settings
ENABLE_TENANT_CONFIG_FILE=false  # Set to true for Option B
TENANT_CONFIG_PATH=config/tenants.json
```

---

## Security Best Practices

### 1. Tenant Isolation

**Do:**
- Always validate `tenantId` from authenticated user/session
- Never allow tenantId to be arbitrarily set by client
- Use JWT or session tokens to bind tenant to user

**Don't:**
- Trust client-provided tenantId without authentication
- Allow one tenant to access another tenant's resources
- Store tenant credentials unencrypted

**Example authentication:**

```typescript
// Express middleware
function extractTenantId(req: Request, res: Response, next: NextFunction) {
  // Option 1: From JWT
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, SECRET);
  req.tenantId = decoded.tenantId;

  // Option 2: From session
  req.tenantId = req.session.tenantId;

  // Option 3: From API key
  const apiKey = req.headers['x-api-key'];
  req.tenantId = await lookupTenantFromApiKey(apiKey);

  next();
}

// Use in routes
app.post('/api/v1/tools/invoke', extractTenantId, async (req, res) => {
  // req.tenantId is now verified
  const result = await invokeToolForTenant(req.tenantId, req.body);
  res.json(result);
});
```

### 2. Credential Encryption

**Automatic Encryption:**
- VaultClient encrypts all tokens before storage
- Each tenant has a unique Transit encryption key
- Keys never leave Vault, only ciphertext

**Key Rotation:**

```bash
# Rotate tenant encryption key
vault write -f transit/keys/tenant-001/rotate

# Re-encrypt all credentials with new key (automatic on next write)
vault kv put secret/tenant-001/notion @existing_data.json
```

### 3. Access Control Policies

Create Vault policies for different access levels:

**Tenant-specific policy:**

```hcl
# vault/policies/tenant-001-policy.hcl
path "secret/data/tenant-001/*" {
  capabilities = ["read"]
}

path "transit/decrypt/tenant-001" {
  capabilities = ["update"]
}

path "transit/encrypt/tenant-001" {
  capabilities = ["update"]
}
```

**Gateway service policy:**

```hcl
# vault/policies/gateway-service-policy.hcl
path "secret/data/*" {
  capabilities = ["create", "read", "update"]
}

path "transit/encrypt/*" {
  capabilities = ["update"]
}

path "transit/decrypt/*" {
  capabilities = ["update"]
}

path "transit/keys/*" {
  capabilities = ["create", "read"]
}
```

Apply policies:

```bash
vault policy write tenant-001 vault/policies/tenant-001-policy.hcl
vault policy write gateway-service vault/policies/gateway-service-policy.hcl

# Create token with policy
vault token create -policy=gateway-service
```

### 4. Audit Logging

Enable Vault audit logging to track all credential access:

```bash
# Enable audit logging to file
vault audit enable file file_path=/vault/logs/audit.log

# Enable audit logging to syslog
vault audit enable syslog tag="vault" facility="AUTH"

# View audit logs
tail -f /vault/logs/audit.log | jq '.request.path, .auth.display_name'
```

---

## Troubleshooting

### Tenant Cannot Access Integration

**Symptom:** `CredentialNotFoundError: Credentials not found for tenant-123/notion`

**Solutions:**

```bash
# 1. Check if credentials exist
vault kv get secret/tenant-123/notion

# 2. If not exist, check if OAuth flow completed
vault kv list secret/tenant-123

# 3. Check if encryption key exists
vault read transit/keys/tenant-123

# 4. Manually create credentials (testing only)
vault kv put secret/tenant-123/notion \
  access_token="test_token" \
  token_type="bearer"
```

### Token Refresh Failing

**Symptom:** Logs show "Failed to refresh token" repeatedly

**Solutions:**

```bash
# 1. Check if refresh token is valid
vault kv get secret/tenant-123/github

# 2. Check OAuth client credentials
env | grep GITHUB_CLIENT

# 3. Test refresh manually
curl -X POST https://github.com/login/oauth/access_token \
  -u "${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}" \
  -d "grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}"

# 4. If refresh token invalid, re-run OAuth flow
curl "http://localhost:3000/oauth/authorize/github?tenant_id=tenant-123"
```

### Vault Connection Issues

**Symptom:** `VaultError: Failed to connect to Vault`

**Solutions:**

```bash
# 1. Check Vault is running
docker ps | grep vault
curl http://localhost:8200/v1/sys/health

# 2. Check Vault token is valid
vault token lookup

# 3. Check network connectivity from gateway
docker exec gateway curl -v http://vault:8200/v1/sys/health

# 4. Verify environment variables
docker exec gateway env | grep VAULT
```

### Decryption Errors

**Symptom:** `VaultEncryptionError: Failed to decrypt data`

**Solutions:**

```bash
# 1. Check encryption key exists
vault read transit/keys/tenant-123

# 2. Verify ciphertext format (should start with "vault:v1:")
vault kv get -format=json secret/tenant-123/notion | jq '.data.data.access_token'

# 3. Test decryption manually
vault write -field=plaintext transit/decrypt/tenant-123 \
  ciphertext="vault:v1:abc123..." | base64 -d

# 4. If key rotation issue, check key version
vault read transit/keys/tenant-123

# 5. Re-encrypt with current key
vault kv put secret/tenant-123/notion @backup.json
```

---

## Monitoring & Observability

### Metrics to Track

**Per-Tenant Metrics:**
- Number of active integrations
- API call volume
- Token refresh success rate
- Credential access frequency

**System Metrics:**
- Total tenants
- Total credentials stored
- Vault performance (latency, error rate)
- Token refresh queue size

### Logging

```typescript
// Gateway logs structured data for each tenant operation
logger.info('tenant_credential_access', {
  tenantId: 'tenant-123',
  integration: 'notion',
  operation: 'get',
  duration: 45,
  success: true
});

logger.warn('token_refresh_scheduled', {
  tenantId: 'tenant-123',
  integration: 'github',
  currentExpiry: '2025-11-12T11:00:00Z',
  refreshAt: '2025-11-12T10:55:00Z'
});
```

### Health Checks

```bash
# Check all tenant integrations
curl http://localhost:3000/admin/tenants/health

# Response
{
  "totalTenants": 3,
  "totalIntegrations": 5,
  "healthy": 5,
  "unhealthy": 0,
  "details": [
    {
      "tenantId": "tenant-001",
      "integrations": {
        "notion": "healthy",
        "github": "healthy"
      }
    }
  ]
}
```

---

## Next Steps

1. **Production Setup:**
   - Deploy Vault in HA mode (3+ nodes)
   - Enable Vault auto-unsealing
   - Configure backup policies for Vault
   - Set up monitoring and alerting

2. **Add More Integrations:**
   - GitHub (code category)
   - Slack (communication)
   - Jira (project management)
   - Stripe (payments)
   - AWS (cloud)

3. **Implement Tenant Management UI:**
   - Tenant dashboard
   - OAuth connection wizard
   - Integration health status
   - Usage analytics

4. **Advanced Features:**
   - Per-tenant rate limiting
   - Usage quotas and billing
   - Role-based access control (RBAC)
   - Tenant-specific webhooks

---

## References

- [HashiCorp Vault KV v2](https://developer.hashicorp.com/vault/docs/secrets/kv/kv-v2)
- [HashiCorp Vault Transit Engine](https://developer.hashicorp.com/vault/docs/secrets/transit)
- [Notion OAuth Documentation](https://developers.notion.com/docs/authorization)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
