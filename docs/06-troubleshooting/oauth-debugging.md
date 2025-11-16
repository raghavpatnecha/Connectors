# OAuth Debugging Guide

OAuth credential management and token refresh troubleshooting.

---

## OAuth Error Codes

| Error | Status | Description | Retryable |
|-------|--------|-------------|-----------|
| `CREDENTIAL_NOT_FOUND` | 404 | OAuth not configured | No |
| `TOKEN_EXPIRED` | 401 | Token expired | Yes |
| `TOKEN_REFRESH_FAILED` | 500 | Refresh failed | Yes |
| `VAULT_ERROR` | 500 | Vault connection failed | Yes |
| `INVALID_OAUTH_CONFIG` | 400 | Missing fields | No |
| `RATE_LIMITED` | 429 | Provider rate limit | Yes |

---

## Credentials Not Found

### Error

```json
{
  "error": "OAuth credentials not found for tenant 'my-tenant' and integration 'github'",
  "code": "CREDENTIAL_NOT_FOUND"
}
```

### Diagnosis

```bash
# Check if exists
curl http://localhost:3000/api/v1/tenants/my-tenant/integrations/github/oauth-config

# List all integrations
curl http://localhost:3000/api/v1/tenants/my-tenant/integrations

# Check Vault
docker exec vault vault kv get secret/data/my-tenant/github
```

### Solution

```bash
# Configure OAuth
curl -X POST http://localhost:3000/api/v1/tenants/my-tenant/integrations/github/oauth-config \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "your-github-client-id",
    "clientSecret": "your-github-client-secret",
    "redirectUri": "https://yourapp.com/oauth/callback",
    "scopes": ["repo", "user", "read:org"]
  }'

# Verify
curl http://localhost:3000/api/v1/tenants/my-tenant/integrations/github/oauth-config
```

---

## Token Refresh Failures

### Error

```json
{
  "error": "Failed to refresh OAuth token",
  "code": "TOKEN_REFRESH_FAILED"
}
```

### Common Causes

1. Invalid refresh token (expired/revoked)
2. Network issues
3. Invalid client ID/secret

### Diagnosis

```bash
# Check logs
tail -f gateway/logs/combined.log | grep token_refresh

# Check Vault
docker exec vault vault kv get secret/data/my-tenant/github

# Test provider (GitHub example)
curl -X POST https://github.com/login/oauth/access_token \
  -H "Accept: application/json" \
  -d "client_id=YOUR_ID" \
  -d "client_secret=YOUR_SECRET" \
  -d "refresh_token=YOUR_REFRESH" \
  -d "grant_type=refresh_token"
```

### Solutions

```bash
# Reconfigure OAuth
curl -X DELETE http://localhost:3000/api/v1/tenants/my-tenant/integrations/github/oauth-config
curl -X POST http://localhost:3000/api/v1/tenants/my-tenant/integrations/github/oauth-config -d '{...}'

# Check scheduler
tail -f gateway/logs/combined.log | grep refresh_scheduled

# Force refresh (make tool call)
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{"toolId":"github.listRepos","tenantId":"my-tenant",...}'
```

---

## Vault Connection Errors

### Error

```json
{
  "error": "Failed to connect to Vault",
  "code": "VAULT_ERROR"
}
```

### Diagnosis

```bash
# Check health
curl http://localhost:8200/v1/sys/health
# Expected: {"initialized":true,"sealed":false}

# Check logs
docker compose logs vault

# Test from gateway
docker exec gateway curl -s http://vault:8200/v1/sys/health
```

### Solutions

**Vault Sealed:**
```bash
curl http://localhost:8200/v1/sys/health | jq '.sealed'

# Restart (auto-unseals in dev mode)
docker compose restart vault
sleep 5

curl http://localhost:8200/v1/sys/health | jq '.sealed'
# Should return: false
```

**Vault Not Running:**
```bash
docker compose up -d vault
sleep 5
curl http://localhost:8200/v1/sys/health
```

**Invalid Token:**
```bash
cat gateway/.env | grep VAULT_TOKEN
docker exec vault vault token lookup
```

---

## Vault Encryption Errors

### Error

```json
{
  "error": "Failed to encrypt credentials",
  "code": "VAULT_ENCRYPTION_ERROR"
}
```

### Solutions

```bash
# Enable transit
docker exec vault vault secrets enable transit

# Create key
docker exec vault vault write -f transit/keys/my-tenant

# Test encryption
docker exec vault vault write transit/encrypt/my-tenant \
  plaintext=$(echo "test" | base64)
```

---

## Integration-Specific Issues

### GitHub OAuth

**Invalid Scopes:**
```bash
curl -X POST http://localhost:3000/api/v1/tenants/my-tenant/integrations/github/oauth-config \
  -d '{"scopes": ["repo", "user", "read:org", "admin:repo_hook"]}'
```

**Rate Limits:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  https://api.github.com/rate_limit
```

---

### LinkedIn OAuth

**Redirect URI Mismatch:**
```bash
# Must match LinkedIn app config exactly
# Check: LinkedIn Developer Portal → App → Auth → Redirect URLs
curl -X POST http://localhost:3000/api/v1/tenants/my-tenant/integrations/linkedin/oauth-config \
  -d '{"redirectUri": "https://exact-match.com/oauth/callback"}'
```

---

### Notion OAuth

**Workspace Access:**
- User must share workspace with integration
- Notion → Settings & Members → Integrations → Add Integration

---

## Debug Commands

### Vault Debug

```bash
# List secrets
docker exec vault vault kv list secret/

# Get credentials
docker exec vault vault kv get secret/data/my-tenant/github

# Check encryption key
docker exec vault vault read transit/keys/my-tenant

# Logs
docker compose logs vault | tail -50
```

### Gateway Debug

```bash
# OAuth health
curl http://localhost:3000/api/v1/tenants/oauth-config/health

# List integrations
curl http://localhost:3000/api/v1/tenants/my-tenant/integrations

# Logs - OAuth operations
tail -f gateway/logs/combined.log | grep oauth

# Logs - Token refresh
tail -f gateway/logs/combined.log | grep token_refresh
```

### Integration Debug

```bash
# Test GitHub API
curl -H "Authorization: Bearer TOKEN" https://api.github.com/user

# Test LinkedIn API
curl -H "Authorization: Bearer TOKEN" https://api.linkedin.com/v2/me

# Test Notion API
curl -H "Authorization: Bearer TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  https://api.notion.com/v1/users/me
```

---

## Auto-Refresh Monitoring

### Check Scheduler

```bash
# View scheduled refreshes
tail -f gateway/logs/combined.log | grep refresh_scheduled

# Monitor executions
tail -f gateway/logs/combined.log | grep token_refreshed

# Check failures
tail -f gateway/logs/error.log | grep refresh
```

### Verify Working

```bash
# Check token expiry
docker exec vault vault kv get secret/data/my-tenant/github | grep expires_at

# Monitor refresh (5 min before expiry)
tail -f gateway/logs/combined.log | grep -E "(refresh_scheduled|token_refreshed)"
```

---

## Next Steps

- **[Common Issues](./common-issues.md)** - General troubleshooting
- **[Troubleshooting Index](./index.md)** - Overview
- **[API Reference](../05-api-reference/index.md)** - API docs
