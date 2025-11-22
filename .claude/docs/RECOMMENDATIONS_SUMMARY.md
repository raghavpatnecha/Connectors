# Connectors Platform - Code Review Recommendations Summary

**Date:** November 22, 2024  
**Scope:** Prioritized action items from deep code review  
**Status:** Ready for implementation planning

---

## QUICK REFERENCE

### Critical Issues (Fix Immediately)
- [ ] OAuth token refresh race condition
- [ ] Missing error handling in async handlers
- [ ] Unhandled promise rejections in route handlers

### High Priority (Next Sprint)
- [ ] Create comprehensive environment variables documentation
- [ ] Implement input parameter validation middleware
- [ ] Create circuit breaker for Vault failures
- [ ] Add distributed lock for OAuth refresh

### Medium Priority (Short-term)
- [ ] Update token reduction percentage claims
- [ ] Make configuration thresholds environment variables
- [ ] Add missing integration counts
- [ ] Create Neo4j schema documentation

### Low Priority (Long-term)
- [ ] Add JSDoc comments to all public methods
- [ ] Implement request streaming for large responses
- [ ] Add comprehensive integration tests
- [ ] Add distributed tracing (OpenTelemetry)

---

## DETAILED RECOMMENDATIONS

### 1. CRITICAL FIXES

#### 1.1 OAuth Token Refresh Race Condition

**Problem:**
```typescript
// CURRENT: vulnerable to race condition
async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
  const creds = await this.vaultClient.getCredentials(...);
  
  if (isTokenExpired(creds)) {
    // BUG: Multiple concurrent requests can both refresh here
    const newCreds = await this.refreshToken(creds.refreshToken);
    await this.vaultClient.storeCredentials(newCreds);
  }
  
  // Make request with token
}
```

**Solution:**
```typescript
// FIXED: with distributed lock
private async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
  const creds = await this.vaultClient.getCredentials(...);
  
  if (isTokenExpired(creds)) {
    const lockKey = `oauth-refresh:${req.tenantId}:${req.integration}`;
    const lockAcquired = await this.redis.set(
      lockKey,
      '1',
      'EX',  // Expire after
      10,    // 10 seconds (refresh should take <5s)
      'NX'   // Only set if not exists
    );
    
    if (lockAcquired) {
      try {
        // This request got the lock, perform refresh
        const newCreds = await this.refreshToken(creds.refreshToken);
        await this.vaultClient.storeCredentials(newCreds);
        creds = newCreds;
      } finally {
        // Always release lock
        await this.redis.del(lockKey);
      }
    } else {
      // Another request is refreshing, wait and retry
      await this.waitForTokenUpdate(req.tenantId, req.integration, 5000);
      creds = await this.vaultClient.getCredentials(...);
    }
  }
  
  // Make request with token
  return this.makeRequest(req, creds);
}

private async waitForTokenUpdate(
  tenantId: string,
  integration: string,
  maxWait: number
): Promise<void> {
  const startTime = Date.now();
  const checkInterval = 100; // ms
  
  while (Date.now() - startTime < maxWait) {
    const stillLocked = await this.redis.exists(
      `oauth-refresh:${tenantId}:${integration}`
    );
    if (!stillLocked) return;
    await sleep(checkInterval);
  }
  
  throw new Error('Token refresh timeout');
}
```

**Effort:** 2-4 hours  
**Impact:** Prevents Vault spam and token conflicts  
**File:** `gateway/src/auth/oauth-proxy.ts`

---

#### 1.2 Missing Error Handling in Async Handlers

**Problem:**
```typescript
// CURRENT: unhandled promise rejections possible
app.post('/api/v1/tools/select', async (req: Request, res: Response) => {
  const { query, context } = req.body;
  // No try-catch: if semanticRouter.selectTools() throws,
  // it's an unhandled promise rejection
  const tools = await this.semanticRouter.selectTools(query, context);
  res.sendSuccess({ tools });
});
```

