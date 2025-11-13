# Reddit Unified MCP Server - Architecture Design

**Date:** 2025-11-13
**Pattern:** Based on LinkedIn Unified MCP Server (proven architecture)
**Target:** Production-ready multi-tenant Reddit integration

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  MCP Client (Claude, etc.)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│              Reddit Unified MCP Server                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Main Server (index.ts)                   │  │
│  │  - MCP stdio transport                               │  │
│  │  - OAuth callback HTTP server (Express)              │  │
│  │  - Tool registration (38 tools)                      │  │
│  │  - Graceful shutdown                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Authentication Layer                        │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │   OAuth    │  │    Vault     │  │   Session   │  │  │
│  │  │  Manager   │→ │    Client    │→ │   Manager   │  │  │
│  │  └────────────┘  └──────────────┘  └─────────────┘  │  │
│  │  - Authorization Code Flow                           │  │
│  │  - Token refresh (55 min)                            │  │
│  │  - Per-tenant encryption                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Reddit API Client                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │         Snoowrap Wrapper                       │  │  │
│  │  │  - Rate limit handling (100 QPM)              │  │  │
│  │  │  - Smart caching (50MB, 5 min TTL)            │  │  │
│  │  │  - Retry logic with exponential backoff        │  │  │
│  │  │  - User-agent management                       │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Tool Registry (37 tools)                    │  │
│  │  ┌──────────┬──────────┬─────────┬────────────────┐  │  │
│  │  │  Browse  │  Search  │  Posts  │  Comments      │  │  │
│  │  │ (8 tool) │ (2 tool) │(4 tool) │  (2 tools)     │  │  │
│  │  └──────────┴──────────┴─────────┴────────────────┘  │  │
│  │  ┌──────────┬──────────┬─────────┬────────────────┐  │  │
│  │  │Subreddit │   User   │  Utils  │  Authenticated │  │  │
│  │  │ (2 tool) │ (3 tool) │(1 tool) │   (5 tools)    │  │  │
│  │  └──────────┴──────────┴─────────┴────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │    Enhanced Tools (Optional +12)             │   │  │
│  │  │  - Voting (3), Saving (3)                   │   │  │
│  │  │  - Subscriptions (3), Messaging (3)          │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Reddit     │  │  HashiCorp   │  │     Redis       │  │
│  │     API      │  │    Vault     │  │  (Caching)      │  │
│  │oauth.reddit  │  │ :8200        │  │    :6379        │  │
│  │    .com      │  │              │  │                 │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
integrations/communication/reddit-unified/
├── src/
│   ├── index.ts                        # Main server entry (OAuth callbacks + MCP)
│   │
│   ├── auth/
│   │   ├── oauth-manager.ts            # Reddit OAuth 2.0 flow (300 lines)
│   │   ├── vault-client.ts             # HashiCorp Vault integration (220 lines)
│   │   └── session-manager.ts          # Session persistence (200 lines)
│   │
│   ├── clients/
│   │   ├── reddit-client.ts            # Snoowrap wrapper (800 lines)
│   │   ├── rate-limiter.ts             # Rate limit handler (150 lines)
│   │   └── cache-manager.ts            # Smart caching (200 lines)
│   │
│   ├── tools/
│   │   ├── index.ts                    # Tool registry exports
│   │   ├── browse-tools.ts             # 8 browse/discovery tools (400 lines)
│   │   ├── search-tools.ts             # 2 search tools (150 lines)
│   │   ├── post-tools.ts               # 4 post-related tools (250 lines)
│   │   ├── comment-tools.ts            # 3 comment tools (200 lines)
│   │   ├── subreddit-tools.ts          # 2 subreddit info tools (150 lines)
│   │   ├── user-tools.ts               # 3 user profile tools (200 lines)
│   │   ├── utility-tools.ts            # 1 reddit_explain tool (100 lines)
│   │   ├── authenticated-tools.ts      # 6 authenticated tools (300 lines)
│   │   └── enhanced-tools.ts           # +12 optional tools (500 lines) [OPTIONAL]
│   │
│   ├── utils/
│   │   ├── logger.ts                   # Winston structured logging (100 lines)
│   │   ├── error-handler.ts            # Custom error classes (150 lines)
│   │   ├── tool-registry-helper.ts     # MCP SDK integration (170 lines)
│   │   └── validators.ts               # Input validation helpers (100 lines)
│   │
│   └── types/
│       ├── index.ts                    # Type exports
│       ├── reddit.types.ts             # Reddit API types (200 lines)
│       └── mcp.types.ts                # MCP-specific types (100 lines)
│
├── tests/
│   ├── auth/
│   │   ├── oauth-manager.test.ts       # OAuth flow tests
│   │   ├── vault-client.test.ts        # Vault integration tests
│   │   └── session-manager.test.ts     # Session management tests
│   │
│   ├── clients/
│   │   ├── reddit-client.test.ts       # Reddit API client tests
│   │   ├── rate-limiter.test.ts        # Rate limit tests
│   │   └── cache-manager.test.ts       # Cache tests
│   │
│   ├── tools/
│   │   ├── browse-tools.test.ts        # Browse tool tests
│   │   ├── search-tools.test.ts        # Search tool tests
│   │   ├── post-tools.test.ts          # Post tool tests
│   │   ├── comment-tools.test.ts       # Comment tool tests
│   │   ├── subreddit-tools.test.ts     # Subreddit tool tests
│   │   ├── user-tools.test.ts          # User tool tests
│   │   └── authenticated-tools.test.ts # Auth tool tests
│   │
│   ├── integration/
│   │   ├── oauth-flow.integration.test.ts        # End-to-end OAuth
│   │   ├── multi-tenant.integration.test.ts      # Multi-tenant tests
│   │   ├── rate-limit.integration.test.ts        # Rate limit integration
│   │   └── full-workflow.integration.test.ts     # Complete workflows
│   │
│   └── setup.ts                        # Jest test setup
│
├── docs/
│   ├── README.md                       # User guide
│   ├── ARCHITECTURE.md                 # This file
│   ├── API_COVERAGE.md                 # Reddit API endpoint coverage
│   ├── OAUTH_SETUP.md                  # OAuth configuration guide
│   └── TROUBLESHOOTING.md              # Common issues
│
├── .env.example                        # Environment variables template
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── jest.config.js                      # Jest config
└── Dockerfile                          # Optional containerization
```

**Estimated Lines of Code:**
- **Production:** ~5,500 lines (core) + ~500 lines (enhanced)
- **Tests:** ~2,500 lines
- **Total:** ~8,500 lines

---

## 🔐 Authentication Architecture

### **Reddit OAuth 2.0 Configuration**

**Application Type:** Web App
- Can keep client secret secure
- Runs on controlled server
- Receives both client ID and secret

**OAuth Flow:** Authorization Code Flow

```typescript
// OAuth Configuration
interface RedditOAuthConfig {
  clientId: string;              // From Reddit app registration
  clientSecret: string;          // From Reddit app registration
  redirectUri: string;           // http://localhost:3001/oauth/callback
  scopes: string[];              // Requested permissions
  duration: 'temporary' | 'permanent';  // 'permanent' for refresh tokens
}

