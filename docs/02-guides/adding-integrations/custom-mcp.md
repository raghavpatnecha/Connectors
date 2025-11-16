# Building Custom MCP Servers

**Build production-ready custom MCP servers when OpenAPI isn't enough**

---

## When to Build Custom

✅ No OpenAPI specification
✅ Complex auth (SAML, JWT, browser automation)
✅ Non-REST protocols (WebSocket, GraphQL, gRPC)
✅ Browser automation needed
✅ Custom business logic
✅ Special rate limiting

**Time:** 1-2 days | **Examples:** LinkedIn, Reddit

---

## Architecture

```
your-integration/
├── src/
│   ├── index.ts              # MCP server entry
│   ├── auth/
│   │   ├── oauth-manager.ts  # OAuth flow
│   │   ├── vault-client.ts   # Vault integration
│   │   └── session-manager.ts
│   ├── clients/
│   │   ├── api-client.ts     # HTTP/WS/GraphQL client
│   │   ├── rate-limiter.ts   # Token bucket
│   │   └── cache-manager.ts  # LRU cache
│   ├── tools/
│   │   ├── *-tools.ts        # Tool definitions by category
│   └── utils/
│       ├── logger.ts         # Winston logging
│       └── error-handler.ts
├── tests/
└── package.json
```

---

## Quick Start

### 1. Initialize

```bash
cd integrations/{category}
mkdir your-integration && cd your-integration
npm init -y

# Core deps
npm install @modelcontextprotocol/sdk dotenv winston
npm install node-vault axios

# Dev deps
npm install -D typescript @types/node jest ts-jest eslint
npx tsc --init
```

### 2. Main Server

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TOOL_DEFINITIONS } from './tools/registry.js';
import { handleToolCall } from './tools/index.js';

class YourMCP {
  private server: Server;

