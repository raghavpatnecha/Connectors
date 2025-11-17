# Rate Limiting Analysis Report
## MCP Gateway - Connectors Platform

**Report Date:** 2025-11-17  
**Scope:** Gateway, OAuth Proxy, Integration Architecture  
**Analysis Depth:** Comprehensive (Code Review + Architecture)

---

## EXECUTIVE SUMMARY

### Current Status: PARTIALLY IMPLEMENTED
- ✅ Per-integration rate limiting: **IMPLEMENTED** (token bucket algorithm)
- ✅ Upstream rate limit handling: **IMPLEMENTED** (429 error detection)
- ✅ Redis infrastructure: **AVAILABLE** (caching only)
- ❌ Gateway-level rate limiting: **NOT IMPLEMENTED** (critical gap)
- ❌ Per-tenant rate limiting: **NOT IMPLEMENTED** (multi-tenancy concern)
- ❌ Per-IP rate limiting: **NOT IMPLEMENTED** (DDoS protection gap)

### Risk Assessment: **HIGH**
Without gateway-level rate limiting, the platform is vulnerable to:
- **Token exhaustion attacks** per tenant
- **Resource exhaustion** (memory, CPU) from unbounded requests
- **Thundering herd** scenarios during peak usage
- **Cost overruns** on third-party API calls

---

## 1. CURRENT RATE LIMITING STATUS

### 1.1 What's Implemented

#### Per-Integration Rate Limiting (Token Bucket)
Located in integration classes (slides, tasks, etc.)

**File:** `/home/user/Connectors/gateway/src/integrations/slides-integration.ts` (lines 53-94)

```typescript
class SlidesRateLimiter {
  private _tokens: number = SLIDES_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = SLIDES_RATE_LIMIT;
  private readonly _refillRate: number = SLIDES_RATE_LIMIT; // tokens per second

  async acquire(): Promise<void> {
    // Refill tokens based on time elapsed
    const now = Date.now();
    const elapsed = (now - this._lastRefill) / 1000;
    this._tokens = Math.min(
      this._maxTokens,
      this._tokens + elapsed * this._refillRate
    );
    this._lastRefill = now;

    if (this._tokens >= 1) {
      this._tokens -= 1;
      return;
    }

    // Wait until we have a token
    const waitTime = ((1 - this._tokens) / this._refillRate) * 1000;
    await new Promise(resolve => setTimeout(resolve, waitTime));
    this._tokens = 0;
  }
}
```

**Characteristics:**
- Algorithm: Token Bucket (refill rate = max rate)
- Scope: **Per-integration per-process** (NOT shared across instances)
- Granularity: Per-request throttling
- Storage: In-memory only
- Issue: **Not distributed** - each server instance has independent buckets

#### Upstream 429 Error Handling (OAuth Provider Rate Limits)

**File:** `/home/user/Connectors/gateway/src/auth/oauth-proxy.ts` (lines 230-248)

```typescript
// 5. Handle rate limits (429)
if (error.response?.status === 429) {
  const resetTime = error.response.headers['x-ratelimit-reset'];
  const remaining = error.response.headers['x-ratelimit-remaining'];

  logger.warn('Rate limit exceeded', {
    tenantId,
    integration,
    resetTime,
    remaining
  });

  throw new RateLimitError(
    'OAuth provider rate limit exceeded',
    integration,
    tenantId,
    resetTime ? parseInt(resetTime) : Date.now() / 1000 + 3600,
    remaining ? parseInt(remaining) : 0
  );
}
```

**Characteristics:**
- Detects and reports 429 responses from upstream APIs
- Extracts reset time and remaining quota
- Throws `RateLimitError` (lines 128-147 in oauth-errors.ts)
- **Reactive only** - doesn't prevent hitting the limit

#### Integration Configuration Rate Limits

**File:** `/home/user/Connectors/gateway/src/config/integrations.ts` (lines 46-47, 210-561)