// Required Scopes (granular permissions)
const DEFAULT_SCOPES = [
  'identity',         // Access user identity
  'read',            // Read posts and comments
  'history',         // Access user history
  'mysubreddits',    // Access subscribed subreddits
  'submit',          // Submit posts and comments
  'edit',            // Edit posts and comments
  'vote',            // Vote on posts and comments
  'save',            // Save posts and comments
  'subscribe',       // Subscribe to subreddits
  'privatemessages', // Send/receive messages
  'account'          // Manage account settings
];
```

### **Token Management**

```typescript
interface TokenSet {
  accessToken: string;     // Valid for 1 hour
  refreshToken?: string;   // Optional, for duration=permanent
  expiresAt: Date;        // Expiry timestamp
  scope: string[];        // Granted scopes
}

// Automatic refresh: 5 minutes before expiry (55 min mark)
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
```

### **Multi-Tenant Vault Storage**

```typescript
// Vault Storage Pattern (per-tenant encryption)
interface VaultCredentials {
  tenantId: string;
  credentials: {
    accessToken: string;      // Encrypted with tenant key
    refreshToken?: string;    // Encrypted with tenant key
    expiresAt: number;       // Unix timestamp
    scopes: string[];
  };
  metadata: {
    createdAt: Date;
    lastRefreshed: Date;
    username?: string;       // Reddit username
  };
}

// Vault paths
const VAULT_PATH = `secret/data/${tenantId}/reddit`;
const TRANSIT_KEY = `transit/encrypt/${tenantId}`;
```

---

## 🚀 Reddit API Client Design

### **Snoowrap Integration**

```typescript
import Snoowrap from 'snoowrap';

class RedditClient {
  private snoowrap: Snoowrap;
  private rateLimiter: RateLimiter;
  private cache: CacheManager;
  private tenantId: string;

  constructor(tenantId: string, oauthManager: OAuthManager) {
    this.tenantId = tenantId;
    this.rateLimiter = new RateLimiter(100); // 100 QPM for OAuth
    this.cache = new CacheManager({ maxSize: 50 * 1024 * 1024, ttl: 300 }); // 50MB, 5min
  }