**Solution:**
```typescript
// FIXED: with proper error handling
private async handleSelectTools(req: Request, res: Response): Promise<void> {
  try {
    const { query, context } = req.body;
    
    if (!query || typeof query !== 'string') {
      res.sendError('INVALID_QUERY', 'Query is required and must be a string');
      return;
    }
    
    const queryContext: QueryContext = {
      allowedCategories: context?.allowedCategories || [],
      tokenBudget: context?.tokenBudget || 5000,
      tenantId: context?.tenantId,
    };
    
    const tools = await this.semanticRouter.selectTools(query, queryContext);
    const optimized = this.tokenOptimizer.optimize(tools, queryContext.tokenBudget);
    const tiered = await this.progressiveLoader.loadTiered(optimized, queryContext.tokenBudget);
    
    res.sendSuccess({
      query,
      tools: tiered,
      performance: {
        totalTools: tools.length,
        tokenUsage: tiered.totalTokens,
      }
    });
  } catch (error) {
    // Specific error handling
    if (error instanceof ToolSelectionError) {
      logger.error('Tool selection failed', {
        query: error.query,
        error: error.message,
      });
      res.sendError(
        'TOOL_SELECTION_FAILED',
        error.message,
        { query: error.query },
        500
      );
    } else if (error instanceof ValidationError) {
      logger.warn('Invalid tool selection request', { error: error.message });
      res.sendError(
        'VALIDATION_ERROR',
        error.message,
        undefined,
        400
      );
    } else {
      // Generic error handler
      logger.error('Unexpected error in tool selection', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.sendError(
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        undefined,
        500
      );
    }
  }
}
```

**Effort:** 2-3 hours  
**Impact:** Prevents unhandled promise rejections  
**Files:** 
- `gateway/src/server.ts` (all route handlers)
- `gateway/src/routes/tenant-oauth.ts`
- `gateway/src/routes/mcp-management.ts`

---

#### 1.3 Unvalidated OAuth Configuration

**Problem:**
```typescript
// CURRENT: No validation of OAuth config structure
router.post('/tenants/:tenantId/integrations/:integration/oauth-config',
  async (req: Request, res: Response) => {
    const config = req.body; // Could be anything!
    await storage.storeTenantOAuthConfig(tenantId, integration, config);
    res.sendSuccess({ message: 'Stored' });
  }
);
```

**Solution:**
```typescript
// FIXED: with schema validation
import { z } from 'zod';

const OAuthConfigSchema = z.object({
  clientId: z.string().min(1, 'clientId required'),
  clientSecret: z.string().min(1, 'clientSecret required'),
  redirectUri: z.string().url('redirectUri must be valid URL'),
  scopes: z.array(z.string()).optional(),
  tokenUrl: z.string().url().optional(),
  authUrl: z.string().url().optional(),
});

const validateOAuthConfig = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = OAuthConfigSchema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.sendError(
        'VALIDATION_ERROR',
        'Invalid OAuth configuration',
        { errors: error.errors },
        400
      );
    } else {
      next(error);
    }
  }
};

router.post(
  '/tenants/:tenantId/integrations/:integration/oauth-config',
  validateOAuthConfig,
  async (req: Request, res: Response) => {
    // config is now validated
    const config = req.body;
    await storage.storeTenantOAuthConfig(tenantId, integration, config);
    res.sendSuccess({ message: 'OAuth config stored' });
  }
);
```

**Effort:** 1-2 hours  
**Impact:** Prevents invalid data reaching Vault  
**Files:** `gateway/src/routes/tenant-oauth.ts`, `gateway/src/server.ts`

---

### 2. HIGH PRIORITY IMPROVEMENTS

#### 2.1 Create Environment Variable Documentation

**Current State:** Environment variables scattered across code comments  
**Target:** Comprehensive reference guide

**Create File:** `docs/02-guides/configuration.md`

