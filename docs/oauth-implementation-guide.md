# OAuth Implementation Guide

## HashiCorp Vault Integration for OAuth Credential Management

This guide explains how the Connectors Platform uses HashiCorp Vault to securely manage OAuth credentials with per-tenant encryption and automatic token refresh.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Agent / Client                       │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ MCP Request
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       OAuth Proxy                            │
│  - Retrieves credentials from Vault                          │
│  - Injects Authorization header                              │
│  - Handles 401 with auto-refresh                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
┌─────────────────┐ ┌─────────────┐ ┌──────────────────┐
│  VaultClient    │ │  Refresh    │ │  MCP Server      │
│                 │ │  Scheduler  │ │  (GitHub/Slack)  │
│ - Encryption    │ │             │ │                  │
│ - Storage       │ │ - Auto      │ │                  │
│ - Retrieval     │ │   refresh   │ │                  │
└────────┬────────┘ └──────┬──────┘ └──────────────────┘
         │                 │
         ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│              HashiCorp Vault                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Transit Engine      │  │  KV v2 Engine        │        │
│  │  (Encryption)        │  │  (Credential Storage) │        │
│  │                      │  │                       │        │
│  │ /transit/keys/       │  │ /secret/data/        │        │
│  │   tenant-123         │  │   tenant-123/github  │        │
│  │   tenant-456         │  │   tenant-123/slack   │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Features

### 1. Per-Tenant Encryption

Each tenant has their own encryption key in Vault's Transit engine:

```typescript
// Encryption key path: transit/keys/{tenantId}
// Example: transit/keys/tenant-123

// Encrypt access token
POST /v1/transit/encrypt/tenant-123
{
  "plaintext": "base64-encoded-token"
}

// Response
{
  "data": {
    "ciphertext": "vault:v1:encrypted-data-here..."
  }
}
```

### 2. Versioned Storage

Credentials stored in KV v2 with full version history:

```typescript
// Storage path: secret/data/{tenantId}/{integration}
// Example: secret/data/tenant-123/github

{
  "data": {
    "accessToken": "vault:v1:encrypted...",
    "refreshToken": "vault:v1:encrypted...",
    "expiresAt": "2025-12-31T23:59:59Z",
    "scopes": ["repo", "user"],
    "tokenType": "Bearer"
  },
  "metadata": {
    "createdAt": "2025-11-08T12:00:00Z",
    "updatedAt": "2025-11-08T12:00:00Z",
    "createdBy": "oauth-proxy",
    "integration": "github",
    "autoRefresh": true,
    "refreshCount": 0
  }
}
```

### 3. Auto-Refresh

Tokens automatically refreshed 5 minutes before expiry:

```typescript
// Scheduled refresh timeline
Token expires: 2025-11-08 13:00:00
Refresh scheduled: 2025-11-08 12:55:00 (5 min buffer)

// Refresh process
1. Get current credentials from Vault
2. Call OAuth provider's refresh endpoint
3. Store new credentials (encrypted)
4. Schedule next refresh
```

---

## Quick Start

### 1. Start Vault

```bash
cd /home/user/Connectors/vault
docker-compose -f docker-compose.vault.yml up -d
```

### 2. Initialize Vault

```bash
# Wait for Vault to be healthy
docker-compose -f docker-compose.vault.yml ps

# Initialize (automatically done by vault-init service)
# Or manually:
docker exec connectors-vault sh /vault/scripts/init-vault.sh
```

### 3. Verify Setup

```bash
# Check Vault status
docker exec connectors-vault vault status

# List secrets engines
docker exec connectors-vault vault secrets list

# View OAuth policy
docker exec connectors-vault vault policy read oauth-policy
```

---

## Usage Examples

### Store OAuth Credentials

