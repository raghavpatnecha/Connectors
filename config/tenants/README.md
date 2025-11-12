# Tenant OAuth Configuration Files

This directory contains YAML configuration files for multi-tenant OAuth setup.

## Overview

Each tenant configuration file defines OAuth credentials for multiple integrations (Notion, GitHub, Slack, Linear, etc.) with environment variable substitution support.

## File Format

```yaml
tenant_id: example-tenant-001
tenant_name: Example Corporation
environment: production

integrations:
  notion:
    client_id: "${NOTION_CLIENT_ID}"
    client_secret: "${NOTION_CLIENT_SECRET}"
    redirect_uri: "https://app.example.com/oauth/callback/notion"
    enabled: true

  github:
    client_id: "${GITHUB_CLIENT_ID}"
    client_secret: "${GITHUB_CLIENT_SECRET}"
    redirect_uri: "https://app.example.com/oauth/callback/github"
    scopes: ["repo", "user"]
    enabled: true

vault_config:
  enable_auto_rotate: true
  rotation_interval_days: 90

metadata:
  created_by: platform-admin
  contact_email: devops@example.com
```

## Environment Variable Substitution

Credentials use `${VAR}` syntax for environment variable substitution:

```bash
export NOTION_CLIENT_ID="your_client_id"
export NOTION_CLIENT_SECRET="your_client_secret"
export GITHUB_CLIENT_ID="your_github_client_id"
export GITHUB_CLIENT_SECRET="your_github_client_secret"
```

**Security Best Practices:**
- ✅ Always use environment variable substitution
- ✅ Store credentials in CI/CD secrets or `.env` files (gitignored)
- ❌ NEVER commit actual credentials to git
- ❌ NEVER hardcode secrets in YAML files

## Usage

### Initialize Single Tenant

```bash
# 1. Set environment variables
export NOTION_CLIENT_ID="..."
export NOTION_CLIENT_SECRET="..."
export GITHUB_CLIENT_ID="..."
export GITHUB_CLIENT_SECRET="..."

# 2. Run init script
cd /home/user/Connectors
./vault/scripts/init-tenant-oauth.sh \
  --tenant example-tenant-001 \
  --config config/tenants/example-tenant.yaml
```

### Initialize All Tenants

Process all YAML files in this directory:

```bash
./vault/scripts/init-tenant-oauth.sh --all
```

### Validate Tenant Configuration

```bash
# Validate specific tenant
./vault/scripts/validate-tenant-oauth.sh --tenant example-tenant-001

# Validate all tenants
./vault/scripts/validate-tenant-oauth.sh --all

# Validate with detailed output
./vault/scripts/validate-tenant-oauth.sh \
  --tenant example-tenant-001 \
  --verbose \
  --check-decrypt
```

## Example Configurations

### `example-tenant.yaml`
Full multi-integration setup with Notion, GitHub, Slack, and Linear.

### `example-notion.yaml`
Simplified single-integration setup for Notion only (migrated from old JSON config).

## Schema Validation

All configuration files are validated against the JSON Schema:
```
config/schemas/tenant-oauth-config.schema.json
```