**Content:**
```markdown
# Gateway Configuration Guide

All environment variables with defaults, descriptions, and examples.

## Core Gateway Configuration

### PORT
- **Default:** 3000
- **Description:** Port the gateway listens on
- **Example:** PORT=8080

### NODE_ENV
- **Default:** development
- **Description:** Runtime environment
- **Values:** development | production | test
- **Example:** NODE_ENV=production

### CORS_ORIGINS
- **Default:** *
- **Description:** Comma-separated list of allowed CORS origins
- **Example:** CORS_ORIGINS=https://app.mycompany.com,https://api.mycompany.com

## FAISS Vector Search

### CATEGORY_INDEX_PATH
- **Default:** data/indices/categories.faiss
- **Description:** Path to FAISS category index
- **Example:** CATEGORY_INDEX_PATH=/var/lib/connectors/categories.faiss

### TOOL_INDEX_PATH
- **Default:** data/indices/tools.faiss
- **Description:** Path to FAISS tool index
- **Example:** TOOL_INDEX_PATH=/var/lib/connectors/tools.faiss

## OpenAI Embeddings

### OPENAI_API_KEY
- **Default:** None (required)
- **Description:** OpenAI API key for embeddings
- **Example:** OPENAI_API_KEY=sk-proj-...

### EMBEDDING_MODEL
- **Default:** text-embedding-3-small
- **Description:** OpenAI embedding model
- **Values:** text-embedding-3-small | text-embedding-3-large
- **Example:** EMBEDDING_MODEL=text-embedding-3-small

## Redis Cache

### REDIS_URL
- **Default:** redis://localhost:6379
- **Description:** Redis connection URL
- **Example:** REDIS_URL=redis://redis.default:6379

### REDIS_PASSWORD
- **Default:** None
- **Description:** Redis password (if required)
- **Example:** REDIS_PASSWORD=mypassword

### REDIS_DB
- **Default:** 0
- **Description:** Redis database number
- **Example:** REDIS_DB=1

## HashiCorp Vault

### VAULT_ADDR
- **Default:** http://localhost:8200
- **Description:** Vault server address
- **Example:** VAULT_ADDR=https://vault.company.com

### VAULT_TOKEN
- **Default:** dev-token
- **Description:** Vault authentication token
- **Note:** Use Kubernetes auth in production
- **Example:** VAULT_TOKEN=s.xxxxx

### VAULT_TRANSIT_ENGINE
- **Default:** transit
- **Description:** Name of Vault transit engine
- **Example:** VAULT_TRANSIT_ENGINE=transit

### VAULT_KV_ENGINE
- **Default:** secret
- **Description:** Name of Vault KV engine
- **Example:** VAULT_KV_ENGINE=secret

## Neo4j Graph Database

### NEO4J_URI
- **Default:** bolt://localhost:7687
- **Description:** Neo4j connection URI
- **Example:** NEO4J_URI=bolt+s://neo4j.company.com:7687

### NEO4J_USERNAME
- **Default:** neo4j
- **Description:** Neo4j username
- **Example:** NEO4J_USERNAME=neo4j

### NEO4J_PASSWORD
- **Default:** None (required)
- **Description:** Neo4j password
- **Example:** NEO4J_PASSWORD=mypassword

## MCP Server Configuration

### MCP_BASE_URL
- **Default:** http://localhost:4000
- **Description:** Base URL for MCP servers
- **Example:** MCP_BASE_URL=http://mcp-orchestrator:3000

## Rate Limiting

### RATE_LIMIT_GLOBAL_ENABLED
- **Default:** true
- **Description:** Enable global rate limiting
- **Example:** RATE_LIMIT_GLOBAL_ENABLED=true

### RATE_LIMIT_GLOBAL_RPS
- **Default:** 100
- **Description:** Global requests per second
- **Example:** RATE_LIMIT_GLOBAL_RPS=1000

### RATE_LIMIT_TENANT_ENABLED
- **Default:** true
- **Description:** Enable per-tenant rate limiting
- **Example:** RATE_LIMIT_TENANT_ENABLED=true

### RATE_LIMIT_TENANT_RPS
- **Default:** 10
- **Description:** Per-tenant requests per second
- **Example:** RATE_LIMIT_TENANT_RPS=50

### RATE_LIMIT_ENDPOINT_ENABLED
- **Default:** true
- **Description:** Enable endpoint-specific rate limiting
- **Example:** RATE_LIMIT_ENDPOINT_ENABLED=true

## Semantic Routing

### SEMANTIC_ROUTING_CATEGORY_THRESHOLD
- **Default:** 0.7
- **Description:** Minimum relevance score for category selection
- **Example:** SEMANTIC_ROUTING_CATEGORY_THRESHOLD=0.65

### SEMANTIC_ROUTING_TOOL_THRESHOLD
- **Default:** 0.5
- **Description:** Minimum relevance score for tool selection
- **Example:** SEMANTIC_ROUTING_TOOL_THRESHOLD=0.45

### SEMANTIC_ROUTING_MAX_CATEGORIES
- **Default:** 3
- **Description:** Maximum categories to select
- **Example:** SEMANTIC_ROUTING_MAX_CATEGORIES=5

### SEMANTIC_ROUTING_MAX_TOOLS
- **Default:** 5
- **Description:** Maximum tools to select per query
- **Example:** SEMANTIC_ROUTING_MAX_TOOLS=10

## Token Optimization

### TOKEN_BUDGET_DEFAULT
- **Default:** 5000
- **Description:** Default token budget for queries
- **Example:** TOKEN_BUDGET_DEFAULT=3000

## Logging

### LOG_LEVEL
- **Default:** info
- **Description:** Log level
- **Values:** error | warn | info | debug | verbose
- **Example:** LOG_LEVEL=debug

### LOG_FORMAT
- **Default:** json
- **Description:** Log format
- **Values:** json | text
- **Example:** LOG_FORMAT=json

## Example .env Files

### Development
```
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
REDIS_URL=redis://localhost:6379
VAULT_ADDR=http://localhost:8200
NEO4J_URI=bolt://localhost:7687
RATE_LIMIT_GLOBAL_ENABLED=false
```

### Production
```
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
REDIS_URL=redis://redis.production:6379
REDIS_PASSWORD=<secure-password>
VAULT_ADDR=https://vault.company.com
VAULT_TOKEN=<kubernetes-auth-token>
NEO4J_URI=bolt+s://neo4j.company.com:7687
NEO4J_PASSWORD=<secure-password>
RATE_LIMIT_GLOBAL_ENABLED=true
RATE_LIMIT_GLOBAL_RPS=1000
RATE_LIMIT_TENANT_RPS=100
```
```

