# Multi-Tenant Setup Guide

Configure Connectors for multi-tenant deployments where each tenant has isolated resources, credentials, and configurations.

## Overview

Multi-tenancy in Connectors provides:

- **Tenant Isolation**: Separate credentials, quotas, and configurations per tenant
- **Shared Infrastructure**: Single gateway serves multiple tenants efficiently
- **Per-Tenant OAuth**: Encrypted credentials in HashiCorp Vault with tenant-specific keys
- **Rate Limiting**: Per-tenant rate limits and quotas
- **Custom Deployments**: Tenants can deploy private MCP servers
- **Audit Logging**: Track all actions per tenant

## Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Tenant A   │  │  Tenant B   │  │  Tenant C   │
│  API Key A  │  │  API Key B  │  │  API Key C  │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │  Connectors      │
              │  Gateway         │
              │  (Multi-Tenant)  │
              └────────┬─────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│  Vault     │  │  Neo4j     │  │  Redis     │
│  (Tenant   │  │  (Shared   │  │  (Tenant   │
│   Keys)    │  │   Graph)   │  │   Cache)   │
└────────────┘  └────────────┘  └────────────┘
```

## Configuration

### Gateway Configuration

Edit `gateway/config/multi-tenant.yaml`:

```yaml
multiTenant:
  enabled: true

  # Tenant identification
  tenantIdHeader: 'X-Tenant-ID'
  fallbackTenantId: 'default'

  # Authentication
  requireApiKey: true
  apiKeyHeader: 'Authorization'

  # Per-tenant limits
  rateLimits:
    requestsPerMinute: 1000
    requestsPerHour: 50000
    requestsPerDay: 1000000

  # Per-tenant quotas
  quotas:
    maxCustomServers: 10
    maxToolInvocations: 100000
    maxStorageMB: 1000

  # Tenant isolation
  isolation:
    separateVaultKeys: true
    separateRedisNamespace: true
    separateLogs: true
```

### Environment Variables

```bash
# .env
MULTI_TENANT_ENABLED=true
TENANT_ID_HEADER=X-Tenant-ID
API_KEY_HEADER=Authorization

# Vault configuration
VAULT_ADDR=http://vault:8200
VAULT_TOKEN=your-vault-token
VAULT_TENANT_PREFIX=connectors/tenants

# Redis configuration
REDIS_URL=redis://redis:6379
REDIS_TENANT_PREFIX=tenant

# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STORE=redis
```

## Tenant Management

### Creating Tenants

```typescript
// Admin API
import { AdminAPI } from '@connectors/gateway';

const admin = new AdminAPI({
  baseURL: 'http://localhost:3000',
  adminKey: process.env.ADMIN_API_KEY
});

// Create tenant
const tenant = await admin.tenants.create({
  id: 'acme-corp',
  name: 'ACME Corporation',
  email: 'admin@acme.com',
  plan: 'enterprise',
  limits: {
    requestsPerMinute: 2000,
    maxCustomServers: 20
  }
});

console.log('Tenant created:', tenant.id);
console.log('API Key:', tenant.apiKey);
```

### Tenant Configuration

```typescript
// Update tenant
await admin.tenants.update('acme-corp', {
  limits: {
    requestsPerMinute: 5000,
    maxCustomServers: 50
  },
  features: {
    customServers: true,
    oauth: true,
    advancedAnalytics: true
  }
});

// Get tenant info
const tenant = await admin.tenants.get('acme-corp');
console.log('Plan:', tenant.plan);
console.log('Usage:', tenant.usage);

// List all tenants
const tenants = await admin.tenants.list();
console.log(`Total tenants: ${tenants.length}`);
```

## SDK Usage (Tenant Perspective)

### TypeScript SDK

```typescript
import { Connectors } from '@connectors/sdk';

// Initialize with tenant ID and API key
const connectors = new Connectors({
  baseURL: 'https://api.connectors.com',
  tenantId: 'acme-corp',
  apiKey: 'acme-corp-api-key'
});

// All operations are scoped to this tenant
const tools = await connectors.tools.select('query');

// Custom server deployment (tenant-isolated)
const deployment = await connectors.mcp.add({
  name: 'acme-custom-server',
  source: { type: 'github', url: 'https://github.com/acme/mcp-server' },
  category: 'custom'
});
```

### Python SDK

```python
from connectors import Connectors

# Initialize with tenant ID and API key
connectors = Connectors(
    base_url="https://api.connectors.com",
    tenant_id="acme-corp",
    api_key="acme-corp-api-key"
)

