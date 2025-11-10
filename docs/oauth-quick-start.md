# OAuth Quick Start Guide

## Get Started in 5 Minutes

### 1. Start Vault

```bash
cd /home/user/Connectors/vault
docker-compose -f docker-compose.vault.yml up -d
```

### 2. Verify Vault is Running

```bash
# Check status
docker ps | grep vault

# Check health
curl http://localhost:8200/v1/sys/health
```

### 3. Initialize Vault (automatic)

The `vault-init` service automatically configures:
- KV v2 secrets engine at `secret/`
- Transit encryption engine at `transit/`
- OAuth management policy
- Audit logging

### 4. Use in Your Code

```typescript
import { VaultClient } from './gateway/src/auth/vault-client';
import { OAuthProxy } from './gateway/src/auth/oauth-proxy';

// Initialize
const vault = new VaultClient({
  address: 'http://localhost:8200',
  token: 'dev-root-token'
});

const proxy = new OAuthProxy(vault, 'http://localhost:3000');
proxy.start();

// Store OAuth credentials
await proxy.storeInitialCredentials('tenant-123', 'github', {
  access_token: 'gho_...',
  refresh_token: 'ghr_...',
  expires_in: 3600,
  token_type: 'Bearer'
});

// Make authenticated requests
const response = await proxy.proxyRequest({
  tenantId: 'tenant-123',
  integration: 'github',
  method: 'GET',
  path: '/user'
});
```

### 5. View Audit Logs

```bash
docker exec connectors-vault cat /vault/logs/audit.log
```

## Architecture

```
Client Request
     ↓
OAuthProxy (gets credentials from Vault)
     ↓
VaultClient (decrypts with tenant key)
     ↓
MCP Server (with OAuth header injected)
```

## Key Features

✅ **Per-tenant encryption** - Each tenant has unique encryption key
✅ **Auto-refresh** - Tokens refresh 5 minutes before expiry
✅ **Versioning** - KV v2 keeps credential history
✅ **Audit logging** - All access logged
✅ **Error handling** - Graceful degradation on failures

## Next Steps

- Read full documentation: `/docs/oauth-implementation-guide.md`
- See examples: `/examples/oauth-usage-example.ts`
- Run tests: `cd gateway && npm test`