**Effort:** 2-3 hours  
**Impact:** Enables proper configuration by DevOps

---

#### 2.2 Make Configuration Thresholds Environment Variables

**Current State:** Hardcoded in code
**Target:** Fully configurable via env vars

**Changes Required:**

```typescript
// gateway/src/config/semantic-routing-config.ts (NEW FILE)
export interface SemanticRoutingConfig {
  categoryThreshold: number;
  toolThreshold: number;
  maxCategories: number;
  maxToolsPerQuery: number;
  cacheEnabled: boolean;
  cacheTTL: number;
}

export function loadSemanticRoutingConfig(): SemanticRoutingConfig {
  return {
    categoryThreshold: parseFloat(
      process.env.SEMANTIC_ROUTING_CATEGORY_THRESHOLD || '0.7'
    ),
    toolThreshold: parseFloat(
      process.env.SEMANTIC_ROUTING_TOOL_THRESHOLD || '0.5'
    ),
    maxCategories: parseInt(
      process.env.SEMANTIC_ROUTING_MAX_CATEGORIES || '3'
    ),
    maxToolsPerQuery: parseInt(
      process.env.SEMANTIC_ROUTING_MAX_TOOLS || '5'
    ),
    cacheEnabled: process.env.SEMANTIC_ROUTING_CACHE_ENABLED !== 'false',
    cacheTTL: parseInt(
      process.env.SEMANTIC_ROUTING_CACHE_TTL || '3600'
    ), // 1 hour
  };
}
```

**Update:** `gateway/src/routing/semantic-router.ts`
```typescript
import { loadSemanticRoutingConfig } from '../config/semantic-routing-config';

export class SemanticRouter {
  private readonly config: SemanticRoutingConfig;
  
  constructor(
    categoryIndexPath: string,
    toolIndexPath: string,
    embeddingService: EmbeddingService,
    cache?: RedisCache,
    config?: SemanticRoutingConfig
  ) {
    this.config = config || loadSemanticRoutingConfig();
    // Now use this.config.categoryThreshold instead of hardcoded 0.7
  }
  
  async selectTools(query: string, context: QueryContext): Promise<ToolSelection[]> {
    // Use configurable thresholds
    const categories = await this._selectCategories(
      query,
      this.config.maxCategories,
      this.config.categoryThreshold
    );
    // ...
  }
}
```

