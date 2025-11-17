# TypeScript SDK - Connectors Client

The `Connectors` class is the main entry point for the TypeScript SDK. It manages configuration, authentication, and provides access to Tools API and MCP Registry.

## Installation

```bash
npm install @connectors/sdk
```

## Basic Usage

```typescript
import { Connectors } from '@connectors/sdk';

const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  tenantId: 'my-company',
  apiKey: 'your-api-key'
});

// Access Tools API
const tools = await connectors.tools.select('create a PR on GitHub');

// Access MCP Registry
const github = connectors.mcp.get('github');
```

## Constructor

### `new Connectors(config: ConnectorsConfig)`

Creates a new Connectors client instance.

#### Parameters

```typescript
interface ConnectorsConfig {
  baseURL: string;              // Gateway URL (required)
  tenantId?: string;            // Multi-tenant identifier
  apiKey?: string;              // API authentication key
  timeout?: number;             // Request timeout in ms (default: 30000)
  retries?: number;             // Number of retries on failure (default: 3)
  retryDelay?: number;          // Delay between retries in ms (default: 1000)
  logLevel?: 'debug' | 'info' | 'warn' | 'error';  // Log level (default: 'info')
}
```

#### Examples

**Minimal configuration:**
```typescript
const connectors = new Connectors({
  baseURL: 'http://localhost:3000'
});
```

**Production configuration:**
```typescript
const connectors = new Connectors({
  baseURL: 'https://connectors.mycompany.com',
  tenantId: 'prod-tenant',
  apiKey: process.env.CONNECTORS_API_KEY,
  timeout: 60000,
  retries: 5,
  logLevel: 'warn'
});
```

**Multi-tenant configuration:**
```typescript
const connectors = new Connectors({
  baseURL: 'https://api.connectors.com',
  tenantId: 'customer-123',
  apiKey: customer.apiKey
});
```

## Properties

### `tools: ToolsAPI`

Provides access to the Tools API for semantic tool selection and invocation.

```typescript
const tools = await connectors.tools.select('query');
const allTools = await connectors.tools.list();
const result = await connectors.tools.invoke('tool-id', params);
```

[Full Tools API documentation →](tools-api.md)

### `mcp: MCPRegistry`

Provides access to the MCP Registry for managing MCP servers.

```typescript
const github = connectors.mcp.get('github');
const servers = await connectors.mcp.list();
const deployment = await connectors.mcp.add({ ... });
```

[Full MCP Registry documentation →](mcp-registry.md)

## Methods

### `getConfig(): ConnectorsConfig`

Returns the current client configuration.

```typescript
const config = connectors.getConfig();
console.log('Gateway URL:', config.baseURL);
console.log('Tenant ID:', config.tenantId);
```

### `setApiKey(apiKey: string): void`

Updates the API key for authentication.

```typescript
connectors.setApiKey('new-api-key');
```

### `setTenantId(tenantId: string): void`

Updates the tenant ID for multi-tenant scenarios.

```typescript
connectors.setTenantId('new-tenant');
```

### `setTimeout(timeout: number): void`

Updates the request timeout in milliseconds.

```typescript
connectors.setTimeout(60000); // 60 seconds
```

### `setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void`

Updates the logging level.

```typescript
connectors.setLogLevel('debug');
```

### `async health(): Promise<HealthStatus>`

Checks the health status of the gateway.

```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    faiss: boolean;
    neo4j: boolean;
    vault: boolean;
    redis: boolean;
  };
}

const health = await connectors.health();
console.log('Gateway status:', health.status);
console.log('Version:', health.version);
```

### `async getMetrics(): Promise<Metrics>`

Retrieves gateway performance metrics.

```typescript
interface Metrics {
  requests: {
    total: number;
    success: number;
    error: number;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
  toolSelection: {
    avgLatency: number;
    avgTokens: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

const metrics = await connectors.getMetrics();
console.log('P95 latency:', metrics.latency.p95, 'ms');
console.log('Avg tokens per query:', metrics.toolSelection.avgTokens);
```

## Configuration Management

### Environment Variables

The SDK automatically reads configuration from environment variables:

```bash
# .env file
CONNECTORS_BASE_URL=http://localhost:3000
CONNECTORS_TENANT_ID=my-company
CONNECTORS_API_KEY=your-api-key
CONNECTORS_TIMEOUT=30000
CONNECTORS_LOG_LEVEL=info
```

```typescript
import { Connectors } from '@connectors/sdk';

// Automatically reads from environment variables
const connectors = new Connectors();
```

### Configuration Precedence

Configuration is loaded in the following order (later overrides earlier):

1. Default values
2. Environment variables
3. Constructor parameters

```typescript
// Environment: CONNECTORS_BASE_URL=http://env.example.com
// Constructor: baseURL: 'http://constructor.example.com'
// Result: baseURL = 'http://constructor.example.com'

const connectors = new Connectors({
  baseURL: 'http://constructor.example.com'
});
```

## Authentication

### API Key Authentication

```typescript
const connectors = new Connectors({
  baseURL: 'https://api.connectors.com',
  apiKey: 'your-api-key'
});
```

The API key is sent in the `Authorization` header:
```
Authorization: Bearer your-api-key
```

### Tenant Isolation

Use `tenantId` to isolate resources between tenants:

```typescript
const customerConnectors = new Connectors({
  baseURL: 'https://api.connectors.com',
  tenantId: 'customer-123',
  apiKey: customer.apiKey
});

// All operations are scoped to customer-123
const tools = await customerConnectors.tools.select('query');
```

## Error Handling

The client throws typed errors for different failure scenarios:

```typescript
import {
  ConnectorsError,
  NetworkError,
  AuthenticationError,
  RateLimitError
} from '@connectors/sdk';

try {
  const tools = await connectors.tools.select('query');
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
    console.error('Gateway URL:', error.url);
    // Retry logic
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
    // Update credentials
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded:', error.message);
    console.error('Retry after:', error.retryAfter, 'seconds');
    // Wait and retry
  }
}
```

[Full error handling documentation →](error-handling.md)

## Retry Logic

The SDK automatically retries failed requests with exponential backoff:

```typescript
const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  retries: 5,           // Retry up to 5 times
  retryDelay: 1000      // Start with 1 second delay
});

// Retry delays: 1s, 2s, 4s, 8s, 16s
```

Retries are attempted for:
- Network errors (ECONNREFUSED, ETIMEDOUT)
- Gateway errors (502, 503, 504)
- Rate limit errors (429) - waits for retry-after header

Retries are NOT attempted for:
- Authentication errors (401, 403)
- Client errors (400, 404)
- Tool invocation errors

## Logging

The SDK provides structured logging with multiple levels:

```typescript
const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  logLevel: 'debug'
});

// debug: All requests, responses, and internal operations
// info: Important events (tool selection, deployments)
// warn: Warnings (retries, fallbacks)
// error: Errors only
```

Example output:
```
[info] Tool selection: query="create PR" tools=3 tokens=1250 latency=45ms
[debug] HTTP GET /api/v1/tools/select query={"query":"create PR"}
[warn] Request failed, retrying (attempt 2/5): ECONNREFUSED
[error] Tool selection failed: ToolSelectionError: No tools found for query
```

## Best Practices

### 1. Single Client Instance

Create one client instance per application/tenant and reuse it:

```typescript
// ✅ Good: Module-level singleton
// src/lib/connectors.ts
export const connectors = new Connectors({
  baseURL: process.env.CONNECTORS_BASE_URL!,
  apiKey: process.env.CONNECTORS_API_KEY
});

// src/services/github.ts
import { connectors } from '../lib/connectors';
const tools = await connectors.tools.select('GitHub');
```

```typescript
// ❌ Bad: New instance per function
async function selectTools() {
  const connectors = new Connectors({ ... });
  return await connectors.tools.select('query');
}
```

### 2. Environment-Based Configuration

Use environment variables for different environments:

```typescript
// config/connectors.ts
import { Connectors } from '@connectors/sdk';

export const connectors = new Connectors({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'https://api.connectors.com'
    : 'http://localhost:3000',
  apiKey: process.env.CONNECTORS_API_KEY,
  logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
});
```

### 3. Health Checks

Monitor gateway health in production:

```typescript
async function healthCheck() {
  try {
    const health = await connectors.health();
    if (health.status !== 'healthy') {
      console.error('Gateway unhealthy:', health);
      // Alert operations team
    }
  } catch (error) {
    console.error('Health check failed:', error);
    // Gateway is down
  }
}

// Run every 30 seconds
setInterval(healthCheck, 30000);
```

### 4. Graceful Degradation

Handle gateway unavailability gracefully:

```typescript
let cachedTools: Tool[] = [];

async function getTools(query: string): Promise<Tool[]> {
  try {
    const selections = await connectors.tools.select(query);
    const tools = selections.map(s => s.tool);
    cachedTools = tools; // Update cache
    return tools;
  } catch (error) {
    if (error instanceof NetworkError) {
      console.warn('Gateway unavailable, using cached tools');
      return cachedTools;
    }
    throw error;
  }
}
```

### 5. Metrics Monitoring

Track SDK metrics for performance monitoring:

```typescript
async function logMetrics() {
  const metrics = await connectors.getMetrics();

  // Log to monitoring service
  console.log({
    p95_latency: metrics.latency.p95,
    error_rate: metrics.requests.error / metrics.requests.total,
    avg_tokens: metrics.toolSelection.avgTokens,
    cache_hit_rate: metrics.cache.hitRate
  });
}

// Run every 5 minutes
setInterval(logMetrics, 300000);
```

## Examples

### Multi-Tenant SaaS Application

```typescript
// Tenant-specific client
function getConnectorsClient(tenantId: string, apiKey: string): Connectors {
  return new Connectors({
    baseURL: 'https://api.connectors.com',
    tenantId,
    apiKey,
    timeout: 60000,
    logLevel: 'info'
  });
}

// API endpoint
app.post('/api/tools/select', async (req, res) => {
  const { tenantId, apiKey } = req.user;
  const { query } = req.body;

  const connectors = getConnectorsClient(tenantId, apiKey);
  const tools = await connectors.tools.select(query);

  res.json({ tools });
});
```

### Command-Line Tool

```typescript
#!/usr/bin/env node
import { Connectors } from '@connectors/sdk';
import { Command } from 'commander';

const program = new Command();

program
  .name('connectors-cli')
  .description('CLI for Connectors platform')
  .option('--url <url>', 'Gateway URL', 'http://localhost:3000')
  .option('--api-key <key>', 'API key')
  .option('--tenant <id>', 'Tenant ID');

program
  .command('select <query>')
  .description('Select tools using semantic search')
  .action(async (query) => {
    const opts = program.opts();
    const connectors = new Connectors({
      baseURL: opts.url,
      apiKey: opts.apiKey,
      tenantId: opts.tenant
    });

    const tools = await connectors.tools.select(query);
    console.log(JSON.stringify(tools, null, 2));
  });

program.parse();
```

## Next Steps

- **[Tools API](tools-api.md)** - Semantic tool selection and invocation
- **[MCP Registry](mcp-registry.md)** - Deploy and manage MCP servers
- **[Error Handling](error-handling.md)** - Error types and recovery
- **[Examples](../examples.md)** - Common usage patterns

---

**[← Back to TypeScript SDK](./)**