```typescript
/** Rate limit (requests per second) */
rateLimit: number;

// Example configurations:
rateLimit: parseInt(process.env.NOTION_RATE_LIMIT || '3', 10),
rateLimit: parseInt(process.env.GITHUB_RATE_LIMIT || '60', 10),
rateLimit: parseInt(process.env.LINKEDIN_RATE_LIMIT || '100', 10),
rateLimit: parseInt(process.env.REDDIT_RATE_LIMIT || '60', 10),
```

**Integrations with Configured Limits:**
1. Notion: 3 req/s
2. GitHub: 60 req/s
3. LinkedIn: 100 req/s
4. Reddit: 60 req/s
5. Gmail: 25 req/s
6. Drive: 10 req/s
7. Calendar: 5 req/s
8. Tasks: 5 req/s
9. Docs: 10 req/s
10. Sheets: 10 req/s
11. Slides: 10 req/s
12. Forms: 10 req/s
13. Chat: 20 req/s
14. Search: 5 req/s

### 1.2 What's NOT Implemented

#### Gateway-Level Rate Limiting (CRITICAL GAP)
No middleware or rate limiting logic on the main gateway server.

**Server File:** `/home/user/Connectors/gateway/src/server.ts` (lines 113-150)

```typescript
private setupMiddleware(): void {
  // Security middleware
  this.app.use(helmet({...}));
  
  // CORS configuration
  this.app.use(cors({...}));
  
  // Body parsing
  this.app.use(express.json({ limit: '10mb' }));
  this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Compression
  this.app.use(compression());
  
  // Request logging
  this.app.use((req: Request, res: Response, next: NextFunction) => {...});
  
  // ❌ NO RATE LIMITING MIDDLEWARE
}
```

#### Per-Tenant Rate Limiting (MULTI-TENANCY GAP)
No quota tracking per tenant despite having `tenantId` context.

**Server Endpoints Lacking Rate Limiting (server.ts):**
- Line 163: `POST /api/v1/tools/select` - Intensive operation
- Line 164: `POST /api/v1/tools/invoke` - Direct API calls
- Line 165: `GET /api/v1/tools/list` - Potentially large response
- Line 166: `GET /api/v1/categories` - Light operation
- Line 167: `GET /api/v1/metrics` - Light operation

**OAuth Configuration Endpoints Lacking Rate Limiting (tenant-oauth.ts):**
- Line 41-94: `POST /api/v1/tenants/:tenantId/integrations/:integration/oauth-config`
- Line 102-159: `GET /api/v1/tenants/:tenantId/integrations/:integration/oauth-config`
- Line 165-222: `DELETE /api/v1/tenants/:tenantId/integrations/:integration/oauth-config`
- Line 228-262: `GET /api/v1/tenants/:tenantId/integrations`

#### Distributed Rate Limiting (SCALABILITY GAP)
Rate limiters are in-memory per process (not shared across instances).

**Implication:**
- If 3 gateway instances each allow 10 req/s per integration
- Actually allows 30 req/s globally (3x the intended limit)
- Redis available but not utilized for rate limiting

---

## 2. ALL ENDPOINTS REQUIRING RATE LIMITING

### 2.1 Critical Endpoints (High Resource Usage)

| Endpoint | Method | Line | Justification | Recommended Limit |
|----------|--------|------|---------------|------------------|
| `/api/v1/tools/select` | POST | 163 | FAISS search + semantic routing + token optimization | 10 req/s per tenant |
| `/api/v1/tools/invoke` | POST | 164 | Direct integration calls, OAuth proxy overhead | 20 req/s per tenant |
| `/api/v1/tools/list` | GET | 165 | Paginated query, potential 100s of results | 5 req/s per tenant |

### 2.2 Configuration Endpoints (Vault I/O Intensive)