```typescript
import { VaultClient } from './gateway/src/auth/vault-client';
import { OAuthCredentials } from './gateway/src/auth/types';

// Initialize Vault client
const vault = new VaultClient({
  address: 'http://localhost:8200',
  token: 'dev-root-token'
});

// Store credentials
const credentials: OAuthCredentials = {
  accessToken: 'gho_abc123...',
  refreshToken: 'ghr_xyz789...',
  expiresAt: new Date(Date.now() + 3600000), // 1 hour
  scopes: ['repo', 'user'],
  tokenType: 'Bearer',
  integration: 'github'
};

await vault.storeCredentials('tenant-123', 'github', credentials);
```

### Retrieve Credentials

```typescript
// Get credentials (automatically decrypted)
const creds = await vault.getCredentials('tenant-123', 'github');

console.log(creds.accessToken); // Decrypted: "gho_abc123..."
console.log(creds.expiresAt); // Date object
```

### Use OAuth Proxy

```typescript
import { OAuthProxy } from './gateway/src/auth/oauth-proxy';

// Initialize OAuth proxy
const proxy = new OAuthProxy(
  vault,
  'http://mcp-servers:3000',
  new Map([
    ['github', {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
      authEndpoint: 'https://github.com/login/oauth/authorize'
    }]
  ])
);

// Start auto-refresh scheduler
proxy.start();

// Make MCP request with automatic OAuth injection
const response = await proxy.proxyRequest({
  tenantId: 'tenant-123',
  integration: 'github',
  method: 'POST',
  path: '/repos/owner/repo/pulls',
  body: {
    title: 'New Feature',
    head: 'feature-branch',
    base: 'main'
  }
});

// Response includes PR data
console.log(response.data.number); // PR #123
```

### Handle OAuth Flow

```typescript
// After user completes OAuth flow
const tokenResponse = {
  access_token: 'gho_new_token',
  refresh_token: 'ghr_new_refresh',
  expires_in: 3600,
  token_type: 'Bearer',
  scope: 'repo user'
};

// Store and schedule refresh
await proxy.storeInitialCredentials(
  'tenant-123',
  'github',
  tokenResponse
);

// Credentials now:
// - Stored in Vault (encrypted)
// - Refresh scheduled for 12:55 (if expires at 13:00)
```

---

## Error Handling

### Token Expired

```typescript
try {
  await proxy.proxyRequest(request);
} catch (error) {
  if (error instanceof TokenExpiredError) {
    console.log(`Token expired at ${error.expiredAt}`);
    // Redirect user to re-authenticate
  }
}
```

### Rate Limit

```typescript
try {
  await proxy.proxyRequest(request);
} catch (error) {
  if (error instanceof RateLimitError) {
    const waitMs = error.getWaitTimeMs();
    console.log(`Rate limited, retry after ${waitMs}ms`);
  }
}
```

### Credential Not Found

```typescript
try {
  await vault.getCredentials('tenant-123', 'unknown');
} catch (error) {
  if (error instanceof CredentialNotFoundError) {
    console.log('User needs to connect integration');
    // Redirect to OAuth flow
  }
}
```

---

## Monitoring

### Audit Logs

```bash
# View audit logs
docker exec connectors-vault cat /vault/logs/audit.log | tail -n 50

# Watch in real-time
docker exec connectors-vault tail -f /vault/logs/audit.log
```

### Refresh Events

```typescript
// Listen to refresh scheduler events
scheduler.on('refresh-success', ({ tenantId, integration, expiresAt }) => {
  console.log(`Token refreshed: ${tenantId}/${integration}, expires ${expiresAt}`);
});

scheduler.on('refresh-failed', ({ tenantId, integration, error }) => {
  console.error(`Refresh failed: ${tenantId}/${integration}`, error);
  // Alert admin or user
});

scheduler.on('refresh-retry', ({ tenantId, integration, retryCount }) => {
  console.warn(`Retrying refresh: ${tenantId}/${integration} (attempt ${retryCount})`);
});
```

### Health Check

```typescript
// Check Vault connectivity
const isHealthy = await vault.healthCheck();

if (!isHealthy) {
  console.error('Vault unavailable - using fallback');
  // Graceful degradation
}
```

---

## Production Deployment

### Environment Variables