  /**
   * Initialize Snoowrap with OAuth credentials
   */
  async initialize(): Promise<void> {
    const creds = await this.oauthManager.getCredentials(this.tenantId);

    this.snoowrap = new Snoowrap({
      userAgent: 'RedditUnifiedMCP/1.0.0 (by /u/YOUR_USERNAME)',
      accessToken: creds.accessToken,
      clientId: process.env.REDDIT_CLIENT_ID!,
      clientSecret: process.env.REDDIT_CLIENT_SECRET!,
      refreshToken: creds.refreshToken
    });

    // Configure rate limiting
    this.snoowrap.config({
      requestDelay: 1000,  // Min 1 second between requests
      warnings: false,
      continueAfterRatelimitError: true,
      retryErrorCodes: [502, 503, 504, 522],
      maxRetryAttempts: 3
    });
  }

  /**
   * Browse subreddit with caching
   */
  async browseSubreddit(params: BrowseParams): Promise<Listing<Submission>> {
    const cacheKey = `browse_${params.subreddit}_${params.sort}_${params.limit}`;

    // Check cache first
    const cached = this.cache.get<Listing<Submission>>(cacheKey);
    if (cached) return cached;

    // Wait for rate limit slot
    await this.rateLimiter.acquire();

    // Fetch from Reddit
    const subreddit = this.snoowrap.getSubreddit(params.subreddit);
    let listing: Listing<Submission>;

    switch (params.sort) {
      case 'hot': listing = await subreddit.getHot({ limit: params.limit }); break;
      case 'new': listing = await subreddit.getNew({ limit: params.limit }); break;
      case 'top': listing = await subreddit.getTop({ time: params.time, limit: params.limit }); break;
      case 'rising': listing = await subreddit.getRising({ limit: params.limit }); break;
      case 'controversial': listing = await subreddit.getControversial({ time: params.time, limit: params.limit }); break;
      default: listing = await subreddit.getHot({ limit: params.limit });
    }

    // Cache result
    this.cache.set(cacheKey, listing);

    return listing;
  }
}
```

### **Rate Limiter**

```typescript
class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens per second
  private lastRefill: number;

  constructor(requestsPerMinute: number) {
    this.maxTokens = requestsPerMinute;
    this.tokens = requestsPerMinute;
    this.refillRate = requestsPerMinute / 60; // per second
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens < 1) {
      const waitTime = (1 - this.tokens) / this.refillRate * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.refill();
    }

    this.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + timePassed * this.refillRate);
    this.lastRefill = now;
  }
}
```

### **Cache Manager**

```typescript
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  size: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  private currentSize: number;
  private ttl: number; // seconds

  constructor(options: { maxSize: number; ttl: number }) {
    this.cache = new Map();
    this.maxSize = options.maxSize;
    this.ttl = options.ttl;
    this.currentSize = 0;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    const size = JSON.stringify(value).length;

    // Evict if necessary
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      const oldestKey = this.cache.keys().next().value;
      const oldEntry = this.cache.get(oldestKey)!;
      this.cache.delete(oldestKey);
      this.currentSize -= oldEntry.size;
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl * 1000,
      size
    });
    this.currentSize += size;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }
}
```

---

## 🛠️ Tool Registry Pattern

### **MCP SDK Integration**

```typescript
// src/utils/tool-registry-helper.ts (identical to LinkedIn)
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ZodSchema } from 'zod';

export class ToolRegistry {
  private tools: Array<{ name: string; description: string; inputSchema: any }> = [];
  private handlers: Map<string, Function> = new Map();

  registerTool(
    name: string,
    description: string,
    schema: ZodSchema,
    handler: Function
  ): void {
    this.tools.push({
      name,
      description,
      inputSchema: zodToJsonSchema(schema)
    });
    this.handlers.set(name, handler);
  }

  setupServer(server: Server): void {
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.tools
    }));

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const handler = this.handlers.get(name);

      if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
      }

      return await handler(args);
    });
  }

  getToolCount(): number {
    return this.tools.length;
  }
}
```

### **Tool Registration Example**

```typescript
// src/tools/browse-tools.ts
import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { RedditClient } from '../clients/reddit-client';