| Endpoint | Method | Line | Justification | Recommended Limit |
|----------|--------|------|---------------|------------------|
| POST `/tenants/{id}/integrations/{integration}/oauth-config` | POST | 41-94 | Vault write, encryption operations | 1 req/s per tenant |
| GET `/tenants/{id}/integrations/{integration}/oauth-config` | GET | 102-159 | Vault read, no caching | 10 req/s per tenant |
| DELETE `/tenants/{id}/integrations/{integration}/oauth-config` | DELETE | 165-222 | Vault delete, scheduler cancellation | 1 req/s per tenant |
| GET `/tenants/{id}/integrations` | GET | 228-262 | Vault list operation | 5 req/s per tenant |

### 2.3 Informational Endpoints (Low Resource Usage)

| Endpoint | Method | Line | Justification | Recommended Limit |
|----------|--------|------|---------------|------------------|
| `/api/v1/categories` | GET | 166 | Static list, semantic router query | 100 req/s per IP |
| `/api/v1/metrics` | GET | 167 | Cached metrics, minimal computation | 100 req/s per IP |
| `/health` | GET | 157 | Health check, external monitoring | 1000 req/s per IP |
| `/ready` | GET | 158 | Readiness probe, k8s orchestration | 1000 req/s per IP |

---

## 3. REDIS INTEGRATION ANALYSIS

### 3.1 Current Redis Usage

**File:** `/home/user/Connectors/gateway/src/caching/redis-cache.ts`

**Current Functions:**
1. Cache tool selections (24-hour TTL)
2. Cache embeddings (24-hour TTL)
3. Batch embedding retrieval

**Current Configuration:**
- Connection URL: `REDIS_URL` env var (default: `redis://localhost:6379`)
- Client Type: Redis v4 client
- Operations: SET/GET with EX (expiry), MULTI pipelines
- Health Check: PING command

**Code:**
```typescript
export class RedisCache {
  private _client: RedisClientType | null = null;
  private readonly _redisUrl: string;

  constructor(redisUrl?: string) {
    this._redisUrl = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
  }

  async connect(): Promise<void> {
    this._client = createClient({ url: this._redisUrl });
    await this._client.connect();
  }
}
```

### 3.2 Redis Availability for Rate Limiting

**Status:** ✅ **FULLY AVAILABLE**

**Dependencies in package.json:**
- `redis@^4.6.13` (Redis v4 client)
- `ioredis@^5.8.2` (Alternative Redis client)

**Why Redis is Ideal for Rate Limiting:**
1. **Atomic Operations:** INCR/DECR for counter increments
2. **Expiration:** TTL support for automatic window reset
3. **Distributed:** Shared state across gateway instances
4. **Performance:** Sub-millisecond response times
5. **Lua Scripts:** Complex rate limiting logic (sliding window, multi-counter)

### 3.3 Redis Architecture for Rate Limiting

**Recommended Schema:**

```
Key Pattern: rl:{type}:{identifier}:{window}
Examples:
  rl:global:ip:203.0.113.42:60     # Per-IP, 1-minute window
  rl:gateway:tenant:tenant-123:60   # Per-tenant, 1-minute window
  rl:endpoint:post-tools-invoke:tenant-123:60  # Per-endpoint-per-tenant
```

**Operations:**
```
SET rl:global:ip:203.0.113.42:60 0 EX 60 NX
INCR rl:global:ip:203.0.113.42:60
GET rl:global:ip:203.0.113.42:60
```

---

## 4. RECOMMENDED RATE LIMITING STRATEGY

### 4.1 Multi-Layer Approach (Recommended)

