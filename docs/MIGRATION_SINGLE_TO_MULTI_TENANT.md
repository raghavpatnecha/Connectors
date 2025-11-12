# Migration Guide: Single-Tenant to Multi-Tenant

## Overview

This guide helps you migrate from the current Notion-only single-tenant setup to a full multi-tenant architecture supporting multiple tenants and integrations.

**Current State:**
- Single integration (Notion)
- Notion-specific initialization scripts
- Hardcoded paths in Vault

**Target State:**
- Multiple tenants with isolated credentials
- Multiple integrations per tenant
- Generic, reusable infrastructure
- API-driven tenant management

**Migration Complexity:** Low-Medium
**Estimated Time:** 30-60 minutes
**Downtime Required:** Minimal (5-10 minutes for Vault restructuring)

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Migration Strategy](#migration-strategy)
- [Step-by-Step Migration](#step-by-step-migration)
- [Backward Compatibility](#backward-compatibility)
- [Rollback Plan](#rollback-plan)
- [Testing](#testing)
- [Post-Migration Tasks](#post-migration-tasks)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting the migration:

### 1. Backup Current State

```bash
# Backup Vault data
vault kv get -format=json secret/tenants/test-tenant-001/notion > backup-notion-credentials.json

# Backup Vault encryption keys
vault list -format=json transit/keys > backup-encryption-keys.json

# Backup gateway environment
cp gateway/.env gateway/.env.backup

# Backup docker-compose configuration
cp docker-compose.yml docker-compose.yml.backup
```

### 2. Verify Current Setup

```bash
# Check Vault is running
vault status

# Check current credentials
vault kv get secret/tenants/test-tenant-001/notion

# Check gateway is running
curl http://localhost:3000/health

# Check Notion integration works
curl http://localhost:3000/integrations/notion/status
```

### 3. Review Current Structure

```bash
# Current Vault structure
vault kv list secret/tenants/test-tenant-001/

# Current Transit keys
vault list transit/keys/

# Current gateway config
cat gateway/.env | grep NOTION
```

---

## Migration Strategy

### Option A: In-Place Migration (Recommended)

Migrate existing credentials to new multi-tenant structure while maintaining compatibility.

**Pros:**
- No downtime
- Preserves existing credentials
- Easy rollback

**Cons:**
- Requires careful path mapping
- Some manual credential copying

### Option B: Fresh Start Migration

Create new multi-tenant setup from scratch and migrate credentials manually.

**Pros:**
- Clean slate
- Easier to understand
- Better long-term structure

**Cons:**
- Requires OAuth re-authorization
- More downtime
- Manual setup

**We'll use Option A (In-Place Migration) in this guide.**

---

## Step-by-Step Migration

### Step 1: Update Vault Structure

#### 1.1. Review Current Vault Paths

```bash
# Current structure (from init-notion-oauth.sh):
# - Credentials: secret/tenants/test-tenant-001/notion
# - Encryption key: transit/keys/notion-test-tenant-001

# Target structure:
# - Credentials: secret/data/test-tenant-001/notion
# - Encryption key: transit/keys/test-tenant-001
```

#### 1.2. Rename Encryption Key (if needed)

```bash
# Check current key name
vault list transit/keys/

# If key is named "notion-test-tenant-001", create new key with correct naming
vault write transit/keys/test-tenant-001 type=aes256-gcm96

# Migrate credentials to use new key:
# 1. Get current credentials
vault kv get -format=json secret/tenants/test-tenant-001/notion > temp-credentials.json

# 2. Extract and decrypt access token (if encrypted)
ENCRYPTED_TOKEN=$(jq -r '.data.data.access_token' temp-credentials.json)

# If token is encrypted with old key:
vault write -field=plaintext transit/decrypt/notion-test-tenant-001 \
  ciphertext="$ENCRYPTED_TOKEN" | base64 -d > plaintext-token.txt

# 3. Encrypt with new key
PLAINTEXT_TOKEN=$(cat plaintext-token.txt)
NEW_ENCRYPTED=$(echo -n "$PLAINTEXT_TOKEN" | base64 | \
  vault write -field=ciphertext transit/encrypt/test-tenant-001 plaintext=-)

# 4. Update credentials with new encryption
vault kv put secret/tenants/test-tenant-001/notion \
  access_token="$NEW_ENCRYPTED" \
  token_type="bearer" \
  bot_id="$(jq -r '.data.data.bot_id' temp-credentials.json)" \
  workspace_id="$(jq -r '.data.data.workspace_id' temp-credentials.json)" \
  created_at="$(jq -r '.data.data.created_at' temp-credentials.json)" \
  updated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 5. Clean up temp files
rm temp-credentials.json plaintext-token.txt
```

#### 1.3. Verify New Structure

```bash
# Check new encryption key exists
vault read transit/keys/test-tenant-001

# Check credentials accessible
vault kv get secret/tenants/test-tenant-001/notion

# Test decryption with new key
vault kv get -format=json secret/tenants/test-tenant-001/notion | \
  jq -r '.data.data.access_token' | \
  vault write -field=plaintext transit/decrypt/test-tenant-001 ciphertext=- | \
  base64 -d
```

### Step 2: Update Gateway Configuration

#### 2.1. Create Multi-Tenant Configuration File

```bash
cd gateway

# Copy example configuration
cp config/tenants.example.json config/tenants.json

# Edit to match your current setup
cat > config/tenants.json <<'EOF'
{
  "version": "1.0.0",
  "tenants": [
    {
      "id": "test-tenant-001",
      "name": "Test Tenant (Migrated)",
      "enabled": true,
      "metadata": {
        "organization": "Test Organization",
        "plan": "test",
        "region": "local",
        "migratedFrom": "single-tenant-notion-setup"
      },
      "integrations": [
        {
          "name": "notion",
          "enabled": true,
          "credentials": {
            "source": "vault",
            "vaultPath": "secret/data/tenants/test-tenant-001/notion"
          },
          "config": {
            "workspaceId": "YOUR_WORKSPACE_ID",
            "botId": "YOUR_BOT_ID"
          }
        }
      ]
    }
  ]
}
EOF
```

#### 2.2. Update Environment Variables

```bash
# Backup current .env
cp .env .env.backup

# Update .env for multi-tenant support
cat >> .env <<'EOF'

# Multi-tenant configuration
ENABLE_TENANT_CONFIG_FILE=true
TENANT_CONFIG_PATH=config/tenants.json

# Vault configuration (ensure these are set)
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
VAULT_TRANSIT_ENGINE=transit
VAULT_KV_ENGINE=secret

# Notion OAuth (keep existing for OAuth flow)
NOTION_CLIENT_ID=your_client_id
NOTION_CLIENT_SECRET=your_client_secret
NOTION_REDIRECT_URI=http://localhost:3000/oauth/callback/notion
NOTION_ENABLED=true
NOTION_SERVER_URL=http://localhost:3100
NOTION_RATE_LIMIT=3
EOF

# Verify variables set correctly
cat .env | grep -E '(TENANT|VAULT|NOTION)'
```

#### 2.3. Update Docker Compose (if needed)

```bash
# Edit docker-compose.yml
cat >> docker-compose.yml <<'EOF'

  # Gateway service - add volume for tenant config
  gateway:
    volumes:
      - ./gateway/config:/app/config:ro  # Mount tenant configuration
    environment:
      - ENABLE_TENANT_CONFIG_FILE=true
      - TENANT_CONFIG_PATH=/app/config/tenants.json
EOF
```

### Step 3: Test Multi-Tenant Setup

#### 3.1. Restart Gateway

```bash
# Stop gateway
docker-compose stop gateway

# Start with new configuration
docker-compose up -d gateway

# Check logs
docker-compose logs -f gateway | grep -E '(tenant|integration)'
```

#### 3.2. Verify Tenant Loaded

```bash
# Check tenant configuration loaded
curl http://localhost:3000/tenants/test-tenant-001/status

# Expected response:
{
  "tenantId": "test-tenant-001",
  "status": "active",
  "integrations": {
    "total": 1,
    "active": 1
  }
}

# Check integration status
curl http://localhost:3000/tenants/test-tenant-001/integrations/notion

# Expected response:
{
  "tenantId": "test-tenant-001",
  "integration": "notion",
  "hasCredentials": true,
  "status": {
    "tokenType": "bearer",
    "expiresAt": null
  }
}
```

#### 3.3. Test Integration Still Works

```bash
# Test tool selection
curl -X POST http://localhost:3000/api/v1/tools/select \
  -H "Content-Type: application/json" \
  -d '{
    "query": "create a notion page",
    "context": {
      "tenantId": "test-tenant-001",
      "maxTools": 5
    }
  }'

# Test tool invocation (if you have a test database)
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "notion.search",
    "integration": "notion",
    "tenantId": "test-tenant-001",
    "parameters": {
      "query": "test"
    }
  }'
```

### Step 4: Add Additional Tenants (Optional)

Now that multi-tenant setup is working, add more tenants:

#### 4.1. Add New Tenant to Configuration

```bash
# Edit config/tenants.json, add new tenant:
{
  "id": "tenant-002",
  "name": "Second Tenant",
  "enabled": true,
  "integrations": [
    {
      "name": "notion",
      "enabled": true,
      "credentials": {
        "source": "vault",
        "vaultPath": "secret/data/tenant-002/notion"
      }
    }
  ]
}
```

#### 4.2. Initialize OAuth for New Tenant

```bash
# Initiate OAuth flow for new tenant
curl -X POST "http://localhost:3000/oauth/authorize/notion?tenant_id=tenant-002&redirect_uri=http://localhost:3000/oauth-success"

# Response includes authorization URL
# Open in browser, approve in Notion
# Gateway automatically stores credentials
```

#### 4.3. Verify New Tenant

```bash
# Check credentials stored
vault kv get secret/tenant-002/notion

# Check encryption key created
vault read transit/keys/tenant-002

# Test integration
curl http://localhost:3000/tenants/tenant-002/integrations/notion
```

### Step 5: Clean Up Old Configuration

#### 5.1. Mark Notion-Specific Scripts as Deprecated

```bash
# Create deprecation notice
cat > vault/scripts/init-notion-oauth.sh.DEPRECATED <<'EOF'
#!/bin/bash
# DEPRECATED: This script is deprecated in favor of multi-tenant setup
# Use the multi-tenant configuration instead:
#   - See docs/MULTI_TENANT_SETUP.md
#   - Use config/tenants.json for tenant configuration
#   - Use API endpoints for OAuth flow

echo "This script is deprecated. Please use multi-tenant setup."
echo "See docs/MULTI_TENANT_SETUP.md for migration guide."
exit 1
EOF

# Move old script
mv vault/scripts/init-notion-oauth.sh vault/scripts/init-notion-oauth.sh.old

# Link to new deprecation notice
ln -s init-notion-oauth.sh.DEPRECATED vault/scripts/init-notion-oauth.sh
```

#### 5.2. Update Notion-Specific Config

```bash
# Move old Notion config to archive
mkdir -p vault/configs/archive
mv vault/configs/notion-oauth-config.json vault/configs/archive/

# Create deprecation notice
cat > vault/configs/notion-oauth-config.json <<'EOF'
{
  "deprecated": true,
  "message": "This configuration is deprecated. Use multi-tenant setup instead.",
  "migration_guide": "See docs/MIGRATION_SINGLE_TO_MULTI_TENANT.md",
  "new_config_location": "gateway/config/tenants.json"
}
EOF
```

### Step 6: Update Documentation References

```bash
# Add migration notice to Notion setup guide
cat > docs/integrations/NOTION_SETUP_MIGRATION_NOTICE.md <<'EOF'
# Migration Notice

This guide has been updated for multi-tenant setup.

**For new installations:**
- Follow [Multi-Tenant Setup Guide](../MULTI_TENANT_SETUP.md)
- Use the new configuration format in `gateway/config/tenants.json`

**For existing single-tenant installations:**
- Follow [Migration Guide](../MIGRATION_SINGLE_TO_MULTI_TENANT.md)
- Existing credentials will continue to work

**Legacy documentation:**
- See `NOTION_SETUP.md` for original single-tenant setup
- Use only if you need single-tenant deployment
EOF
```

---

## Backward Compatibility

### Maintaining Compatibility

The VaultClient and OAuthProxy already support multi-tenant by design:

```typescript
// Both old and new paths work
await vaultClient.getCredentials('test-tenant-001', 'notion');

// Old code (still works)
const result = await oauthProxy.proxyRequest({
  tenantId: 'test-tenant-001',
  integration: 'notion',
  method: 'POST',
  path: '/pages',
  body: { /* ... */ }
});

// New code (preferred)
const result = await integrationRegistry
  .getInstance('notion')
  .proxyRequest({
    tenantId: 'test-tenant-001',
    method: 'POST',
    path: '/pages',
    body: { /* ... */ }
  });
```

### Code Compatibility Layer

If needed, create compatibility wrappers:

```typescript
// gateway/src/compatibility/notion-legacy.ts

/**
 * Legacy compatibility for single-tenant Notion setup
 * @deprecated Use multi-tenant IntegrationRegistry instead
 */
export class NotionLegacyAdapter {
  private static DEFAULT_TENANT = 'test-tenant-001';

  static async invoke(tool: string, params: any) {
    console.warn('Using deprecated NotionLegacyAdapter. Migrate to IntegrationRegistry.');

    return integrationRegistry
      .getInstance('notion')
      .proxyRequest({
        tenantId: this.DEFAULT_TENANT,
        method: 'POST',
        path: `/tools/${tool}`,
        body: params
      });
  }
}
```

---

## Rollback Plan

If migration fails, roll back to previous state:

### Step 1: Restore Vault Data

```bash
# Restore Notion credentials
vault kv put secret/tenants/test-tenant-001/notion @backup-notion-credentials.json

# Restore encryption key (if needed)
# Note: Can't restore keys directly, but old credentials should still work
```

### Step 2: Restore Gateway Configuration

```bash
# Restore .env
cp gateway/.env.backup gateway/.env

# Remove tenant config
rm gateway/config/tenants.json

# Restore docker-compose
cp docker-compose.yml.backup docker-compose.yml
```

### Step 3: Restart Services

```bash
# Restart gateway with old configuration
docker-compose restart gateway

# Verify old setup works
curl http://localhost:3000/integrations/notion/status
```

### Step 4: Verify Rollback

```bash
# Test Notion integration
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "notion.search",
    "integration": "notion",
    "parameters": {"query": "test"}
  }'
```

---

## Testing

### Test Plan

**1. Smoke Tests (5 minutes)**

```bash
# Test gateway health
curl http://localhost:3000/health

# Test Vault connection
vault status

# Test tenant configuration loaded
curl http://localhost:3000/tenants/test-tenant-001/status
```

**2. Integration Tests (10 minutes)**

```bash
# Test credential retrieval
curl http://localhost:3000/tenants/test-tenant-001/integrations/notion

# Test tool selection
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "create page", "context": {"tenantId": "test-tenant-001"}}'

# Test tool invocation
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{"toolId": "notion.search", "tenantId": "test-tenant-001", "parameters": {"query": "test"}}'
```

**3. Multi-Tenant Tests (15 minutes)**

```bash
# Add second tenant
curl -X POST http://localhost:3000/tenants \
  -d '{"tenantId": "tenant-test-002", "name": "Test Tenant 2"}'

# Initiate OAuth for second tenant
curl -X POST "http://localhost:3000/oauth/authorize/notion?tenant_id=tenant-test-002"

# Verify tenant isolation
curl http://localhost:3000/tenants/tenant-test-002/integrations
```

**4. Performance Tests (10 minutes)**

```bash
# Test concurrent requests for multiple tenants
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/v1/tools/select \
    -d "{\"query\": \"test $i\", \"context\": {\"tenantId\": \"test-tenant-001\"}}" &
done
wait

# Check response times acceptable (<100ms)
```

### Test Checklist

- [ ] Gateway starts successfully
- [ ] Tenant configuration loads
- [ ] Vault credentials accessible
- [ ] Notion integration works for existing tenant
- [ ] Can add new tenants
- [ ] OAuth flow works for new tenants
- [ ] Tool selection works
- [ ] Tool invocation works
- [ ] Multiple tenants isolated
- [ ] Performance acceptable
- [ ] Logs show no errors
- [ ] Rollback tested successfully

---

## Post-Migration Tasks

### 1. Update CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

- name: Deploy Multi-Tenant Configuration
  run: |
    # Upload tenant configuration to production
    scp gateway/config/tenants.production.json server:/app/gateway/config/tenants.json

    # Restart gateway
    ssh server "docker-compose restart gateway"

    # Verify deployment
    curl https://api.production.com/admin/health/tenants
```

### 2. Monitor Migration

```bash
# Set up monitoring alerts
# - Vault credential access patterns
# - Gateway error rates
# - Tenant-specific metrics
# - OAuth flow success rates

# Example: Grafana dashboard for multi-tenant metrics
# - Active tenants count
# - Integrations per tenant
# - API calls per tenant
# - Token refresh success rate
```

### 3. Update Team Documentation

```markdown
# Internal Wiki Update

## Notion Integration Setup (Updated)

**Old Process (Deprecated):**
- Run `./vault/scripts/init-notion-oauth.sh`
- Manually configure .env

**New Process (Multi-Tenant):**
1. Add tenant to `gateway/config/tenants.json`
2. Initiate OAuth via API: `POST /oauth/authorize/notion?tenant_id=NEW_TENANT`
3. User completes OAuth flow
4. Verify: `GET /tenants/NEW_TENANT/integrations/notion`

See: [Multi-Tenant Setup Guide](docs/MULTI_TENANT_SETUP.md)
```

### 4. Clean Up Old Resources

```bash
# Archive old initialization scripts
mkdir -p archive/old-single-tenant-setup
mv vault/scripts/init-notion-oauth.sh.old archive/old-single-tenant-setup/
mv vault/configs/archive/notion-oauth-config.json archive/old-single-tenant-setup/

# Update .gitignore
echo "gateway/config/tenants.*.json" >> .gitignore
echo "!gateway/config/tenants.example.json" >> .gitignore

# Commit cleanup
git add -A
git commit -m "chore: complete migration to multi-tenant setup

- Archive old single-tenant scripts
- Update configuration structure
- Add multi-tenant documentation

Ref: MIGRATION_SINGLE_TO_MULTI_TENANT.md"
```

---

## Troubleshooting

### Issue: Tenant Configuration Not Loading

**Symptoms:**
- Gateway starts but no tenants found
- Error: "No tenant configuration loaded"

**Solutions:**

```bash
# 1. Verify config file exists
ls -la gateway/config/tenants.json

# 2. Check JSON syntax
jq empty gateway/config/tenants.json

# 3. Verify environment variable set
docker-compose exec gateway env | grep TENANT_CONFIG

# 4. Check file permissions
chmod 644 gateway/config/tenants.json

# 5. Check Docker volume mount
docker-compose exec gateway ls -la /app/config/
```

### Issue: Credentials Not Found After Migration

**Symptoms:**
- Error: "CredentialNotFoundError: Credentials not found for tenant/integration"

**Solutions:**

```bash
# 1. Verify Vault path correct
vault kv get secret/tenants/test-tenant-001/notion

# 2. Check Vault path in config matches
jq '.tenants[] | select(.id=="test-tenant-001") | .integrations[] | .credentials.vaultPath' gateway/config/tenants.json

# 3. Check encryption key exists
vault read transit/keys/test-tenant-001

# 4. Test decryption manually
vault kv get -format=json secret/tenants/test-tenant-001/notion | \
  jq -r '.data.data.access_token' | \
  vault write -field=plaintext transit/decrypt/test-tenant-001 ciphertext=- | \
  base64 -d
```

### Issue: OAuth Flow Not Working for New Tenants

**Symptoms:**
- OAuth redirect fails
- Error: "OAuth configuration missing"

**Solutions:**

```bash
# 1. Verify OAuth credentials set
docker-compose exec gateway env | grep NOTION_CLIENT

# 2. Check redirect URI matches
echo $NOTION_REDIRECT_URI
# Should be: http://localhost:3000/oauth/callback/notion

# 3. Verify Notion OAuth config in Notion Developer Portal
# - Redirect URI must match exactly
# - Client ID and secret must be correct

# 4. Test OAuth flow manually
curl -v "http://localhost:3000/oauth/authorize/notion?tenant_id=test-new"
```

### Issue: Performance Degradation After Migration

**Symptoms:**
- Slow response times
- High Vault latency

**Solutions:**

```bash
# 1. Check Vault performance
vault status

# 2. Monitor Vault logs
docker-compose logs vault | grep -i "slow\|error\|timeout"

# 3. Check encryption key count
vault list transit/keys | wc -l

# 4. Enable Vault caching (if not enabled)
# In Vault config:
# cache {
#   size = 1000
# }

# 5. Monitor gateway logs
docker-compose logs gateway | grep "latency"
```

---

## Summary

**Before Migration:**
- Single tenant: `test-tenant-001`
- Single integration: Notion
- Hardcoded paths and configuration

**After Migration:**
- Multi-tenant capable
- Configurable tenants via JSON
- API-driven tenant management
- Backward compatible with existing setup

**Next Steps:**
1. Add more integrations (GitHub, Slack, etc.)
2. Implement tenant management UI
3. Set up monitoring and alerting
4. Document team processes

---

## Frequently Asked Questions

**Q: Do I need to re-authorize Notion after migration?**
A: No, existing credentials are migrated automatically.

**Q: Can I still use single-tenant mode?**
A: Yes, create one tenant in `tenants.json` and use it as default.

**Q: What happens to old init scripts?**
A: They are deprecated but archived for reference.

**Q: Is there any downtime during migration?**
A: Minimal (5-10 minutes for Vault restructuring).

**Q: Can I roll back if something goes wrong?**
A: Yes, follow the [Rollback Plan](#rollback-plan) section.

**Q: How do I add more integrations?**
A: See [Multi-Tenant Setup Guide](MULTI_TENANT_SETUP.md) - Adding Integrations section.

---

## Resources

- [Multi-Tenant Setup Guide](MULTI_TENANT_SETUP.md)
- [API Documentation](API_TENANT_OAUTH.md)
- [Original Notion Setup](integrations/NOTION_SETUP.md)
- [Vault Documentation](https://developer.hashicorp.com/vault/docs)

---

## Support

If you encounter issues during migration:

1. Check [Troubleshooting](#troubleshooting) section
2. Review gateway logs: `docker-compose logs gateway`
3. Check Vault logs: `docker-compose logs vault`
4. Open GitHub issue with migration logs
5. Contact support team

---

**Migration completed successfully?** Update this document with any lessons learned or edge cases encountered during your migration.
