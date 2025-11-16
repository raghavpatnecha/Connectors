# OAuth Setup Guide

Quick start for OAuth credential management with HashiCorp Vault.

---

## Quick Start (5 Minutes)

### 1. Start Vault

```bash
cd /home/user/Connectors/vault
docker-compose -f docker-compose.vault.yml up -d

# Verify
docker ps | grep vault
curl http://localhost:8200/v1/sys/health
```

Auto-initializes: KV v2, Transit encryption, OAuth policy, audit logging.

### 2. Basic Usage

```typescript
import { VaultClient, OAuthProxy } from './gateway/src/auth';

const vault = new VaultClient({
  address: 'http://localhost:8200',
  token: 'dev-root-token'
});

const proxy = new OAuthProxy(vault);
proxy.start();

// Store credentials
await proxy.storeInitialCredentials('tenant-123', 'github', {
  access_token: 'gho_...', refresh_token: 'ghr_...', expires_in: 3600
});

// Make requests
await proxy.proxyRequest({
  tenantId: 'tenant-123', integration: 'github', method: 'GET', path: '/user'
});
```

---

## Environment Configuration

```bash
# Vault
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-root-token
VAULT_TRANSIT_ENGINE=transit
VAULT_KV_ENGINE=secret

# OAuth (GitHub example)
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_REDIRECT_URI=http://localhost:3000/oauth/callback/github

# OAuth (Notion example)
NOTION_CLIENT_ID=your-client-id
NOTION_CLIENT_SECRET=your-client-secret
NOTION_REDIRECT_URI=http://localhost:3000/oauth/callback/notion
```

---

## Store Credentials

### Manual Storage

```bash
# Notion
curl -X POST http://localhost:3000/api/v1/tenants/tenant-123/integrations/notion/oauth-config \
  -d '{"accessToken": "secret_...", "tokenType": "bearer", "expiresIn": 0}'

# GitHub (with refresh)
curl -X POST http://localhost:3000/api/v1/tenants/tenant-123/integrations/github/oauth-config \
  -d '{"accessToken": "ghp_...", "refreshToken": "ghr_...", "expiresIn": 3600}'
```

### OAuth Flow

```bash
# 1. Initiate
curl -X POST "http://localhost:3000/api/v1/oauth/authorize/github?tenant_id=tenant-123"
# Returns: {"authorizationUrl": "https://github.com/...", "state": "csrf_xyz"}

# 2. Redirect user → User grants → GitHub redirects to callback
# 3. Gateway auto-stores encrypted credentials
```

---

## API Endpoints

```bash
# OAuth Flow
POST /api/v1/oauth/authorize/:integration?tenant_id={tenantId}
GET /api/v1/oauth/callback/:integration?code={code}&state={state}

# Credentials
POST /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
GET /api/v1/tenants/:tenantId/integrations/:integration
DELETE /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
POST /api/v1/tenants/:tenantId/integrations/:integration/refresh

# Tenant
GET /api/v1/tenants/:tenantId/integrations
GET /api/v1/tenants/:tenantId/status
```

See [API_TENANT_OAUTH.md](../../API_TENANT_OAUTH.md) for details.

---

## Testing

### Notion Test

```bash
# Store
curl -X POST http://localhost:3000/api/v1/tenants/test/integrations/notion/oauth-config \
  -d '{"accessToken": "secret_test", "tokenType": "bearer", "expiresIn": 0}'

# Verify
curl http://localhost:3000/api/v1/tenants/test/integrations/notion

# Use
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{"toolId": "notion.search", "integration": "notion", "tenantId": "test", "parameters": {"query": "test"}}'
```

### GitHub Auto-Refresh Test

```bash
# Store (5-min expiry)
curl -X POST http://localhost:3000/api/v1/tenants/test/integrations/github/oauth-config \
  -d '{"accessToken": "ghp_test", "refreshToken": "ghr_test", "expiresIn": 300}'

# Check (shows nextRefresh 5 min before expiry)
curl http://localhost:3000/api/v1/tenants/test/integrations/github

# Manual refresh
curl -X POST http://localhost:3000/api/v1/tenants/test/integrations/github/refresh
```

---

## Troubleshooting

### Vault Issues

```bash
# Check status
docker ps | grep vault
curl http://localhost:8200/v1/sys/health
docker logs connectors-vault

# Restart
docker-compose -f docker-compose.vault.yml restart vault
```

### Credentials Not Found

```bash
# List secrets
docker exec connectors-vault vault kv list secret/tenant-123

# Read credential
docker exec connectors-vault vault kv get secret/tenant-123/github

# Check key
docker exec connectors-vault vault read transit/keys/tenant-123
```

### Refresh Failing

```bash
# Check OAuth config
env | grep GITHUB_CLIENT

# Test refresh
curl -X POST https://github.com/login/oauth/access_token \
  -u "${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}" \
  -d "grant_type=refresh_token&refresh_token=${REFRESH_TOKEN}"

# Re-run OAuth flow if needed
curl -X POST "http://localhost:3000/api/v1/oauth/authorize/github?tenant_id=tenant-123"
```

### Encryption Errors

```bash
# Check/create key
docker exec connectors-vault vault read transit/keys/tenant-123
docker exec connectors-vault vault write transit/keys/tenant-123 type=aes256-gcm96

# Test encryption
echo -n "test" | base64 | \
  docker exec -i connectors-vault vault write -field=ciphertext transit/encrypt/tenant-123 plaintext=-
```

---

## Production

### AppRole Auth

```bash
vault auth enable approle
vault write auth/approle/role/gateway token_policies="oauth-policy" token_ttl=1h
vault read auth/approle/role/gateway/role-id
vault write -f auth/approle/role/gateway/secret-id
```

### TLS

```hcl
listener "tcp" {
  address = "0.0.0.0:8200"
  tls_cert_file = "/vault/certs/vault.crt"
  tls_key_file = "/vault/certs/vault.key"
}
```

### Production Env

```bash
VAULT_ADDR=https://vault.production.com:8200
VAULT_ROLE_ID=your-role-id
VAULT_SECRET_ID=your-secret-id
```

---

## Monitoring

```bash
# Audit logs
docker exec connectors-vault tail -f /vault/logs/audit.log | jq 'select(.request.path | contains("tenant-123"))'
```

```typescript
// Health check
const isHealthy = await vault.healthCheck();

// Events
scheduler.on('refresh-success', ({ tenantId, integration }) => {
  console.log(`Refreshed: ${tenantId}/${integration}`);
});
```

---

## Next Steps

- **Multi-tenant setup:** See [multi-tenant.md](./multi-tenant.md)
- **API reference:** See [API_TENANT_OAUTH.md](../../API_TENANT_OAUTH.md)
- **Architecture:** See [MULTI_TENANT_OAUTH_ARCHITECTURE.md](../../MULTI_TENANT_OAUTH_ARCHITECTURE.md)
- **Run tests:** `cd gateway && npm test -- tests/auth/`