```
┌─────────────────────────────────────────────────┐
│         API Gateway (Layer 1)                   │
│  Per-IP Rate Limiting: 1000 req/s (global)     │
│  Health checks exempt (/health, /ready)        │
└────────────────┬────────────────────────────────┘
                 │
┌─────────────────▼────────────────────────────────┐
│      Tenant Authorization (Layer 2)             │
│  Extract tenantId from request context          │
│  Skip for public endpoints (/health, /ready)    │
└────────────────┬────────────────────────────────┘
                 │
┌─────────────────▼────────────────────────────────┐
│     Per-Tenant Rate Limiting (Layer 2A)         │
│  Tool Selection: 10 req/s                       │
│  Tool Invoke: 20 req/s                          │
│  OAuth Config: 1-10 req/s (varies by operation) │
└────────────────┬────────────────────────────────┘
                 │
┌─────────────────▼────────────────────────────────┐
│    Per-Endpoint Rate Limiting (Layer 2B)        │
│  POST /tools/invoke: 20 req/s per tenant        │
│  GET /tools/list: 5 req/s per tenant            │
│  POST /oauth-config: 1 req/s per tenant         │
└────────────────┬────────────────────────────────┘
                 │
┌─────────────────▼────────────────────────────────┐
│  Integration-Level Rate Limiting (Layer 3)      │
│  ALREADY IMPLEMENTED (token bucket per-process) │
│  Future: Add Redis-backed distributed limits    │
└──────────────────────────────────────────────────┘
```

### 4.2 Rate Limiting Configuration

**Tier 1: Per-IP Global Rate Limiting**
```
Default: 1000 req/s per IP address
Purpose: DDoS protection, prevent single client from overloading
Endpoints: ALL (except /health, /ready)
Storage: Redis with 2-minute window
```

**Tier 2: Per-Tenant Rate Limiting**
```
Default: 100 req/s per tenant (across all endpoints)
Purpose: Multi-tenancy fairness, prevent one tenant from starving others
Storage: Redis with 1-minute sliding window
```

**Tier 3: Per-Endpoint Per-Tenant Rate Limiting**
```
Examples:
  POST /tools/select: 10 req/s per tenant
  POST /tools/invoke: 20 req/s per tenant
  GET /tools/list: 5 req/s per tenant
  POST /oauth-config: 1 req/s per tenant
Purpose: Granular control on expensive operations
Storage: Redis with 1-minute fixed window
```

**Tier 4: Per-Integration Rate Limiting**
```
ALREADY IMPLEMENTED
Examples: GitHub 60 req/s, Notion 3 req/s, LinkedIn 100 req/s
Purpose: Respect third-party API rate limits
Storage: In-memory (per-process) - NEEDS REDIS BACKING
```

---

## 5. SPECIFIC IMPLEMENTATION APPROACH

### 5.1 Package Recommendations

**For Rate Limiting:**

1. **express-rate-limit** (RECOMMENDED for simplicity)
   - npm package: `express-rate-limit@^7.1.5`
   - Pros: Express-native, easy integration, Redis support
   - Cons: Limited to per-request keys
   
2. **redis-rate-limiter** (RECOMMENDED for advanced cases)
   - npm package: `redis-rate-limiter@^1.1.0`
   - Pros: Lua-based atomic operations, sliding window support
   - Cons: Manual integration needed
   
3. **bottleneck** (RECOMMENDED for queue management)
   - npm package: `bottleneck@^2.19.5`
   - Pros: Distributed rate limiting, priority queues, retry logic
   - Cons: More complex for simple use cases

**Recommended Stack:**
- Primary: `express-rate-limit` for gateway middleware
- Secondary: `bottleneck` for distributed limit coordination
- Storage: Existing Redis client

### 5.2 Implementation Locations

#### Gateway Level (server.ts)

**File:** `/home/user/Connectors/gateway/src/server.ts`

**Location:** Lines 113-150 (setupMiddleware method)

**Add after line 131 (after compression middleware):**

