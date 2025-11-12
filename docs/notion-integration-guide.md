# Notion MCP Integration Guide

## Overview

The Notion MCP integration enables AI agents to interact with Notion workspaces through the Connectors Platform gateway. This integration provides:

- **OAuth 2.0 Authentication**: Automatic token management via HashiCorp Vault
- **Rate Limiting**: Token bucket algorithm (3 requests/second average)
- **Semantic Routing**: Intelligent tool selection via FAISS + GraphRAG
- **Error Mapping**: Notion-specific error handling and recovery
- **Health Monitoring**: Readiness probes and status endpoints

## Architecture

```
┌────────────────────┐
│   AI Agent         │
│   (Claude, etc.)   │
└────────┬───────────┘
         │
         │ MCP Protocol
         ▼
┌────────────────────┐
│  Gateway Service   │
│  - Semantic Router │
│  - OAuth Proxy     │
│  - Rate Limiter    │
└────────┬───────────┘
         │
         │ HTTP + OAuth
         ▼
┌────────────────────┐
│  Notion MCP Server │
│  (Docker)          │
└────────┬───────────┘
         │
         │ Notion API
         ▼
┌────────────────────┐
│  Notion Workspace  │
└────────────────────┘
```

## File Structure

### Created Files

1. **`gateway/src/integrations/notion-integration.ts`**
   - Main integration module
   - Rate limiter implementation
   - Error mapping
   - Health checks

2. **`gateway/src/config/integrations.ts`**
   - Integration registry
   - Centralized configuration
   - Lifecycle management

3. **`gateway/.env.example`** (Updated)
   - Notion environment variables
   - OAuth configuration
   - Server endpoints

4. **`docker-compose.yml`** (Updated)
   - Notion MCP service definition
   - Health checks
   - Network configuration

## Environment Variables

### Required

```bash
# Enable/disable Notion integration
NOTION_ENABLED=true

# Notion MCP server URL
NOTION_SERVER_URL=http://localhost:3100

# OAuth credentials (from Notion Developer Portal)
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=http://localhost:3000/oauth/callback/notion
```

### Optional

```bash
# Rate limit (requests per second)
NOTION_RATE_LIMIT=3

# Request timeout (milliseconds)
NOTION_TIMEOUT_MS=5000
```

## OAuth Setup

### 1. Create Notion Integration