# All operations are scoped to this tenant
tools = await connectors.tools.select("query")

# Custom server deployment (tenant-isolated)
deployment = await connectors.mcp.add(
    name="acme-custom-server",
    source={"type": "github", "url": "https://github.com/acme/mcp-server"},
    category="custom"
)
```

### Multi-Tenant Web Application

```typescript
import { Connectors } from '@connectors/sdk';
import express from 'express';

const app = express();

// Middleware to extract tenant ID
app.use((req, res, next) => {
  req.tenantId = req.headers['x-tenant-id'];
  req.apiKey = req.headers['authorization']?.replace('Bearer ', '');
  next();
});

// Create tenant-specific Connectors instance
function getConnectorsForTenant(tenantId: string, apiKey: string): Connectors {
  return new Connectors({
    baseURL: 'https://api.connectors.com',
    tenantId,
    apiKey
  });
}

// API endpoint
app.post('/api/tools/select', async (req, res) => {
  const { tenantId, apiKey } = req;

  if (!tenantId || !apiKey) {
    return res.status(401).json({ error: 'Missing tenant ID or API key' });
  }

  const connectors = getConnectorsForTenant(tenantId, apiKey);

  try {
    const tools = await connectors.tools.select(req.body.query);
    res.json({ tools });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001);
```

## OAuth Management

### Per-Tenant OAuth Credentials

Each tenant stores OAuth credentials separately in Vault:

```
vault/
└── tenants/
    ├── acme-corp/
    │   ├── github/
    │   │   ├── access_token (encrypted)
    │   │   └── refresh_token (encrypted)
    │   └── gmail/
    │       ├── access_token (encrypted)
    │       └── refresh_token (encrypted)
    └── beta-corp/
        ├── github/
        │   ├── access_token (encrypted)
        │   └── refresh_token (encrypted)
        └── gmail/
            ├── access_token (encrypted)
            └── refresh_token (encrypted)
```

### Storing OAuth Credentials

```typescript
// Admin API
await admin.oauth.storeCredentials('acme-corp', 'github', {
  accessToken: 'ghp_...',
  refreshToken: 'ghr_...',
  expiresAt: new Date('2024-12-31'),
  scopes: ['repo', 'user']
});
```

### Auto-Refresh

The gateway automatically refreshes OAuth tokens before expiry:

```typescript
// gateway/src/oauth/auto-refresh.ts
class OAuthRefreshService {
  async scheduleRefresh(tenantId: string, integration: string) {
    const creds = await vault.getCredentials(tenantId, integration);

    // Refresh 5 minutes before expiry
    const refreshTime = new Date(creds.expiresAt.getTime() - 5 * 60 * 1000);

    scheduler.schedule(refreshTime, async () => {
      const refreshed = await this.refreshToken(tenantId, integration);
      await vault.storeCredentials(tenantId, integration, refreshed);
    });
  }
}
```

## Rate Limiting

### Per-Tenant Rate Limits

```typescript
// gateway/src/rate-limiting/tenant-limiter.ts
export class TenantRateLimiter {
  async checkLimit(tenantId: string): Promise<boolean> {
    const key = `rate:${tenantId}:minute`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 60); // 1 minute TTL
    }

    const tenant = await getTenant(tenantId);
    return count <= tenant.limits.requestsPerMinute;
  }
}

// Middleware
app.use(async (req, res, next) => {
  const allowed = await rateLimiter.checkLimit(req.tenantId);

  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: 60
    });
  }

  next();
});
```

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 873
X-RateLimit-Reset: 1640000000
```

## Resource Isolation

### Kubernetes Namespaces

Each tenant's custom MCP servers deploy to separate namespaces:

```yaml
# k8s/tenant-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: tenant-acme-corp
  labels:
    tenant: acme-corp

---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: tenant-quota
  namespace: tenant-acme-corp
spec:
  hard:
    requests.cpu: "10"
    requests.memory: "20Gi"
    persistentvolumeclaims: "10"
    pods: "50"
```

### Deployment Isolation

```typescript
// Deploy to tenant namespace
const deployment = await connectors.mcp.add({
  name: 'acme-custom-server',
  source: { type: 'github', url: '...' },
  category: 'custom'
});

// Deploys to: namespace=tenant-acme-corp
// Service: acme-custom-server.tenant-acme-corp.svc.cluster.local
```

## Monitoring & Analytics