**Effort:** 3-4 hours  
**Impact:** Enables tuning without code changes

---

#### 2.3 Implement Circuit Breaker for Vault

**Problem:** Vault failures cascade to all OAuth operations

**Solution:** Implement circuit breaker pattern

```typescript
// gateway/src/auth/vault-circuit-breaker.ts
export class VaultCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  
  private readonly failureThreshold = 5;
  private readonly successThreshold = 2;
  private readonly timeout = 60000; // 60s

  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else if (fallback) {
        logger.warn('Vault circuit breaker OPEN, using fallback');
        return fallback();
      } else {
        throw new VaultCircuitBreakerOpenError('Vault circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      
      if (fallback && this.state !== 'CLOSED') {
        logger.warn('Vault operation failed, using fallback', { error });
        return fallback();
      }
      
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        logger.info('Vault circuit breaker CLOSED');
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;
    
    if (this.failureCount >= this.failureThreshold) {
      logger.error('Vault circuit breaker OPEN');
      this.state = 'OPEN';
      this.successCount = 0;
    }
  }
}
```

**Usage in oauth-proxy.ts:**
```typescript
async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
  try {
    // Try Vault first
    const creds = await this.vaultCircuitBreaker.execute(
      () => this.vaultClient.getCredentials(req.tenantId, req.integration),
      () => this.getFromInMemoryCache(req.tenantId, req.integration)
    );
    
    // Rest of logic...
  } catch (error) {
    // Handle error
  }
}
```

**Effort:** 4-6 hours  
**Impact:** Prevents cascading failures

---

### 3. MEDIUM PRIORITY IMPROVEMENTS

#### 3.1 Update Documentation Claims

**Action Items:**

1. **File:** `docs/README.md` line 3
   - **Change:** "99% Token Reduction" → "Up to 99% Token Reduction"
   - **Reason:** More accurate; typical cases achieve 95-99%

2. **File:** `docs/index.md` line 126
   - **Change:** "4 Integrations Operational" → "15 Integrations Operational"
   - **Reason:** Code shows 14-15 integrations implemented

3. **File:** `docs/03-architecture/index.md` line 28
   - **Change:** "<1ms tool selection" → "<100ms tool selection"
   - **Reason:** Actual latency is 50-100ms, not <1ms

4. **Add new section:** `docs/03-architecture/performance.md`
   - Document actual latency measurements
   - Include timing breakdowns
   - Link to monitoring guide

**Effort:** 1-2 hours  
**Impact:** Improves accuracy and trust

---

#### 3.2 Create Neo4j Schema Documentation

**Create File:** `docs/03-architecture/neo4j-schema.md`

**Content:**
```markdown
# GraphRAG Neo4j Schema

## Node Types

### Tool Node
```
(tool:Tool {
  id: string,           // e.g., "github.createPullRequest"
  name: string,         // e.g., "Create Pull Request"
  description: string,  // Tool description
  category: string,     // e.g., "code", "comms"
  integration: string,  // e.g., "github", "slack"
  usageCount: int,      // Number of times tool was used
  relevanceScore: float, // ML-based relevance
  tags: [string],       // e.g., ["vcs", "automation"]
  tokenCost: int        // Estimated token cost
})
```

### Category Node
```
(category:Category {
  name: string,         // e.g., "code", "comms"
  description: string,  // Category description
  toolCount: int,       // Number of tools in category
  avgUsageCount: float  // Average usage
})
```

## Relationship Types

### OFTEN_USED_WITH (Tool → Tool)
```
(tool1)-[r:OFTEN_USED_WITH {
  confidence: float,     // Likelihood of co-occurrence
  count: int,           // Number of times used together
  lastUpdated: datetime
}]->(tool2)

Example:
(github.createPullRequest)-[r:OFTEN_USED_WITH {confidence: 0.85}]->(github.mergePullRequest)
```

### DEPENDS_ON (Tool → Tool)
```
(tool1)-[r:DEPENDS_ON {
  required: boolean,    // True if required
  description: string
}]->(tool2)

Example:
(slack.uploadFile)-[r:DEPENDS_ON {required: false}]->(slack.postMessage)
```

### BELONGS_TO (Tool → Category)
```
(tool)-[r:BELONGS_TO]->(category)