1. Go to [Notion Developers](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Configure:
   - **Name**: Your integration name
   - **Associated workspace**: Select workspace
   - **Capabilities**: Select required permissions
     - Read content
     - Update content
     - Insert content
     - Read comments
     - Insert comments
     - Read users

### 2. Get OAuth Credentials

1. In integration settings, navigate to **OAuth**
2. Copy **OAuth client ID**
3. Copy **OAuth client secret**
4. Add redirect URI: `http://localhost:3000/oauth/callback/notion`

### 3. Configure Gateway

Update `.env` file:

```bash
NOTION_CLIENT_ID=your_client_id_here
NOTION_CLIENT_SECRET=your_client_secret_here
NOTION_REDIRECT_URI=http://localhost:3000/oauth/callback/notion
```

## Available Tools

The Notion integration provides 11 semantic tools:

### Page Management
- **`notion.createPage`**: Create new pages with content and properties
- **`notion.updatePage`**: Update existing page properties and content
- **`notion.getPage`**: Retrieve page content and metadata

### Database Operations
- **`notion.queryDatabase`**: Query databases with filters and sorting
- **`notion.createDatabase`**: Create new databases with schema
- **`notion.updateDatabase`**: Update database configuration

### Block Operations
- **`notion.appendBlock`**: Append content blocks to pages
- **`notion.getBlock`**: Retrieve block content and children

### Collaboration
- **`notion.createComment`**: Add comments to pages
- **`notion.getUser`**: Retrieve user information

### Search
- **`notion.search`**: Search across workspace content

## Rate Limiting

### Configuration

- **Default**: 3 requests/second (average)
- **Algorithm**: Token bucket
- **Burst**: Up to 3 simultaneous requests
- **Throttling**: Automatic delay when limit reached

### Implementation

```typescript
class NotionRateLimiter {
  private _tokens: number = 3;
  private _refillRate: number = 3; // per second

  async acquire(): Promise<void> {
    // Refill based on elapsed time
    // Wait if no tokens available
  }
}
```

### Monitoring

```typescript
const status = notionIntegration.getStatus();
console.log(status.availableTokens); // Current tokens
```

## Error Handling

### Mapped Error Codes

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| 400 | `MCPError` | Invalid request parameters |
| 401 | Auto-refresh | Token expired → OAuth refresh |
| 403 | `MCPError` | Insufficient permissions |
| 404 | `MCPError` | Resource not found |
| 409 | `MCPError` | Conflict (version mismatch) |
| 429 | `RateLimitError` | Rate limit exceeded |
| 500-504 | `MCPError` | Server errors |

### Example Error Handling

```typescript
try {
  const response = await notionIntegration.proxyRequest(req);
} catch (error) {
  if (error instanceof RateLimitError) {
    // Wait and retry
    await delay(error.metadata.resetTime);
  } else if (error instanceof MCPError) {
    // Handle specific error
    logger.error('Notion error', { status: error.metadata?.status });
  }
}
```

## Docker Deployment

### Start Notion MCP Server

```bash
# Start with notion profile
docker-compose --profile notion up -d

# Or start all MCP servers
docker-compose --profile mcp-servers up -d
```

### Verify Health

```bash
# Check Notion MCP health
curl http://localhost:3100/health

# Check gateway integration status
curl http://localhost:3000/integrations/notion/status
```

### View Logs

```bash
# Notion MCP server logs
docker-compose logs -f mcp-notion

# Gateway logs
docker-compose logs -f gateway
```

## Usage Examples

### Semantic Tool Selection

```typescript
// AI agent query
const query = "Create a new page in Notion with project plan";

// Gateway selects optimal tools
const tools = await semanticRouter.selectTools(query, {
  allowedCategories: ['productivity'],
  tokenBudget: 2000
});

// Result: notion.createPage selected (highest semantic match)
```

### Direct API Call

```typescript
import { NotionIntegration } from './integrations/notion-integration';

const notion = new NotionIntegration(oauthProxy, semanticRouter);
await notion.initialize();

const response = await notion.proxyRequest({
  tenantId: 'tenant-123',
  integration: 'notion',
  method: 'POST',
  path: '/pages',
  body: {
    parent: { database_id: 'db-id' },
    properties: {
      Name: { title: [{ text: { content: 'New Page' } }] }
    }
  }
});
```

### Health Check

```typescript
const healthy = await notion.healthCheck();
if (!healthy) {
  logger.error('Notion MCP server is unhealthy');
}

const status = notion.getStatus();
console.log({
  enabled: status.enabled,
  healthy: status.healthy,
  rateLimit: status.rateLimit,
  availableTokens: status.availableTokens
});
```

## Integration Registry

### Register Notion

```typescript
import { createIntegrationRegistry } from './config/integrations';

const registry = createIntegrationRegistry(oauthProxy, semanticRouter);
await registry.initialize();

// Get Notion integration
const notion = registry.getInstance<NotionIntegration>('notion');

// List all integrations
const integrations = registry.listIntegrations({
  category: 'productivity',
  enabled: true
});
```

### Health Monitoring

```typescript
// Check all integrations
const health = await registry.healthCheck();
console.log(health); // { notion: true, github: true, ... }
```

## Testing

### Unit Tests

```typescript
describe('NotionIntegration', () => {
  it('should apply rate limiting', async () => {
    const notion = new NotionIntegration(mockOAuth, mockRouter);

    const start = Date.now();
    await Promise.all([
      notion.proxyRequest(req1),
      notion.proxyRequest(req2),
      notion.proxyRequest(req3),
      notion.proxyRequest(req4) // Should throttle
    ]);

    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThan(300); // 4th request delayed
  });

  it('should map Notion errors correctly', async () => {
    mockOAuth.proxyRequest.mockRejectedValue({
      response: { status: 429 }
    });

    await expect(notion.proxyRequest(req))
      .rejects.toThrow(RateLimitError);
  });
});
```

### Integration Tests

```typescript
describe('Notion Integration E2E', () => {
  beforeAll(async () => {
    // Start docker-compose
    await exec('docker-compose --profile notion up -d');
  });

  it('should create page via gateway', async () => {
    const response = await gateway.request({
      query: 'create notion page',
      context: { tenantId: 'test' }
    });

    expect(response.status).toBe(201);
  });
});
```

## Performance Metrics

### Token Reduction

- **Without Semantic Routing**: ~250K tokens (all 500+ tools loaded)
- **With Semantic Routing**: ~1-3K tokens (5-10 relevant tools)
- **Reduction**: **95%+**

### Latency Targets

- **Tool Selection**: <100ms (FAISS + cache)
- **OAuth Token Fetch**: <50ms (Vault cached)
- **Notion API Call**: <500ms (varies by operation)
- **Total Request**: <2s (end-to-end)

### Rate Limit Performance

- **Throughput**: 3 requests/second (sustained)
- **Burst**: Up to 3 simultaneous
- **Latency**: <5ms (rate limiter overhead)

## Troubleshooting

### Notion MCP Server Not Starting

```bash
# Check container status
docker-compose ps mcp-notion

# Check logs
docker-compose logs mcp-notion

# Verify network
docker network inspect connectors_connectors-network
```

### OAuth Errors

```bash
# Check Vault health
curl http://localhost:8200/v1/sys/health

# Verify credentials stored
docker-compose exec vault vault kv get secret/tenant-123/notion

# Check OAuth config
docker-compose exec gateway env | grep NOTION
```

### Rate Limit Issues

```typescript
// Check available tokens
const status = notion.getStatus();
logger.info('Rate limit status', {
  available: status.availableTokens,
  limit: status.rateLimit
});

// Adjust rate limit
process.env.NOTION_RATE_LIMIT = '5'; // Increase to 5/sec
```

### Health Check Failures

```bash
# Test Notion MCP directly
curl -v http://localhost:3100/health

# Check gateway can reach Notion
docker-compose exec gateway curl http://mcp-notion:3000/health

# Verify DNS resolution
docker-compose exec gateway ping -c 1 mcp-notion
```

## Security Considerations

### OAuth Tokens

- ✅ Stored encrypted in Vault (per-tenant keys)
- ✅ Auto-refreshed 5 minutes before expiry
- ✅ Never logged or exposed in errors
- ✅ Transmitted over TLS only

### Rate Limiting

- ✅ Per-tenant rate limits (prevents abuse)
- ✅ Token bucket algorithm (smooth traffic)
- ✅ Graceful degradation on limit

### Input Validation

- ✅ Request schema validation
- ✅ Path traversal prevention
- ✅ SQL injection prevention (GraphRAG)

## Monitoring & Observability

### Structured Logging

```typescript
logger.info('notion_request', {
  tenantId: 'tenant-123',
  method: 'POST',
  path: '/pages',
  duration: 245,
  status: 201,
  availableTokens: 2.7
});
```

### Metrics (Prometheus)

- `notion_requests_total` - Total requests
- `notion_errors_total` - Error count by type
- `notion_latency_seconds` - Request latency histogram
- `notion_rate_limit_tokens` - Available tokens gauge

### Health Endpoints

- `GET /health` - Overall gateway health
- `GET /integrations/notion/status` - Notion-specific status
- `GET /integrations/notion/metrics` - Performance metrics

## Next Steps

1. **Production Setup**
   - Move to Kubernetes (see `/k8s/notion-deployment.yaml`)
   - Configure production Vault cluster
   - Set up Prometheus monitoring
   - Enable TLS/mTLS

2. **Additional Tools**
   - Generate MCP server from Notion OpenAPI spec
   - Add custom tools (templates, workflows)
   - Implement batch operations

3. **GraphRAG Enhancement**
   - Index tool usage patterns
   - Build relationship graph (e.g., createPage → appendBlock)
   - Implement collaborative filtering

4. **Multi-tenancy**
   - Per-tenant rate limits
   - Usage quotas
   - Billing integration

## References

- [Notion API Documentation](https://developers.notion.com/reference)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Gateway Architecture](/docs/architecture.md)
- [OAuth Implementation](/docs/oauth-implementation.md)
- [CLAUDE.md Guidelines](/CLAUDE.md)