```typescript
private setupMiddleware(): void {
  // ... existing middleware ...
  
  this.app.use(compression());
  
  // ✅ NEW: Rate limiting middleware
  this.app.use(this._createGlobalRateLimiter());
  this.app.use(this._createTenantRateLimiter());
  
  // Request logging
  this.app.use((req: Request, res: Response, next: NextFunction) => {...});
}

private _createGlobalRateLimiter(): RequestHandler {
  // Per-IP rate limiting: 1000 req/s
  // Exempt health/ready endpoints
}

private _createTenantRateLimiter(): RequestHandler {
  // Per-tenant rate limiting: 100 req/s
  // Extract tenantId from context
}
```

#### Endpoint-Specific Rate Limiting (server.ts)

**Location:** Lines 155-203 (setupRoutes method)

**Before route definitions:**

```typescript
private setupRoutes(): void {
  // Create endpoint-specific limiters
  const toolSelectLimiter = this._createEndpointLimiter('tools-select', 10);
  const toolInvokeLimiter = this._createEndpointLimiter('tools-invoke', 20);
  const oauthConfigLimiter = this._createEndpointLimiter('oauth-config', 1);
  
  const apiV1 = express.Router();
  
  // ✅ NEW: Apply limiters to routes
  apiV1.post('/tools/select', toolSelectLimiter, this.handleSelectTools.bind(this));
  apiV1.post('/tools/invoke', toolInvokeLimiter, this.handleInvokeTool.bind(this));
  // ... rest of routes ...
}

private _createEndpointLimiter(endpoint: string, requestsPerSecond: number): RequestHandler {
  // Redis-backed distributed rate limiter
}
```

#### OAuth Routes (tenant-oauth.ts)

**File:** `/home/user/Connectors/gateway/src/routes/tenant-oauth.ts`

**Location:** Lines 41-262

**Add at router creation (after line 34):**

```typescript
export function createTenantOAuthRouter(vaultClient: VaultClient): Router {
  const router = Router();
  const storage = new TenantOAuthStorage(vaultClient);
  
  // ✅ NEW: Create OAuth-specific rate limiters
  const oauthConfigReadLimiter = createRateLimiter('oauth-config-read', 10);
  const oauthConfigWriteLimiter = createRateLimiter('oauth-config-write', 1);
  
  // Apply limiters to routes
  router.post(
    '/tenants/:tenantId/integrations/:integration/oauth-config',
    oauthConfigWriteLimiter,
    validateTenantAndIntegration,
    validateOAuthConfig,
    async (req, res) => { ... }
  );
}
```

#### Integration-Level Distributed Rate Limiting

**Files:** All integration files (slides-integration.ts, tasks-integration.ts, etc.)

**Current Implementation:** Token bucket in-memory

**Future Implementation:**
```typescript
// Replace in-memory token bucket with Redis-backed limiter
class IntegrationRateLimiter {
  constructor(private _redis: RedisClientType, private _integration: string) {}
  
  async acquire(tenantId: string, integrationId: string): Promise<void> {
    // Use Redis INCR with sliding window
    // Key: rl:integration:{integration}:{tenantId}:{window}
  }
}
```

---

## 6. ERROR RESPONSES AND HANDLING

### 6.1 Rate Limit Exceeded Response Format

**HTTP Status:** 429 Too Many Requests

**Response Body (JSON):**
```json
{
  "error": "Rate Limit Exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60,
  "limits": {
    "tier": "per-tenant",
    "limit": 100,
    "window": "1 minute",
    "remaining": 0,
    "resetAt": "2025-11-17T12:34:45Z"
  }
}
```

**HTTP Headers:**
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1700235285
X-RateLimit-Tenant: tenant-123
```

### 6.2 Integration with Existing Error Handling

**Location:** `/home/user/Connectors/gateway/src/errors/gateway-errors.ts`

**Add new error class:**
```typescript
export class RateLimitExceededError extends Error {
  constructor(
    message: string,
    public readonly scope: 'global' | 'tenant' | 'endpoint',
    public readonly limit: number,
    public readonly window: number,
    public readonly resetAt: Date
  ) {
    super(message);
    this.name = 'RateLimitExceededError';
  }
}
```

---

## 7. MONITORING AND METRICS

### 7.1 Metrics to Track

```typescript
interface RateLimitMetrics {
  // Per-scope metrics
  globalRequests: Counter;  // Total requests (all clients)
  globalRejected: Counter;  // Requests rejected by global limiter
  