```bash
# Gateway environment
VAULT_ADDR=https://vault.production.com:8200
VAULT_TOKEN=s.xyz...  # Use app role in production
VAULT_TRANSIT_ENGINE=transit
VAULT_KV_ENGINE=secret
VAULT_TIMEOUT=5000
VAULT_MAX_RETRIES=3

# OAuth configs
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
```

### Production Vault Config

```hcl
# vault/config.hcl (production)
storage "consul" {
  address = "consul:8500"
  path    = "vault/"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_cert_file = "/vault/certs/vault.crt"
  tls_key_file  = "/vault/certs/vault.key"
}

seal "awskms" {
  region = "us-east-1"
  kms_key_id = "alias/vault-unseal"
}

telemetry {
  prometheus_retention_time = "30s"
  disable_hostname = false
}

ui = true
```

### Kubernetes Deployment

```yaml
# k8s/vault-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vault
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: vault
        image: hashicorp/vault:1.15
        env:
        - name: VAULT_ADDR
          value: "https://0.0.0.0:8200"
        volumeMounts:
        - name: vault-config
          mountPath: /vault/config
        - name: vault-certs
          mountPath: /vault/certs
          readOnly: true
```

---

## Security Best Practices

1. **Never commit secrets**
   - Use environment variables
   - Use Kubernetes secrets
   - Rotate tokens regularly

2. **Use AppRole auth in production**
   ```bash
   vault auth enable approle
   vault write auth/approle/role/gateway \
     token_policies="oauth-policy" \
     token_ttl=1h \
     token_max_ttl=4h
   ```

3. **Enable TLS**
   - Always use HTTPS for Vault
   - Validate certificates
   - Use mutual TLS if possible

4. **Monitor audit logs**
   - Alert on failed auth attempts
   - Track credential access patterns
   - Detect anomalies

5. **Implement rate limiting**
   - Limit Vault API calls per tenant
   - Prevent brute force attacks
   - Use backoff for retries

---

## Troubleshooting

### Vault Connection Failed

```bash
# Check Vault status
docker exec connectors-vault vault status

# Check network
docker network inspect connectors-network

# View Vault logs
docker logs connectors-vault
```

### Encryption Failed

```bash
# Check transit engine
docker exec connectors-vault vault secrets list

# Verify encryption key exists
docker exec connectors-vault vault read transit/keys/tenant-123

# Test encryption manually
docker exec connectors-vault vault write transit/encrypt/tenant-123 \
  plaintext=$(echo -n "test" | base64)
```

### Credentials Not Found

```bash
# List all secrets for tenant
docker exec connectors-vault vault kv list secret/tenant-123

# Read specific credential
docker exec connectors-vault vault kv get secret/tenant-123/github

# Check policy permissions
docker exec connectors-vault vault policy read oauth-policy
```

---

## Testing

Run the test suite:

```bash
cd /home/user/Connectors/gateway

# Install dependencies
npm install

# Run OAuth tests
npm test -- tests/auth/vault-client.test.ts
npm test -- tests/auth/oauth-proxy.test.ts

# Run all tests with coverage
npm test -- --coverage
```

---

## Next Steps

1. **Implement OAuth Flow UI**
   - Create OAuth callback handler
   - Build tenant settings page
   - Add integration management

2. **Add More Integrations**
   - Register OAuth configs for Slack, JIRA, etc.
   - Generate MCP servers for each
   - Test end-to-end flows

3. **Production Hardening**
   - Set up Vault HA cluster
   - Configure auto-unsealing
   - Implement disaster recovery

4. **Monitoring & Alerting**
   - Set up Prometheus metrics
   - Create Grafana dashboards
   - Configure alerts for failures

---

## References

- [HashiCorp Vault Documentation](https://www.vaultproject.io/docs)
- [Vault Transit Secrets Engine](https://www.vaultproject.io/docs/secrets/transit)
- [Vault KV v2 Secrets Engine](https://www.vaultproject.io/docs/secrets/kv/kv-v2)
- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)
- [MCP Specification](https://spec.modelcontextprotocol.io)