Example:
(github.createPullRequest)-[r:BELONGS_TO]->(code)
```

## Query Examples

### Find all related tools for a given tool
```cypher
MATCH (t:Tool {id: "github.createPullRequest"})-[:OFTEN_USED_WITH*1..2]-(related:Tool)
RETURN DISTINCT related
ORDER BY related.usageCount DESC
LIMIT 10
```

### Find tools in a category
```cypher
MATCH (cat:Category {name: "code"})<-[:BELONGS_TO]-(tool:Tool)
RETURN tool
ORDER BY tool.usageCount DESC
LIMIT 20
```

### Find tools by tag
```cypher
MATCH (tool:Tool)
WHERE "vcs" IN tool.tags
RETURN tool
LIMIT 10
```

## Maintenance

### Update Frequency
- Node properties: Updated on integration change
- Relationship weights: Updated daily from usage analytics
- New tools: Added when integration added
- Deprecated tools: Marked with deprecation_date

### Index Strategy
```cypher
CREATE INDEX ON :Tool(id);
CREATE INDEX ON :Tool(category);
CREATE INDEX ON :Category(name);
```

## Performance Considerations

- Queries typically complete in 20-40ms
- 2-hop traversal recommended (3+ hops becomes expensive)
- Cache relationship results in Redis for 1 hour
```

**Effort:** 2-3 hours  
**Impact:** Enables developers to extend graph

---

#### 3.3 Add Comprehensive Integration Tests

**Create File:** `gateway/tests/integration/tool-invocation.integration.test.ts`