  tenantRequests: Counter;  // Requests per tenant
  tenantRejected: Counter;  // Requests rejected per tenant
  
  endpointRequests: Counter;  // Per-endpoint requests
  endpointRejected: Counter;  // Per-endpoint rejections
  
  // Latency impact
  rateLimitCheckLatency: Histogram;  // Time spent in rate limit check
  
  // Reset tracking
  resetEventsPerHour: Counter;  // How often limits reset
}
```

### 7.2 Logging

```typescript
logger.warn('Rate limit approaching', {
  scope: 'tenant',
  tenantId: 'tenant-123',
  used: 95,
  limit: 100,
  window: '1 minute',
  resetAt: '2025-11-17T12:34:45Z'
});

logger.error('Rate limit exceeded', {
  scope: 'tenant',
  tenantId: 'tenant-123',
  endpoint: 'POST /api/v1/tools/invoke',
  timestamp: new Date().toISOString(),
  remainingWait: 32 // seconds
});
```

---

## 8. TESTING STRATEGY

### 8.1 Unit Tests

**File:** `/home/user/Connectors/gateway/tests/rate-limiting.test.ts` (NEW)

```typescript
describe('Rate Limiting', () => {
  describe('Global Rate Limiter', () => {
    it('should allow requests under limit', async () => {});
    it('should reject requests over limit', async () => {});
    it('should reset counter after window expires', async () => {});
  });

  describe('Tenant Rate Limiter', () => {
    it('should isolate tenants', async () => {});
    it('should track per-tenant quotas independently', async () => {});
  });

  describe('Endpoint-Specific Limiter', () => {
    it('should apply different limits to different endpoints', async () => {});
  });
});
```

### 8.2 Integration Tests

**File:** `/home/user/Connectors/gateway/tests/rate-limiting-integration.test.ts` (NEW)

```typescript
describe('Rate Limiting Integration', () => {
  it('should coordinate across multiple gateway instances', async () => {});
  it('should handle Redis connection loss gracefully', async () => {});
  it('should track metrics accurately', async () => {});
});
```

### 8.3 Load Tests

```bash
# Hammer single endpoint
wrk -t 12 -c 400 -d 30s --script rate_limit_test.lua http://localhost:3000/api/v1/tools/select

# Simulate multi-tenant load
for i in {1..5}; do
  TENANT_ID="tenant-$i" wrk -t 4 -c 100 -d 30s http://localhost:3000/api/v1/tools/select
done
```

---

## 9. DEPLOYMENT CONSIDERATIONS

### 9.1 Configuration (Environment Variables)

```bash
# Global Rate Limiting
RATE_LIMIT_GLOBAL_ENABLED=true
RATE_LIMIT_GLOBAL_RPS=1000           # Requests per second per IP
RATE_LIMIT_GLOBAL_WINDOW_MS=1000     # 1-second window

# Per-Tenant Rate Limiting
RATE_LIMIT_TENANT_ENABLED=true
RATE_LIMIT_TENANT_RPS=100            # Requests per second per tenant
RATE_LIMIT_TENANT_WINDOW_MS=60000    # 1-minute window

# Per-Endpoint Rate Limiting
RATE_LIMIT_ENDPOINT_TOOLS_SELECT_RPS=10
RATE_LIMIT_ENDPOINT_TOOLS_INVOKE_RPS=20
RATE_LIMIT_ENDPOINT_OAUTH_CONFIG_RPS=1

# Redis Configuration
RATE_LIMIT_REDIS_URL=redis://localhost:6379
RATE_LIMIT_KEY_PREFIX=rl:             # Redis key prefix
RATE_LIMIT_KEY_TTL=90000              # Key expiry (slightly longer than window)

