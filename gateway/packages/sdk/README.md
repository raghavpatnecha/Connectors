# @connectors/sdk

TypeScript SDK for the Connectors Platform - AI Agent Integration with 99% token reduction.

## Features

- **Semantic Tool Selection**: AI-powered tool discovery using natural language queries
- **99% Token Reduction**: From 250K tokens → 1-3K tokens with tiered loading
- **368 Tools**: Access to 15 integrations across code, communication, PM, cloud, and data categories
- **Automatic Retries**: Built-in retry logic with exponential backoff
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Easy Integration**: Simple, intuitive API inspired by best-in-class SDKs

## Installation

```bash
npm install @connectors/sdk
```

## Quick Start

```typescript
import { Connectors } from '@connectors/sdk';

// Initialize the SDK
const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  apiKey: 'your-api-key',
  tenantId: 'your-tenant-id'
});

// Check gateway health
const health = await connectors.health();
console.log(health.status); // 'healthy'

// Test connection
const isConnected = await connectors.testConnection();
if (isConnected) {
  console.log('Connected to Connectors gateway!');
}
```

## Configuration

### ConnectorsConfig

```typescript
interface ConnectorsConfig {
  /**
   * Base URL of the Connectors gateway
   * @example 'http://localhost:3000'
   */
  baseURL: string;

  /**
   * API key for authentication (optional)
   */
  apiKey?: string;

  /**
   * Tenant ID for multi-tenant scenarios (optional)
   */
  tenantId?: string;

  /**
   * Request timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Maximum number of retry attempts for failed requests
   * @default 3
   */
  maxRetries?: number;

  /**
   * Custom headers to include in all requests
   */
  headers?: Record<string, string>;
}
```

## API Reference

### Connectors Class

#### Constructor

```typescript
const connectors = new Connectors(config: ConnectorsConfig);
```

#### Methods

##### health()

Check the gateway health status.

```typescript
const health = await connectors.health();
console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'
console.log(health.version); // Gateway version
console.log(health.uptime); // Uptime in seconds
console.log(health.services); // Service status (FAISS, Neo4j, Vault, Redis)
```

##### testConnection()

Test connection to the gateway.

```typescript
const isConnected = await connectors.testConnection();
if (isConnected) {
  console.log('Connection successful!');
} else {
  console.log('Connection failed');
}
```

### Upcoming Features (Wave 2)

The following APIs are planned for Wave 2 implementation:

#### Tools API

```typescript
// Select tools using semantic search
const tools = await connectors.tools.select('create a GitHub PR', {
  maxTools: 5,
  categories: ['code'],
  tokenBudget: 3000
});

// List available tools
const allTools = await connectors.tools.list({
  integration: 'github',
  category: 'code'
});

// Invoke a tool
const result = await connectors.tools.invoke('github.createPullRequest', {
  repo: 'owner/repo',
  title: 'New feature',
  head: 'feature-branch',
  base: 'main'
});
```

#### MCP Registry

```typescript
// Get MCP server
const github = connectors.mcp.get('github');

// Call tool on MCP server
const pr = await github.call('createPullRequest', {
  repo: 'owner/repo',
  title: 'Test PR'
});

// List all MCP servers
const servers = await connectors.mcp.list();

// Deploy custom MCP server (mcp.add())
const deployment = await connectors.mcp.add({
  name: 'my-server',
  source: {
    type: 'github',
    url: 'https://github.com/user/mcp-server'
  },
  category: 'productivity'
});
```

#### OAuth Manager

```typescript
// Authorize integration
await connectors.oauth.authorize('github', {
  scopes: ['repo', 'user']
});

// Check OAuth status
const status = await connectors.oauth.getStatus('github');

// Revoke OAuth token
await connectors.oauth.revoke('github');
```

#### Categories API

```typescript
// List all categories
const categories = await connectors.categories.list();

// Get category details
const codeCategory = await connectors.categories.get('code');
```

## Error Handling

The SDK provides specific error types for better error handling:

```typescript
import { HTTPError, TimeoutError, RetryableError, ValidationError } from '@connectors/sdk';

try {
  const health = await connectors.health();
} catch (error) {
  if (error instanceof HTTPError) {
    console.error(`HTTP Error ${error.status}:`, error.message);
  } else if (error instanceof TimeoutError) {
    console.error('Request timeout:', error.message);
  } else if (error instanceof RetryableError) {
    console.error('Request failed after retries:', error.message);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message, error.field);
  }
}
```

## Advanced Usage

### Custom Headers

```typescript
const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  headers: {
    'X-Custom-Header': 'custom-value',
    'X-Request-ID': 'unique-id'
  }
});
```

### Custom Timeout and Retries

```typescript
const connectors = new Connectors({
  baseURL: 'http://localhost:3000',
  timeout: 10000, // 10 seconds
  maxRetries: 5   // Retry up to 5 times
});
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## Architecture

The Connectors SDK provides a clean, type-safe interface to the Connectors gateway:

```
┌─────────────────────┐
│   Your Application  │
└──────────┬──────────┘
           │
           │ @connectors/sdk
           ▼
┌─────────────────────┐
│  Connectors Gateway │
│  - Semantic Router  │
│  - Token Optimizer  │
│  - GraphRAG         │
│  - OAuth Proxy      │
└──────────┬──────────┘
           │
    ┌──────┴─────┬──────┬──────┐
    ▼            ▼      ▼      ▼
  GitHub      Slack  Linear  Notion
  (50 tools)  (30)   (40)    (25)
```

## Comparison with Alternatives

| Feature | Connectors SDK | Composio | mcp-use |
|---------|---------------|----------|---------|
| Token Reduction | 99% (1-3K) | ~80% | Minimal |
| Semantic Selection | ✅ AI-powered | ❌ Manual | ❌ Manual |
| GraphRAG | ✅ Tool relationships | ❌ No | ❌ No |
| Custom MCP Servers | ✅ mcp.add() | ❌ No | ✅ Limited |
| Framework Integration | ✅ OpenAI, LangChain | ✅ Multiple | ✅ Basic |
| TypeScript SDK | ✅ Full | ✅ Full | ✅ Basic |

## Contributing

Contributions are welcome! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

## License

MIT

## Support

- **Documentation**: [docs/](../../docs/)
- **Issues**: [GitHub Issues](https://github.com/raghavpatnecha/Connectors/issues)
- **Discussions**: [GitHub Discussions](https://github.com/raghavpatnecha/Connectors/discussions)

## Roadmap

- [x] **Wave 1**: SDK Core Foundation (current)
  - [x] HTTP client with retries
  - [x] Configuration validation
  - [x] Health check endpoint
  - [x] Comprehensive tests (85%+ coverage)

- [ ] **Wave 2**: API Implementation (next)
  - [ ] ToolsAPI (select, list, invoke)
  - [ ] MCPRegistry (get, list, call)
  - [ ] OAuthManager (authorize, status, revoke)
  - [ ] CategoriesAPI (list, get)

- [ ] **Wave 3**: mcp.add() Integration
  - [ ] Deploy custom MCP servers
  - [ ] GitHub, STDIO, HTTP, Docker sources
  - [ ] Auto-discovery and semantic integration

- [ ] **Wave 4**: Framework Integrations
  - [ ] OpenAI Agents adapter
  - [ ] LangChain toolkit
  - [ ] Python SDK

- [ ] **Wave 5**: Polish & Launch
  - [ ] CLI tool
  - [ ] Comprehensive documentation
  - [ ] Example projects
  - [ ] NPM publish

---

Built with ❤️ for the AI Agent community
