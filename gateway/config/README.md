# Gateway Configuration

This directory contains configuration files for the Connectors Platform gateway.

## Files

### `tenants.example.json`

Example multi-tenant configuration file showing how to configure multiple tenants with different OAuth integrations.

**Usage:**

```bash
# Copy example to actual config
cp tenants.example.json tenants.json

# Edit with your tenant configuration
nano tenants.json

# Store credentials in Vault for each tenant
vault kv put secret/tenant-001/notion \
  access_token="your_token" \
  token_type="bearer"

# Start gateway (loads tenants.json automatically)
npm run dev
```

### `tenants.schema.json`

JSON Schema for validating tenant configuration files. Use this with your IDE for auto-completion and validation.

**VS Code Setup:**

Add to `.vscode/settings.json`:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["tenants.*.json"],
      "url": "./gateway/config/tenants.schema.json"
    }
  ]
}
```

## Environment-Specific Configurations

For different environments, create separate configuration files:

```
config/
├── tenants.development.json   # Local development
├── tenants.staging.json        # Staging environment
├── tenants.production.json     # Production environment
└── tenants.test.json          # Testing/CI
```

Load the appropriate file based on `NODE_ENV`:

```bash
NODE_ENV=production npm start
# Loads config/tenants.production.json
```

## Security Notes

**DO NOT:**
- Store actual credentials (tokens, secrets) in this file
- Commit files with real tenant data to version control
- Share configuration files containing Vault paths

**DO:**
- Use Vault for all credential storage
- Use environment variables for sensitive config
- Add `tenants.*.json` (except `.example`) to `.gitignore`
- Validate configuration with schema before deployment

## Configuration Options

### Tenant-Level Settings

```json
{
  "id": "tenant-001",              // Unique identifier
  "name": "Acme Corp",             // Display name
  "enabled": true,                 // Active status
  "metadata": {                    // Custom metadata
    "plan": "enterprise",
    "region": "us-west-2"
  },
  "quotas": {                      // Usage limits
    "maxApiCalls": 100000,
    "rateLimitPerSecond": 10
  }
}
```

### Integration-Level Settings

```json
{
  "name": "notion",                // Integration name
  "enabled": true,                 // Active for this tenant
  "credentials": {
    "source": "vault",             // Always use "vault"
    "vaultPath": "secret/data/tenant-001/notion"
  },
  "config": {                      // Integration-specific
    "autoRefresh": true,
    "scopes": ["read", "write"]
  }
}
```

## Credential Management

Credentials are **never** stored in configuration files. They are always stored in HashiCorp Vault:

```bash
# Store Notion credentials
vault kv put secret/tenant-001/notion \
  access_token="secret_abc..." \
  token_type="bearer" \
  bot_id="bot-123" \
  workspace_id="ws-456"

# Store GitHub credentials (with refresh token)
vault kv put secret/tenant-001/github \
  access_token="ghp_..." \
  refresh_token="ghr_..." \
  expires_at="2025-11-12T12:00:00Z" \
  token_type="bearer"

# Verify credentials stored
vault kv get secret/tenant-001/notion
```

## Loading Configuration

The gateway loads tenant configuration on startup:

```typescript
// gateway/src/config/tenant-loader.ts
import { loadTenantConfig } from './config/tenant-loader';

const configPath = process.env.TENANT_CONFIG_PATH || 'config/tenants.json';
const tenants = await loadTenantConfig(configPath);

// Initialize tenants
for (const tenant of tenants) {
  await initializeTenant(tenant);
}
```

## Dynamic Configuration Updates

To update configuration without restarting:

```bash
# Update Vault credentials (takes effect immediately)
vault kv put secret/tenant-001/notion access_token="new_token"

# Add new tenant via API (no restart needed)
curl -X POST http://localhost:3000/tenants \
  -d '{"tenantId": "tenant-new", "name": "New Tenant"}'

# Reload configuration file (requires implementation)
curl -X POST http://localhost:3000/admin/config/reload
```

## Validation

Validate your configuration before deployment:

```bash
# Install JSON schema validator
npm install -g ajv-cli

# Validate configuration
ajv validate -s config/tenants.schema.json -d config/tenants.json

# Or use Node.js
node scripts/validate-config.js config/tenants.json
```

## Migration from Single to Multi-Tenant

If migrating from single-tenant setup:

1. Create `tenants.json` with existing configuration:

```json
{
  "tenants": [
    {
      "id": "default-tenant",
      "name": "Default Tenant",
      "integrations": [
        {
          "name": "notion",
          "credentials": {
            "source": "vault",
            "vaultPath": "secret/data/default-tenant/notion"
          }
        }
      ]
    }
  ]
}
```

2. Move existing Vault credentials:

```bash
# If credentials were at: secret/notion
# Move to: secret/default-tenant/notion
vault kv get -format=json secret/notion | \
  jq '.data.data' | \
  vault kv put secret/default-tenant/notion -
```

3. Update application code to use `tenantId`:

```typescript
// Before
const result = await invoke('notion.createPage', params);

// After
const result = await invoke('notion.createPage', params, {
  tenantId: 'default-tenant'
});
```

See [MIGRATION_SINGLE_TO_MULTI_TENANT.md](../../docs/MIGRATION_SINGLE_TO_MULTI_TENANT.md) for complete guide.

## Troubleshooting

### Configuration Not Loading

```bash
# Check file path
ls -la gateway/config/tenants.json

# Check JSON syntax
jq empty gateway/config/tenants.json

# Check gateway logs
docker logs gateway | grep "tenant"
```

### Credentials Not Found

```bash
# Verify Vault path matches config
vault kv get secret/tenant-001/notion

# Check encryption key exists
vault read transit/keys/tenant-001

# Test credential retrieval
curl http://localhost:3000/tenants/tenant-001/integrations/notion
```

### Schema Validation Errors

```bash
# Validate against schema
ajv validate -s config/tenants.schema.json -d config/tenants.json

# Common issues:
# - Invalid tenant ID format (must be lowercase with hyphens)
# - Missing required fields (id, name, integrations)
# - Invalid integration name (must be from predefined list)
# - Invalid source (must be "vault" in production)
```

## References

- [Multi-Tenant Setup Guide](../../docs/MULTI_TENANT_SETUP.md)
- [API Documentation](../../docs/API_TENANT_OAUTH.md)
- [Migration Guide](../../docs/MIGRATION_SINGLE_TO_MULTI_TENANT.md)
- [Vault Documentation](https://developer.hashicorp.com/vault/docs)