The schema enforces:
- Required fields (tenant_id, integrations)
- Valid tenant_id format (lowercase alphanumeric with hyphens)
- Valid redirect_uri format (must start with http:// or https://)
- Valid environment values (development, staging, production)
- Integration-specific validations

## Creating New Tenant Configs

1. **Copy example file:**
   ```bash
   cp config/tenants/example-tenant.yaml config/tenants/my-tenant.yaml
   ```

2. **Edit configuration:**
   ```yaml
   tenant_id: my-tenant-001  # Unique tenant ID
   tenant_name: My Company
   environment: production

   integrations:
     notion:
       client_id: "${MY_NOTION_CLIENT_ID}"
       client_secret: "${MY_NOTION_CLIENT_SECRET}"
       redirect_uri: "https://myapp.com/oauth/callback/notion"
       enabled: true
   ```

3. **Set environment variables:**
   ```bash
   export MY_NOTION_CLIENT_ID="..."
   export MY_NOTION_CLIENT_SECRET="..."
   ```

4. **Initialize in Vault:**
   ```bash
   ./vault/scripts/init-tenant-oauth.sh \
     --tenant my-tenant-001 \
     --config config/tenants/my-tenant.yaml
   ```

5. **Validate:**
   ```bash
   ./vault/scripts/validate-tenant-oauth.sh --tenant my-tenant-001
   ```

## Supported Integrations

The following OAuth providers are supported:

| Integration | Scopes Support | Notes |
|-------------|----------------|-------|
| **notion** | ❌ No | Notion uses capability-based permissions |
| **github** | ✅ Yes | repo, user, write:repo_hook, etc. |
| **slack** | ✅ Yes | chat:write, channels:read, users:read, etc. |
| **linear** | ✅ Yes | read, write |
| **gitlab** | ✅ Yes | api, read_user, write_repository, etc. |
| **jira** | ✅ Yes | read:jira-work, write:jira-work, etc. |

## Vault Storage Structure

Credentials are stored in Vault with the following structure:

```
secret/tenants/{tenant_id}/{integration}
  ├── client_id (plaintext)
  ├── client_secret (encrypted with Transit)
  ├── redirect_uri
  ├── scopes (JSON array)
  ├── created_at
  └── updated_at

transit/keys/{integration}-{tenant_id}
  └── Encryption key (AES256-GCM96)
```

## Troubleshooting

### Missing Environment Variables

**Error:**
```
Missing environment variables:
  - NOTION_CLIENT_ID
  - NOTION_CLIENT_SECRET
```

**Solution:**
Export the required environment variables before running the init script.

### Invalid YAML Syntax

**Error:**
```
[ERROR] Invalid YAML syntax in config file
```

**Solution:**
Validate YAML syntax using `yq`:
```bash
yq eval '.' config/tenants/my-tenant.yaml
```

### Vault Authentication Failed

**Error:**
```
[ERROR] Not authenticated to Vault
```

**Solution:**
Set VAULT_TOKEN or login:
```bash
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='your-token'
# or
vault login
```

### Schema Validation Errors

**Error:**
```
[ERROR] Invalid tenant_id format
```

**Solution:**
Ensure tenant_id matches pattern: `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`
- Lowercase letters and numbers only
- Hyphens allowed (not at start/end)
- 3-63 characters

## Related Files

- **JSON Schema:** `config/schemas/tenant-oauth-config.schema.json`
- **Init Script:** `vault/scripts/init-tenant-oauth.sh`
- **Validation Script:** `vault/scripts/validate-tenant-oauth.sh`
- **TypeScript Parser:** `gateway/src/config/tenant-oauth-parser.ts`
- **Deprecated Script:** `vault/scripts/init-notion-oauth.sh` (use init-tenant-oauth.sh)

## Migration from Old Scripts

If you're migrating from the old `init-notion-oauth.sh` script:

1. **Old format** (vault/configs/notion-oauth-config.json):
   ```json
   {
     "oauth": {
       "provider": "notion",
       "endpoints": { ... }
     }
   }
   ```

2. **New format** (config/tenants/my-tenant.yaml):
   ```yaml
   tenant_id: my-tenant-001
   integrations:
     notion:
       client_id: "${NOTION_CLIENT_ID}"
       client_secret: "${NOTION_CLIENT_SECRET}"
       redirect_uri: "https://..."
   ```

3. **Run migration:**
   ```bash
   ./vault/scripts/init-tenant-oauth.sh \
     --tenant my-tenant-001 \
     --config config/tenants/example-notion.yaml
   ```

## Development

### Testing Configuration Locally

```bash
# Dry run (no changes to Vault)
./vault/scripts/init-tenant-oauth.sh \
  --tenant test-tenant-001 \
  --config config/tenants/example-tenant.yaml \
  --dry-run
```

### TypeScript Parser Testing

```typescript
import { TenantOAuthParser } from './gateway/src/config/tenant-oauth-parser';

const parser = new TenantOAuthParser();
const result = await parser.parse('config/tenants/example-tenant.yaml');

if (result.success) {
  console.log('Valid config:', result.config);
} else {
  console.error('Errors:', result.errors);
  console.error('Missing credentials:', result.missingCredentials);
}
```

## Support

For issues or questions:
- Check schema validation: `config/schemas/tenant-oauth-config.schema.json`
- Run validation: `./vault/scripts/validate-tenant-oauth.sh --all`
- Review logs in Vault: `vault audit list`
- Contact: Platform DevOps Team