# Health Check Exemptions
RATE_LIMIT_EXEMPT_PATHS=/health,/ready
```

### 9.2 Redis Deployment

```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis-data:/data
  command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 3s
    retries: 5
```

### 9.3 Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-gateway
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: gateway
        image: connectors/gateway:latest
        env:
        - name: REDIS_URL
          value: redis://redis-cluster:6379
        - name: RATE_LIMIT_GLOBAL_RPS
          value: "1000"
        - name: RATE_LIMIT_TENANT_RPS
          value: "100"
```

---

## 10. SUMMARY AND RECOMMENDATIONS

### Priority Roadmap

**Phase 1 (URGENT - Week 1):** Gateway-Level Rate Limiting
- [ ] Implement per-IP global rate limiter
- [ ] Add per-tenant rate limiter
- [ ] Add 429 response handling
- [ ] Add basic monitoring

**Phase 2 (HIGH - Week 2-3):** Per-Endpoint and Redis Backing
- [ ] Implement endpoint-specific limiters
- [ ] Migrate integration limiters to Redis
- [ ] Add comprehensive logging
- [ ] Add metrics (Prometheus)

**Phase 3 (MEDIUM - Week 4):** Advanced Features
- [ ] Sliding window implementation (Lua scripts)
- [ ] Priority queuing for critical operations
- [ ] Adaptive rate limiting based on load
- [ ] Dashboard and alerting

### Critical Gaps to Address

| Gap | Severity | Impact | Timeline |
|-----|----------|--------|----------|
| No gateway-level rate limiting | 🔴 CRITICAL | DDoS vulnerability, resource exhaustion | Week 1 |
| No per-tenant isolation | 🔴 CRITICAL | Multi-tenant fairness issues | Week 1 |
| In-memory only limits (not distributed) | 🟠 HIGH | Limits not enforced across instances | Week 2 |
| No per-endpoint granularity | 🟠 HIGH | Cannot protect expensive operations | Week 2 |
| Reactive only (429 handling) | 🟡 MEDIUM | Wastes quota on preventable requests | Week 3 |

### Key Success Metrics

- **P50 latency increase:** <5ms (rate limit check overhead)
- **False positive rate:** <0.1% (legitimate requests blocked)
- **Distributed consistency:** 99.9% accuracy across instances
- **Recovery time:** <5 seconds after limit exceeded
- **Redis uptime:** 99.99% (critical dependency)

---

## APPENDIX: File Reference Map

### Files Mentioned in This Report

```
/home/user/Connectors/gateway/
├── src/
│   ├── server.ts                          # Gateway server (lines 113-150, 155-203)
│   ├── routes/
│   │   └── tenant-oauth.ts                # OAuth routes (lines 41-262)
│   ├── auth/
│   │   ├── oauth-proxy.ts                 # OAuth handling (lines 230-248)
│   │   └── types.ts                       # Type definitions
│   ├── caching/
│   │   └── redis-cache.ts                 # Redis integration (full file)
│   ├── config/
│   │   └── integrations.ts                # Rate limit configs (lines 46-47, 210-561)
│   ├── errors/
│   │   └── oauth-errors.ts                # Error classes (lines 128-147)
│   ├── integrations/
│   │   ├── slides-integration.ts          # Token bucket impl (lines 53-94)
│   │   ├── tasks-integration.ts           # Similar pattern
│   │   └── [other integrations]
│   └── types/
│       ├── routing.types.ts               # RateLimit interface (lines 80-84)
│       └── index.ts
├── package.json                           # Dependencies (redis@^4.6.13, ioredis@^5.8.2)
└── tests/
    ├── rate-limiting.test.ts              # (NEW - unit tests)
    └── rate-limiting-integration.test.ts  # (NEW - integration tests)
```