```typescript
import supertest from 'supertest';
import { MCPGatewayServer } from '../../src/server';

describe('Tool Invocation Integration Tests', () => {
  let server: MCPGatewayServer;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    server = new MCPGatewayServer();
    await server.initialize();
    request = supertest(server.app);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  describe('Tool Selection + Invocation Flow', () => {
    it('should select tools and invoke one successfully', async () => {
      // 1. Select tools
      const selectRes = await request
        .post('/api/v1/tools/select')
        .set('Authorization', `Bearer ${TEST_API_KEY}`)
        .send({
          query: 'create a GitHub pull request',
          context: { tokenBudget: 2000 }
        })
        .expect(200);

      expect(selectRes.body.success).toBe(true);
      expect(selectRes.body.tools.tier1.length).toBeGreaterThan(0);

      // Find GitHub tool
      const githubTool = selectRes.body.tools.tier1.find(
        (t: any) => t.toolId.startsWith('github.')
      );
      expect(githubTool).toBeDefined();

      // 2. Invoke selected tool
      const invokeRes = await request
        .post('/api/v1/tools/invoke')
        .set('Authorization', `Bearer ${TEST_API_KEY}`)
        .send({
          toolId: githubTool.toolId,
          integration: 'github',
          tenantId: TEST_TENANT_ID,
          parameters: {
            repo: 'test/repo',
            title: 'Test PR',
            head: 'feature',
            base: 'main'
          }
        })
        .expect(200);

      expect(invokeRes.body.success).toBe(true);
      expect(invokeRes.body.result).toBeDefined();
    });

    it('should handle OAuth token refresh during invocation', async () => {
      // Setup: Create expired token in Vault
      const tenantId = 'oauth-test-tenant';
      const expiredCreds = {
        access_token: 'expired_token',
        refresh_token: 'valid_refresh_token',
        expires_at: Date.now() - 1000 // Already expired
      };
      
      await vaultClient.storeCredentials(tenantId, 'github', expiredCreds);

      // Mock OAuth refresh endpoint
      nock('https://github.com')
        .post('/login/oauth/access_token')
        .reply(200, {
          access_token: 'new_token',
          token_type: 'bearer',
          expires_in: 3600
        });

      // Invoke tool - should trigger refresh
      const invokeRes = await request
        .post('/api/v1/tools/invoke')
        .send({
          toolId: 'github.createPullRequest',
          integration: 'github',
          tenantId,
          parameters: { repo: 'test/repo', title: 'Test' }
        })
        .expect(200);

      expect(invokeRes.body.success).toBe(true);
      
      // Verify new token stored in Vault
      const updatedCreds = await vaultClient.getCredentials(tenantId, 'github');
      expect(updatedCreds.access_token).toBe('new_token');
    });

    it('should handle rate limiting correctly', async () => {
      const requests = [];
      
      // Send 15 rapid requests (above rate limit)
      for (let i = 0; i < 15; i++) {
        requests.push(
          request
            .post('/api/v1/tools/select')
            .set('Authorization', `Bearer ${TEST_API_KEY}`)
            .send({
              query: 'test query',
              context: {}
            })
        );
      }

      const results = await Promise.all(requests);
      
      // Some should succeed, some should be rate limited
      const successCount = results.filter(r => r.status === 200).length;
      const rateLimitedCount = results.filter(r => r.status === 429).length;
      
      expect(successCount).toBeGreaterThan(0);
      expect(rateLimitedCount).toBeGreaterThan(0);
    });

    it('should fail gracefully when Vault is unavailable', async () => {
      // Simulate Vault unavailability
      await vaultClient.disconnect();

      const invokeRes = await request
        .post('/api/v1/tools/invoke')
        .set('Authorization', `Bearer ${TEST_API_KEY}`)
        .send({
          toolId: 'github.createPullRequest',
          integration: 'github',
          tenantId: TEST_TENANT_ID,
          parameters: { repo: 'test/repo', title: 'Test' }
        });

      // Should fail with proper error
      expect([503, 500]).toContain(invokeRes.status);
      expect(invokeRes.body.success).toBe(false);

      // Reconnect Vault for other tests
      await vaultClient.reconnect();
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle concurrent tool selection requests', async () => {
      const queries = [
        'create a GitHub PR',
        'post to Slack',
        'create Jira issue',
        'send email'
      ];

      const requests = queries.map(query =>
        request
          .post('/api/v1/tools/select')
          .set('Authorization', `Bearer ${TEST_API_KEY}`)
          .send({ query, context: {} })
      );

      const results = await Promise.all(requests);

      results.forEach(res => {
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });
    });

    it('should handle concurrent tool invocations with OAuth refresh lock', async () => {
      const toolId = 'github.createPullRequest';
      const parameters = { repo: 'test/repo', title: 'Test' };

      // Send 3 concurrent requests with same expired token
      const requests = [1, 2, 3].map(() =>
        request
          .post('/api/v1/tools/invoke')
          .send({
            toolId,
            integration: 'github',
            tenantId: TEST_TENANT_ID,
            parameters
          })
      );

      const results = await Promise.all(requests);

      // All should succeed (one does refresh, others wait for it)
      results.forEach(res => {
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      });

      // Verify refresh only happened once (check Vault call count)
      // This would require spying on Vault client
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid query', async () => {
      const res = await request
        .post('/api/v1/tools/select')
        .set('Authorization', `Bearer ${TEST_API_KEY}`)
        .send({ query: '' }); // Empty query

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_QUERY');
    });

    it('should return 401 for missing OAuth credentials', async () => {
      const res = await request
        .post('/api/v1/tools/invoke')
        .send({
          toolId: 'unknown-integration.tool',
          integration: 'unknown-integration',
          tenantId: 'test-tenant',
          parameters: {}
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('OAUTH_CREDENTIALS_NOT_FOUND');
    });

    it('should return 503 when FAISS indices unavailable', async () => {
      // Simulate FAISS unavailability
      semanticRouter.disable();

      const res = await request
        .post('/api/v1/tools/select')
        .set('Authorization', `Bearer ${TEST_API_KEY}`)
        .send({ query: 'test' });

      expect(res.status).toBe(503);
      expect(res.body.error.code).toBe('SERVICE_NOT_READY');

      // Re-enable for other tests
      semanticRouter.enable();
    });
  });
});
```

**Effort:** 6-8 hours  
**Impact:** Ensures reliability of critical paths

---

### 4. LOW PRIORITY IMPROVEMENTS

#### 4.1 Add JSDoc Comments

