# Multi-Tenant OAuth Architecture

Complete guide for multi-tenant OAuth credential management with per-tenant isolation and encryption.

---

## Architecture Overview

```
Tenant (Alice, Bob...)
  ↓ OAuth apps
API / Config File
  ↓
OAuthConfigManager
  ↓
HashiCorp Vault
  ├─ OAuth Apps: secret/oauth-apps/{tenant}/{integration}
  ├─ User Tokens: secret/data/{tenant}/{integration}
  └─ Encryption: transit/keys/{tenant}
  ↓
OAuth Proxy → MCP Server
```

**Features:** Per-tenant isolation ✅ | Encryption ✅ | Auto-refresh ✅ | API + Config ✅ | Audit logs ✅

---

## Storage Architecture

### Vault Paths

```
OAuth Apps:          secret/data/oauth-apps/{tenantId}/{integration}
User Tokens:         secret/data/{tenantId}/{integration}
Encryption Keys:     transit/keys/{tenantId}
```

### Data Structure

**OAuth App:**
```json
{
  "clientId": "notion_abc123",
  "clientSecret": "vault:v1:encrypted",
  "authEndpoint": "https://api.notion.com/v1/oauth/authorize",
  "tokenEndpoint": "https://api.notion.com/v1/oauth/token",
  "redirectUri": "https://platform.com/oauth/callback/alice/notion",
  "scopes": ["read_content"]
}
```

**User Tokens:**
```json
{
  "accessToken": "vault:v1:encrypted",
  "refreshToken": "vault:v1:encrypted",
  "expiresAt": "2025-11-12T12:00:00Z",
  "tokenType": "Bearer"
}
```

---

## Multi-Tenant Configuration

### Option A: API (Production)

Best for: Dynamic onboarding, SaaS, automation

```bash
# 1. Register OAuth app
curl -X POST http://localhost:3000/api/v1/oauth-apps/alice/notion \
  -d '{"clientId": "notion_alice", "clientSecret": "secret_xyz", "redirectUri": "..."}'

# 2. Initiate OAuth
curl -X POST "http://localhost:3000/oauth/authorize/notion?tenant_id=alice"

# 3. User grants → Gateway auto-stores encrypted credentials

# 4. Verify
curl http://localhost:3000/tenants/alice/integrations/notion
```

### Option B: Config File (Dev/Test)

**Create `gateway/config/oauth-apps.json`:**
```json
{
  "version": "1.0.0",
  "tenants": [
    {
      "tenantId": "alice",
      "integrations": [{
        "integration": "notion",
        "clientId": "notion_alice",
        "clientSecret": "secret_alice",
        "redirectUri": "http://localhost:3000/oauth/callback/alice/notion"
      }]
    }
  ]
}
```

**Start:** Gateway loads config, syncs to Vault encrypted.

---

## Vault Integration

### Encryption

```bash
vault write transit/keys/alice type=aes256-gcm96  # Create
echo -n "secret" | base64 | vault write -field=ciphertext transit/encrypt/alice plaintext=-  # Encrypt
vault write -field=plaintext transit/decrypt/alice ciphertext="vault:v1:..." | base64 -d  # Decrypt
```

### Policies

**Gateway:**
```hcl
path "secret/data/oauth-apps/*" { capabilities = ["create", "read", "update", "delete"] }
path "secret/data/*" { capabilities = ["create", "read", "update", "delete"] }
path "transit/*" { capabilities = ["create", "read", "update"] }
```

**Tenant (Alice):**
```hcl
path "secret/data/alice/*" { capabilities = ["read"] }
path "transit/encrypt/alice" { capabilities = ["update"] }
path "transit/decrypt/alice" { capabilities = ["update"] }
```

---

## Tenant Onboarding

```bash
# Create tenant
curl -X POST http://localhost:3000/tenants -d '{"tenantId": "carol", "name": "Carol"}'

# Add integration (OAuth)
curl -X POST "http://localhost:3000/oauth/authorize/notion?tenant_id=carol"

# Add integration (manual)
curl -X POST http://localhost:3000/tenants/carol/integrations/notion/credentials \
  -d '{"accessToken": "secret_...", "tokenType": "bearer", "expiresIn": 0}'

# List integrations
curl http://localhost:3000/tenants/carol/integrations

# Remove integration
curl -X DELETE http://localhost:3000/tenants/carol/integrations/notion/credentials

# Delete tenant
curl -X DELETE "http://localhost:3000/tenants/carol?confirm=true"
```

---

## Migration from Single-Tenant

### Before (Hardcoded)
```typescript
oauthProxy.registerOAuthConfig('notion', {clientId: '...', clientSecret: '...'});
```

### After (Multi-Tenant)

**API:**
```bash
curl -X POST http://localhost:3000/api/v1/oauth-apps/tenant-123/notion -d '{...}'
```

**Config:**
```json
{"tenants": [{"tenantId": "tenant-123", "integrations": [{...}]}]}
```

### Migration Steps

1. Backup Vault credentials
2. Create config file with OAuth apps
3. Start gateway with `OAUTH_APPS_CONFIG`
4. Verify apps loaded to Vault
5. Test OAuth flow
6. Remove hardcoded `registerOAuthConfig()` calls

---

## Security

| Threat | Mitigation |
|--------|-----------|
| Unauthorized access | Vault policies, API auth |
| Cross-tenant access | Validate tenantId from JWT/API key |
| MITM | HTTPS, state validation |
| Leakage | Mask secrets in logs |

**Extract tenantId from auth (never trust client):**
```typescript
const token = jwt.verify(req.headers.authorization, SECRET);
req.tenantId = token.tenantId;  // From JWT
// OR: req.tenantId = await lookupTenantFromApiKey(req.headers['x-api-key']);
```

**Audit:**
```bash
docker exec connectors-vault tail -f /vault/logs/audit.log | jq 'select(.request.path | contains("alice"))'
```

---

## Advanced

**Auto-Refresh (5 min before expiry):**
```typescript
scheduler.schedule({
  runAt: new Date(expiresAt.getTime() - 5 * 60 * 1000),
  job: async () => {
    const refreshed = await oauthClient.refresh(await vault.getCredentials('alice', 'github'));
    await vault.storeCredentials('alice', 'github', refreshed);
  }
});
```

**Health:**
```bash
curl http://localhost:3000/admin/health/tenants
curl http://localhost:3000/tenants/alice/status
```

---

## Next Steps

- **Quick setup:** See [setup.md](./setup.md)
- **API reference:** See [API_TENANT_OAUTH.md](../../API_TENANT_OAUTH.md)
- **Full architecture:** See [MULTI_TENANT_OAUTH_ARCHITECTURE.md](../../MULTI_TENANT_OAUTH_ARCHITECTURE.md)
- **Production deployment:** See [oauth-implementation-guide.md](../../oauth-implementation-guide.md)