  constructor() {
    this.server = new Server({ name: 'your-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOL_DEFINITIONS }));
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const result = await handleToolCall(request.params.name, request.params.arguments);
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

new YourMCP().start();
```

### 3. OAuth Manager

```typescript
// src/auth/oauth-manager.ts
import axios from 'axios';
import { VaultClient } from './vault-client.js';

export class OAuthManager {
  constructor(private vault: VaultClient, private config: OAuthConfig) {}

  getAuthUrl(tenantId: string, state: string): string {
    return `${this.config.authorizationUrl}?client_id=${this.config.clientId}&redirect_uri=${this.config.redirectUri}&state=${state}&response_type=code&scope=${this.config.scopes.join(' ')}`;
  }

  async exchangeCode(code: string, tenantId: string): Promise<OAuthCredentials> {
    const response = await axios.post(this.config.tokenUrl, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const creds = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
      scopes: response.data.scope?.split(' ') || this.config.scopes,
    };

    await this.vault.storeCredentials(tenantId, 'your-integration', creds);
    return creds;
  }

  async getAccessToken(tenantId: string): Promise<string> {
    let creds = await this.vault.getCredentials(tenantId, 'your-integration');
    if (new Date(creds.expiresAt).getTime() - Date.now() < 5 * 60 * 1000) {
      creds = await this.refreshToken(tenantId, creds);
    }
    return creds.accessToken;
  }

  private async refreshToken(tenantId: string, creds: OAuthCredentials): Promise<OAuthCredentials> {
    const response = await axios.post(this.config.tokenUrl, {
      grant_type: 'refresh_token',
      refresh_token: creds.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const newCreds = { ...creds, accessToken: response.data.access_token, expiresAt: new Date(Date.now() + response.data.expires_in * 1000) };
    await this.vault.storeCredentials(tenantId, 'your-integration', newCreds);
    return newCreds;
  }
}
```

### 4. API Client

```typescript
// src/clients/api-client.ts
import axios, { AxiosInstance } from 'axios';
import { OAuthManager } from '../auth/oauth-manager.js';
import { RateLimiter } from './rate-limiter.js';

export class APIClient {
  private axios: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor(private oauth: OAuthManager) {
    this.axios = axios.create({ baseURL: process.env.API_BASE_URL, timeout: 30000 });
    this.rateLimiter = new RateLimiter({ requestsPerMinute: 60 });
  }

  async request<T>(method: string, path: string, tenantId: string, data?: any): Promise<T> {
    await this.rateLimiter.acquire();
    const token = await this.oauth.getAccessToken(tenantId);
    const response = await this.axios.request<T>({
      method,
      url: path,
      data,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  }
}
```

### 5. Rate Limiter (Token Bucket)

```typescript
// src/clients/rate-limiter.ts
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private capacity: number;
  private refillRate: number;

  constructor({ requestsPerMinute }: { requestsPerMinute: number }) {
    this.capacity = requestsPerMinute;
    this.refillRate = requestsPerMinute / 60;
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;

    if (this.tokens < 1) {
      const waitTime = ((1 - this.tokens) / this.refillRate) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.tokens = 1;
    }
    this.tokens -= 1;
  }
}
```

### 6. Tool Definitions

```typescript
// src/tools/browse-tools.ts
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const BROWSE_TOOLS: Tool[] = [
  {
    name: 'get_items',
    description: 'Get list of items with filtering and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', description: 'Tenant ID' },
        category: { type: 'string', description: 'Filter by category' },
        limit: { type: 'number', minimum: 1, maximum: 100 },
      },
      required: ['tenantId'],
    },
  },
];
```

### 7. Tool Handlers

```typescript
// src/tools/index.ts
export async function handleToolCall(toolName: string, args: any): Promise<any> {
  const { tenantId, ...params } = args;

  switch (toolName) {
    case 'get_items':
      return apiClient.request('GET', `/items?${new URLSearchParams(params)}`, tenantId);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
```

---

## Real-World Examples

### LinkedIn (Browser Automation)

**Location:** `/integrations/communication/linkedin-unified/`

**Key Tech:** Playwright for browser automation

```typescript
// src/clients/browser-client.ts
import { chromium } from 'playwright';

export class BrowserClient {
  async searchPeople(query: string): Promise<any[]> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.linkedin.com/search/results/people/?keywords=${query}`);
    const results = await page.$$eval('.search-result', (els) =>
      els.map((el) => ({ name: el.querySelector('.name')?.textContent }))
    );
    await browser.close();
    return results;
  }
}
```

**Why?** LinkedIn API only has 3 endpoints. Everything else needs web scraping.

### Reddit (Complex Rate Limiting)

**Location:** `/integrations/communication/reddit-unified/`

**Key Tech:** Token bucket + LRU caching

**Rate Limits:** 60/min, 600/10min

```typescript
// Multi-tier rate limiting
const limiter = new RateLimiter({
  requestsPerMinute: 60,
  requestsPerTenMinutes: 600
});
```

---

## Testing

### Unit Tests

```typescript
// tests/unit/oauth.test.ts
describe('OAuthManager', () => {
  it('should generate auth URL', () => {
    const url = oauth.getAuthUrl('tenant1', 'state123');
    expect(url).toContain('client_id=');
  });

  it('should refresh expired tokens', async () => {
    const token = await oauth.getAccessToken('tenant1');
    expect(token).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// tests/integration/api.test.ts
describe('API Client', () => {
  it('should make authenticated request', async () => {
    const result = await client.request('GET', '/items', 'tenant1');
    expect(result).toHaveProperty('data');
  });

  it('should handle rate limiting', async () => {
    const promises = Array(61).fill(0).map(() => client.request('GET', '/items', 'tenant1'));
    await expect(Promise.all(promises)).resolves.toBeDefined();
  });
});
```

**Target:** 85%+ coverage

---

## Deployment Checklist

- [ ] OAuth tested with real credentials
- [ ] Rate limiting verified
- [ ] Error handling comprehensive
- [ ] Logging structured (JSON)
- [ ] No hardcoded secrets
- [ ] Vault integration working
- [ ] Tests passing (85%+ coverage)
- [ ] TypeScript compiles (zero errors)
- [ ] README complete
- [ ] Environment variables documented

---

## Common Patterns

### Browser Automation (Playwright)
```bash
npm install playwright
npx playwright install chromium
```

### GraphQL Client
```bash
npm install graphql-request
```

### WebSocket
```bash
npm install ws
```

### gRPC
```bash
npm install @grpc/grpc-js @grpc/proto-loader
```

---

## Next Steps

1. Initialize project (Step 1)
2. Implement OAuth (Step 2-3)
3. Build API client (Step 4-5)
4. Define tools (Step 6-7)
5. Write tests (85%+ coverage)
6. Register with gateway
7. Deploy

---

## Support

- **LinkedIn Example:** `/integrations/communication/linkedin-unified/`
- **Reddit Example:** `/integrations/communication/reddit-unified/`
- **MCP SDK:** https://modelcontextprotocol.io
- **Guidelines:** `/CLAUDE.md`

---

**Custom = Full Control | Use OpenAPI when possible for 99% faster development!**