**Template:**
```typescript
/**
 * Selects relevant tools using semantic routing with FAISS.
 *
 * Implements two-level retrieval (category → tools) for optimal performance:
 * 1. Category selection using FAISS L2 distance metric
 * 2. Tool selection within selected categories
 * 3. GraphRAG enhancement to find related tools
 * 4. Token optimization to respect budgets
 *
 * @param query - Natural language query (e.g., "create a GitHub PR")
 * @param context - Query context including allowed categories and token budget
 * @returns Promise resolving to array of ToolSelection objects ranked by relevance
 * @throws ToolSelectionError if embedding API fails or FAISS index unavailable
 *
 * @example
 * const tools = await router.selectTools("create a GitHub PR", {
 *   allowedCategories: ["code"],
 *   tokenBudget: 2000
 * });
 *
 * @see https://docs.connectors.dev/architecture/semantic-routing
 */
async selectTools(query: string, context: QueryContext): Promise<ToolSelection[]>
```

**Effort:** 8-12 hours  
**Impact:** Improves developer experience

---

#### 4.2 Implement Request Streaming

**Scenario:** Tool list API returns thousands of tools

```typescript
// Current: Loads all tools into memory
app.get('/api/v1/tools/list', async (req, res) => {
  const tools = await semanticRouter.listAllTools();
  res.json({ tools }); // Could be 100MB+ in memory
});

// Improved: Streams tools
app.get('/api/v1/tools/stream', async (req, res) => {
  res.setHeader('Content-Type', 'application/x-ndjson');
  
  const cursor = await semanticRouter.createToolsCursor();
  
  for await (const tool of cursor) {
    res.write(JSON.stringify(tool) + '\n');
  }
  
  res.end();
});
```

**Effort:** 4-6 hours  
**Impact:** Enables scalability for large tool lists

---

#### 4.3 Add Distributed Tracing

**Implementation:**
```typescript
import { NodeTracerProvider } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger-http';

const tracing = require('@opentelemetry/auto-instrumentations-node');

const provider = new NodeTracerProvider();
provider.addSpanProcessor(
  new tracing.BatchSpanProcessor(
    new JaegerExporter({
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces'
    })
  )
);

tracing.registerInstrumentations();

// Now all requests automatically traced through:
// Gateway → Vault → Neo4j → OpenAI, etc.
```

**Effort:** 4-6 hours  
**Impact:** Enables observability across system

---

## IMPLEMENTATION TIMELINE

### Sprint 1 (Current)
- [ ] OAuth token refresh race condition fix (4h)
- [ ] Async handler error handling (3h)
- [ ] Input validation middleware (2h)
- **Total:** ~9 hours

### Sprint 2
- [ ] Environment variable documentation (3h)
- [ ] Make thresholds configurable (4h)
- [ ] Vault circuit breaker (6h)
- [ ] Distributed lock implementation (3h)
- **Total:** ~16 hours

### Sprint 3
- [ ] Update documentation claims (2h)
- [ ] Neo4j schema documentation (3h)
- [ ] Integration tests (8h)
- **Total:** ~13 hours

### Long-term (Next Quarter)
- [ ] JSDoc comments (12h)
- [ ] Request streaming (6h)
- [ ] Distributed tracing (6h)
- [ ] Additional optimization opportunities

---

## SUCCESS METRICS

### Code Quality
- [ ] 0 unhandled promise rejections in production
- [ ] All async handlers have error handling (100%)
- [ ] All inputs validated against schema
- [ ] All environment variables documented

### Reliability
- [ ] OAuth refresh race conditions eliminated
- [ ] Vault unavailability doesn't cascade (circuit breaker)
- [ ] <5 minute recovery time for service failures
- [ ] 99.5% uptime target

### Performance
- [ ] Tool selection latency: <100ms (P95)
- [ ] Tool invocation: <500ms without refresh, <1000ms with refresh
- [ ] Cache hit rate: >50% for queries
- [ ] No memory leaks (weekly verification)

### Operational
- [ ] All configuration via environment variables
- [ ] Documentation complete and accurate
- [ ] Runbooks for common failure scenarios
- [ ] Monitoring dashboards set up

---

**End of Recommendations Summary**

For detailed implementation guidance, see:
- `DEEP_CODE_REVIEW.md` - Comprehensive analysis
- `REQUEST_FLOW_DIAGRAMS.md` - Visual documentation
- Code files referenced in each section