### Per-Tenant Metrics

```typescript
// Admin API
const metrics = await admin.tenants.getMetrics('acme-corp', {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

console.log('Tenant Metrics:');
console.log(`- Total requests: ${metrics.requests.total}`);
console.log(`- Tool invocations: ${metrics.tools.invocations}`);
console.log(`- Custom servers: ${metrics.servers.custom}`);
console.log(`- Token usage: ${metrics.tokens.total}`);
console.log(`- Cost: $${metrics.cost.total}`);
```

### Audit Logging

```typescript
// All actions logged per tenant
{
  "timestamp": "2024-01-15T10:30:00Z",
  "tenantId": "acme-corp",
  "userId": "user-123",
  "action": "tools.invoke",
  "toolId": "github.createPullRequest",
  "params": { "repo": "acme/app" },
  "result": "success",
  "duration": 234
}
```

## Billing Integration

### Usage Tracking

```typescript
// Admin API
const usage = await admin.tenants.getUsage('acme-corp', {
  month: '2024-01'
});

console.log('Usage Report:');
console.log(`- API calls: ${usage.apiCalls} ($${usage.apiCallsCost})`);
console.log(`- Tool invocations: ${usage.toolInvocations} ($${usage.toolInvocationsCost})`);
console.log(`- Custom servers: ${usage.customServers} ($${usage.customServersCost})`);
console.log(`- Total: $${usage.totalCost}`);
```

### Billing Events

```typescript
// Webhook for billing system
app.post('/webhooks/billing', async (req, res) => {
  const { tenantId, month } = req.body;

  const usage = await admin.tenants.getUsage(tenantId, { month });

  // Send to billing system
  await billingSystem.createInvoice({
    tenantId,
    month,
    amount: usage.totalCost,
    lineItems: [
      { description: 'API calls', amount: usage.apiCallsCost },
      { description: 'Tool invocations', amount: usage.toolInvocationsCost },
      { description: 'Custom servers', amount: usage.customServersCost }
    ]
  });

  res.json({ success: true });
});
```

## Security Best Practices

### 1. API Key Rotation

```typescript
// Rotate API key
const newKey = await admin.tenants.rotateApiKey('acme-corp');

console.log('New API key:', newKey);
// Notify tenant to update their configuration
```

### 2. IP Whitelisting

```typescript
// Configure allowed IPs
await admin.tenants.update('acme-corp', {
  security: {
    allowedIPs: ['203.0.113.0/24', '198.51.100.42']
  }
});
```

### 3. Audit All Actions

```typescript
// Log all tenant actions
logger.info('Tenant action', {
  tenantId: req.tenantId,
  userId: req.userId,
  action: req.path,
  params: req.body,
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
```

### 4. Encrypt Tenant Data

```typescript
// All tenant data encrypted at rest
await vault.write(`tenants/${tenantId}/secrets`, {
  data: encryptedData,
  metadata: {
    encrypted: true,
    algorithm: 'AES-256-GCM'
  }
});
```

## Migration from Single-Tenant

### Step 1: Enable Multi-Tenancy

```yaml
# config/multi-tenant.yaml
multiTenant:
  enabled: true
  fallbackTenantId: 'default'  # Existing users go here
```

### Step 2: Create Default Tenant

```typescript
await admin.tenants.create({
  id: 'default',
  name: 'Default Tenant',
  plan: 'enterprise',
  limits: { requestsPerMinute: 10000 }
});
```

### Step 3: Migrate Existing Data

```typescript
// Migrate OAuth credentials
const existingCreds = await vault.read('oauth/github');
await vault.write('tenants/default/oauth/github', existingCreds);

// Migrate custom servers
const existingServers = await k8s.listDeployments('default');
for (const server of existingServers) {
  await k8s.moveDeployment(server, 'tenant-default');
}
```

### Step 4: Update SDK Clients

```typescript
// Before (single-tenant)
const connectors = new Connectors({ baseURL: 'http://localhost:3000' });

// After (multi-tenant)
const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  tenantId: 'default',
  apiKey: 'default-api-key'
});
```

## Next Steps

- **[OAuth Setup](oauth/setup.md)** - Configure OAuth for tenants
- **[Deployment](../deployment/kubernetes.md)** - Deploy to production
- **[Monitoring](monitoring.md)** - Set up monitoring and alerts
- **[API Reference](../05-api-reference/gateway-api.md)** - Admin API documentation

---

**[← Back to Guides](./)**