export function registerBrowseTools(
  registry: ToolRegistry,
  getClient: (tenantId: string) => RedditClient
): void {
  // Tool: browse_subreddit
  registry.registerTool(
    'browse_subreddit',
    'Browse posts from any subreddit with sorting options (hot, new, top, rising, controversial)',
    z.object({
      subreddit: z.string().describe('Subreddit name (without r/ prefix)'),
      sort: z.enum(['hot', 'new', 'top', 'rising', 'controversial']).default('hot'),
      time: z.enum(['hour', 'day', 'week', 'month', 'year', 'all']).optional(),
      limit: z.number().min(1).max(100).default(25),
      tenantId: z.string()
    }),
    async (params: any) => {
      const client = getClient(params.tenantId);
      const posts = await client.browseSubreddit(params);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            subreddit: params.subreddit,
            sort: params.sort,
            posts: posts.map(formatPost),
            count: posts.length
          }, null, 2)
        }]
      };
    }
  );

  // Register remaining 7 browse tools...
}
```

---

## 📊 Error Handling

### **Custom Error Classes**

```typescript
// src/utils/error-handler.ts

export class RedditAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'RedditAPIError';
  }
}

export class RedditRateLimitError extends RedditAPIError {
  constructor(
    message: string,
    public resetAt: Date,
    public remaining: number = 0
  ) {
    super(message, 429);
    this.name = 'RedditRateLimitError';
  }
}

export class RedditAuthError extends Error {
  constructor(
    message: string,
    public tenantId: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'RedditAuthError';
  }
}

export class RedditNotFoundError extends RedditAPIError {
  constructor(resource: string) {
    super(`Reddit resource not found: ${resource}`, 404);
    this.name = 'RedditNotFoundError';
  }
}
```

---

## 🧪 Testing Strategy

### **Test Coverage Target: 85%+**

**Unit Tests (60%):**
- OAuth Manager: Authorization flow, token refresh, error handling
- Vault Client: Credential storage, retrieval, encryption
- Reddit Client: API calls, rate limiting, caching
- Tool handlers: Input validation, output formatting

**Integration Tests (25%):**
- End-to-end OAuth flow
- Multi-tenant credential isolation
- Rate limit enforcement
- Cache effectiveness

**E2E Tests (15%):**
- Complete user workflows
- Tool execution via MCP
- Error recovery scenarios

---

## 📈 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **OAuth Flow** | <2 seconds | Time from auth start to token |
| **Tool Execution** | <500ms | Average response time (cached) |
| **Tool Execution** | <2s | Average response time (uncached) |
| **Rate Limit Compliance** | 100 QPM | Never exceed Reddit limits |
| **Cache Hit Rate** | >70% | For read-only tools |
| **Token Refresh** | <100ms | Refresh operation time |
| **Test Coverage** | >85% | Overall code coverage |

---

## 🔒 Security Considerations

1. **Credential Storage:** Per-tenant encryption in Vault (Transit engine)
2. **Token Refresh:** Automatic refresh 5 min before expiry
3. **Rate Limiting:** Enforce Reddit's 100 QPM limit
4. **Input Validation:** Zod schemas for all tool inputs
5. **Error Sanitization:** Never expose credentials in logs
6. **HTTPS Only:** All OAuth redirects must use HTTPS in production
7. **State Validation:** CSRF protection in OAuth flow

---

## 📝 Implementation Checklist

### **Phase 1: Foundation (Core Components)**
- [ ] Project structure setup
- [ ] OAuth Manager implementation
- [ ] Vault Client implementation
- [ ] Session Manager implementation
- [ ] Snoowrap wrapper (Reddit Client)
- [ ] Rate Limiter implementation
- [ ] Cache Manager implementation

### **Phase 2: Tool Implementation (26 Core Tools)**
- [ ] Browse tools (8)
- [ ] Search tools (2)
- [ ] Post tools (4)
- [ ] Comment tools (3)
- [ ] Subreddit tools (2)
- [ ] User tools (3)
- [ ] Utility tools (1)
- [ ] Authenticated tools (6)

### **Phase 3: Integration**
- [ ] Main server (index.ts)
- [ ] Tool Registry setup
- [ ] Express OAuth callback server
- [ ] MCP stdio transport

### **Phase 4: Testing**
- [ ] Unit tests (auth, client, tools)
- [ ] Integration tests (OAuth flow, multi-tenant)
- [ ] E2E tests (full workflows)
- [ ] Achieve 85%+ coverage

### **Phase 5: Documentation**
- [ ] README (user guide)
- [ ] API coverage documentation
- [ ] OAuth setup guide
- [ ] Troubleshooting guide

### **Phase 6: Optional Enhancements (+12 tools)**
- [ ] Voting tools (3)
- [ ] Saving tools (3)
- [ ] Subscription tools (3)
- [ ] Messaging tools (3)

---

**Status:** Architecture design complete, ready for Claude Flow implementation plan
