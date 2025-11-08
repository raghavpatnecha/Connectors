# Connectors Platform - Development Guidelines

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files, text/mds and tests to the root folder**
3. ALWAYS organize files in appropriate subdirectories
4. **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently, not just MCP

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool (Claude Code)**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

### 📁 File Organization Rules

**NEVER save to root folder. Use these directories:**
- `/gateway` - Gateway source code (forked from agentic-community)
- `/integrations` - Generated MCP servers organized by category
- `/generator` - OpenAPI → MCP generation scripts
- `/vault` - HashiCorp Vault configurations
- `/k8s` - Kubernetes manifests
- `/docs` - Documentation and research findings
- `/tests` - Test suites
- `/examples` - Example agent configurations

---

## Project Overview

**AI Agent Integration Platform** providing 500+ connectors with intelligent tool selection, achieving **95% token reduction** (1-3K tokens vs 250K traditional) through semantic routing, GraphRAG, and progressive loading.

**Core Objective:** Solve the MCP token bloat problem while enabling AI agents to efficiently use hundreds of tools simultaneously.

**Technology Stack:**
- **Languages:** TypeScript (Gateway, MCP servers), Python (Generation scripts, FastMCP)
- **Gateway:** Fork of agentic-community/mcp-gateway-registry (FAISS semantic search)
- **Secrets:** HashiCorp Vault (per-tenant OAuth credentials)
- **Graph DB:** Neo4j (GraphRAG tool relationships)
- **Vector Search:** FAISS (semantic tool discovery)
- **Container:** Docker, Docker Compose (dev), Kubernetes (prod)
- **MCP Generation:** openapi-mcp-generator, FastMCP
- **Monitoring:** Prometheus, Grafana, OpenTelemetry

---

## Architecture Overview

```
┌────────────────────────────────┐
│   AI Agent (Claude, etc.)      │
└───────────────┬────────────────┘
                │
┌───────────────▼────────────────┐
│    MCP Gateway (Enhanced)      │
│  - FAISS semantic search       │
│  - GraphRAG relationships      │
│  - Less-is-More loading        │
│  - OAuth proxy (Vault)         │
│  - Token optimization          │
└────┬───────────────────────────┘
     │
  ┌──┴──┬─────┬──────┬────────┐
  ▼     ▼     ▼      ▼        ▼
┌────┐┌────┐┌────┐┌─────┐┌──────┐
│Code││Comm││ PM ││Cloud││ Data │
│MCP ││MCP ││MCP ││ MCP ││ MCP  │
│(50)││(30)││(40)││ (80)││ (50) │
└────┘└────┘└────┘└─────┘└──────┘
```

---

## Code Style and Conventions

### TypeScript Standards

**File Naming:**
- `kebab-case` for files: `semantic-router.ts`, `oauth-proxy.ts`
- `PascalCase` for classes: `SemanticRouter`, `OAuthProxy`
- `camelCase` for functions/variables: `selectTools`, `categoryEmbeddings`
- `SCREAMING_SNAKE_CASE` for constants: `MAX_TOOLS_PER_QUERY`, `DEFAULT_TOKEN_LIMIT`

**Code Organization:**
```typescript
// 1. Imports (grouped: stdlib, external, internal)
import { promises as fs } from 'fs';
import { Index } from 'faiss-node';
import { ToolSelection } from '../types';

// 2. Constants
const MAX_TOOLS_PER_QUERY = 5;
const CATEGORY_THRESHOLD = 0.7;

// 3. Types/Interfaces
interface ToolEmbedding {
  toolId: string;
  embedding: number[];
  category: string;
}

// 4. Class/Function Implementation
export class SemanticRouter {
  private readonly _faissIndex: Index;
  private readonly _categoryEmbeddings: Map<string, number[]>;

  constructor(indexPath: string) {
    this._faissIndex = Index.read(indexPath);
    this._categoryEmbeddings = new Map();
  }

  async selectTools(query: string, maxTools: number = MAX_TOOLS_PER_QUERY): Promise<ToolSelection[]> {
    // Implementation
  }
}
```

**Naming Conventions:**
- Private fields: `_fieldName` (underscore prefix)
- Readonly fields: `readonly` keyword
- Async functions: Always return `Promise<T>`
- Boolean variables: `is`, `has`, `should` prefix
- Arrays: Plural nouns (`tools`, `categories`)

### Python Standards (Generation Scripts)

**File Naming:**
- `snake_case` for files: `openapi_generator.py`, `mcp_validator.py`
- `PascalCase` for classes: `OpenAPIGenerator`, `MCPValidator`
- `snake_case` for functions/variables: `generate_mcp_server`, `openapi_spec`
- `SCREAMING_SNAKE_CASE` for constants: `MAX_OPERATIONS_PER_SERVER`, `OUTPUT_DIR`

**Code Organization:**
```python
"""Module docstring explaining purpose."""

# 1. Imports (stdlib, external, internal)
import asyncio
from pathlib import Path
from typing import Dict, List, Optional

import yaml
from openapi_core import Spec

from .validators import validate_spec
from .templates import MCPTemplate

# 2. Constants
MAX_OPERATIONS_PER_SERVER = 100
DEFAULT_TIMEOUT = 30

# 3. Type Definitions
class GenerationConfig:
    """Configuration for MCP generation."""
    spec_path: Path
    output_dir: Path
    category: str

# 4. Implementation
class OpenAPIGenerator:
    """Generates MCP servers from OpenAPI specs."""

    def __init__(self, config: GenerationConfig):
        self.config = config
        self._spec: Optional[Spec] = None

    async def generate(self) -> Path:
        """Generate MCP server from OpenAPI spec."""
        spec = await self._load_spec()
        validated = validate_spec(spec)
        server = self._create_server(validated)
        return self._write_output(server)
```

---

## Architecture-Specific Guidelines

### 1. Gateway Implementation (TypeScript)

**Semantic Router Pattern:**
```typescript
// gateway/src/routing/semantic-router.ts

export class SemanticRouter {
  private readonly _faissIndex: FAISSIndex;
  private readonly _categoryEmbeddings: Map<string, number[]>;
  private readonly _graphRAG: GraphRAGService;
  private readonly _tokenOptimizer: TokenOptimizer;

  /**
   * Two-level tool selection: category → tools
   * Implements Tool-to-Agent retrieval (19.4% better accuracy)
   */
  async selectTools(query: string, context: QueryContext): Promise<ToolSelection[]> {
    // Step 1: Category selection (coarse-grained)
    const categories = await this._selectCategories(query, 3);

    // Step 2: Tool selection within categories (fine-grained)
    const tools = await this._selectWithinCategories(categories, query, 5);

    // Step 3: GraphRAG enhancement (tool relationships)
    const enhanced = await this._graphRAG.enhanceWithRelationships(tools, context);

    // Step 4: Token optimization
    return this._tokenOptimizer.optimize(enhanced, context.tokenBudget);
  }

  private async _selectCategories(query: string, maxCategories: number): Promise<string[]> {
    const embedding = await this._embedQuery(query);
    const results = this._faissIndex.search(embedding, maxCategories);
    return results.filter(r => r.score > CATEGORY_THRESHOLD).map(r => r.category);
  }
}
```

**GraphRAG Integration (Neo4j):**
```typescript
// gateway/src/graph/graphrag-service.ts

export class GraphRAGService {
  private readonly _neo4j: Driver;

  async enhanceWithRelationships(tools: Tool[], context: QueryContext): Promise<Tool[]> {
    const session = this._neo4j.session();
    try {
      // Find related tools via relationship graph
      const query = `
        MATCH (t:Tool)-[:OFTEN_USED_WITH|:DEPENDS_ON*1..2]-(related:Tool)
        WHERE t.id IN $toolIds
        AND related.category IN $categories
        RETURN DISTINCT related
        ORDER BY related.usageCount DESC
        LIMIT 3
      `;

      const result = await session.run(query, {
        toolIds: tools.map(t => t.id),
        categories: context.allowedCategories
      });

      return this._mergeResults(tools, result.records);
    } finally {
      await session.close();
    }
  }
}
```

**Less-is-More Progressive Loading:**
```typescript
// gateway/src/optimization/progressive-loader.ts

export class ProgressiveLoader {
  /**
   * Three-tier progressive schema loading
   * Tier 1: Essential tools (immediate)
   * Tier 2: Contextual tools (on-demand)
   * Tier 3: Full tools (lazy)
   */
  async loadTiered(tools: Tool[], context: QueryContext): Promise<TieredToolSet> {
    // Tier 1: Minimal schema (name, description only)
    const tier1 = tools.slice(0, 3).map(t => ({
      name: t.name,
      description: t.description
    }));

    // Tier 2: Medium schema (+ parameters, no examples)
    const tier2 = tools.slice(3, 8).map(t => ({
      ...t,
      parameters: t.parameters,
      examples: [] // Omit examples
    }));

    // Tier 3: Full schema (lazy loaded)
    const tier3 = tools.slice(8).map(t => ({
      id: t.id,
      loadUrl: `/tools/${t.id}/full-schema`
    }));

    return { tier1, tier2, tier3, totalTokens: this._calculateTokens(tier1, tier2) };
  }
}
```

### 2. MCP Server Generation (Python)

**Auto-Generation from OpenAPI:**
```python
# generator/openapi_generator.py

class OpenAPIToMCP:
    """Converts OpenAPI specs to MCP servers."""

    async def generate(self, spec_path: Path, category: str) -> Path:
        """
        Generate MCP server from OpenAPI spec.

        Quality Requirements:
        - Max 100 operations per server (split if needed)
        - OAuth config must be valid
        - All required parameters documented
        - Rate limits extracted from spec
        """
        spec = await self._load_and_validate_spec(spec_path)

        # Check if we need to split (>100 operations)
        if len(spec.operations) > MAX_OPERATIONS_PER_SERVER:
            return await self._generate_split_servers(spec, category)

        # Generate single server
        mcp_config = self._create_mcp_config(spec, category)
        oauth_config = await self._extract_oauth_config(spec)

        # Use template to generate TypeScript MCP server
        server_code = self._render_template(mcp_config, oauth_config)

        # Write output
        output_path = Path(f"integrations/{category}/{spec.info.title.lower()}")
        await self._write_server(output_path, server_code)

        # Generate tests
        await self._generate_tests(output_path, spec)

        return output_path
```

**Validation Requirements:**
```python
# generator/validators.py

async def validate_generated_mcp(server_path: Path) -> ValidationResult:
    """
    Validate generated MCP server meets quality standards.

    Checks:
    1. TypeScript compiles without errors
    2. All tool definitions have descriptions
    3. OAuth configuration is valid
    4. Rate limit handling implemented
    5. Error responses properly typed
    6. Integration tests pass
    """
    results = await asyncio.gather(
        check_typescript_compilation(server_path),
        check_tool_descriptions(server_path),
        check_oauth_config(server_path),
        check_rate_limits(server_path),
        run_integration_tests(server_path)
    )

    return ValidationResult(
        passed=all(r.success for r in results),
        errors=[r.error for r in results if not r.success]
    )
```

### 3. OAuth Implementation (HashiCorp Vault)

**Credential Storage:**
```typescript
// gateway/src/auth/vault-client.ts

export class VaultClient {
  private readonly _client: VaultAPI;
  private readonly _transitEngine: string = 'transit';

  /**
   * Store OAuth credentials with per-tenant encryption.
   *
   * Security Requirements:
   * - Credentials encrypted with tenant-specific key
   * - Tokens stored in KV v2 with versioning
   * - Automatic rotation on expiry
   * - Audit logging enabled
   */
  async storeCredentials(tenantId: string, integration: string, creds: OAuthCredentials): Promise<void> {
    // Encrypt with tenant-specific key
    const encrypted = await this._client.write(
      `${this._transitEngine}/encrypt/${tenantId}`,
      { plaintext: Buffer.from(JSON.stringify(creds)).toString('base64') }
    );

    // Store in KV v2 with metadata
    await this._client.write(
      `secret/data/${tenantId}/${integration}`,
      {
        data: {
          access_token: encrypted.data.ciphertext,
          refresh_token: encrypted.data.ciphertext,
          expires_at: creds.expiresAt,
          scopes: creds.scopes
        },
        metadata: {
          created_by: 'oauth-proxy',
          integration,
          auto_refresh: true
        }
      }
    );

    // Schedule auto-refresh
    await this._scheduleRefresh(tenantId, integration, creds.expiresAt);
  }

  /**
   * Auto-refresh service: Background job checking expiring tokens
   */
  private async _scheduleRefresh(tenantId: string, integration: string, expiresAt: Date): Promise<void> {
    const refreshTime = new Date(expiresAt.getTime() - 5 * 60 * 1000); // 5 min before expiry

    await this._scheduler.schedule({
      runAt: refreshTime,
      job: async () => {
        const creds = await this.getCredentials(tenantId, integration);
        const refreshed = await this._oauthClient.refresh(creds);
        await this.storeCredentials(tenantId, integration, refreshed);
      }
    });
  }
}
```

**OAuth Proxy Pattern:**
```typescript
// gateway/src/auth/oauth-proxy.ts

export class OAuthProxy {
  /**
   * Transparent OAuth injection for all integration requests.
   * MCP servers don't handle auth - gateway does it.
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    const { tenantId, integration, method, path, body } = req;

    // 1. Get valid credentials from Vault (auto-refreshed)
    const creds = await this._vault.getCredentials(tenantId, integration);

    // 2. Inject auth header
    const headers = {
      ...req.headers,
      'Authorization': `Bearer ${creds.accessToken}`
    };

    // 3. Forward to MCP server
    const response = await this._mcpClient.call(integration, {
      method,
      path,
      headers,
      body
    });

    // 4. Handle auth errors (token expired despite refresh)
    if (response.status === 401) {
      const refreshed = await this._forceRefresh(tenantId, integration);
      return this.proxyRequest({ ...req, _retry: true });
    }

    return response;
  }
}
```

---

## Error Handling Standards

### Gateway Errors
```typescript
// gateway/src/errors/gateway-errors.ts

export class ToolSelectionError extends Error {
  constructor(
    message: string,
    public readonly query: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'ToolSelectionError';
  }
}

export class OAuthError extends Error {
  constructor(
    message: string,
    public readonly integration: string,
    public readonly tenantId: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

// Usage
try {
  const tools = await router.selectTools(query, context);
} catch (error) {
  if (error instanceof ToolSelectionError) {
    logger.error('Tool selection failed', {
      query: error.query,
      cause: error.cause?.message
    });
    // Fallback: return top 5 popular tools for category
    return await fallbackToolSelector.getTopTools(context.primaryCategory, 5);
  }
  throw error;
}
```

### MCP Server Errors
```typescript
// integrations/code/github/src/error-handler.ts

export async function handleGitHubAPIError(error: GitHubAPIError): Promise<never> {
  // Rate limit handling
  if (error.status === 429) {
    const resetTime = error.headers['x-ratelimit-reset'];
    throw new RateLimitError(
      `GitHub rate limit exceeded. Resets at ${new Date(resetTime * 1000)}`,
      { resetTime, remaining: 0 }
    );
  }

  // Auth errors
  if (error.status === 401 || error.status === 403) {
    throw new OAuthError(
      'GitHub authentication failed - token may be expired',
      'github',
      'unknown' // Tenant ID injected by gateway
    );
  }

  // Generic API error
  throw new MCPError(`GitHub API error: ${error.message}`, {
    status: error.status,
    endpoint: error.endpoint
  });
}
```

---

## Testing Standards

### Gateway Tests (Jest + Supertest)
```typescript
// gateway/tests/semantic-router.test.ts

describe('SemanticRouter', () => {
  let router: SemanticRouter;
  let mockFAISS: jest.Mocked<FAISSIndex>;
  let mockGraphRAG: jest.Mocked<GraphRAGService>;

  beforeEach(() => {
    mockFAISS = createMockFAISSIndex();
    mockGraphRAG = createMockGraphRAG();
    router = new SemanticRouter(mockFAISS, mockGraphRAG);
  });

  describe('selectTools', () => {
    it('should select tools using two-level retrieval', async () => {
      // Arrange
      const query = 'create a pull request on GitHub';
      const context = { allowedCategories: ['code'], tokenBudget: 2000 };

      mockFAISS.search.mockResolvedValueOnce([
        { category: 'code', score: 0.92 }
      ]);

      mockFAISS.search.mockResolvedValueOnce([
        { toolId: 'github.createPullRequest', score: 0.95 },
        { toolId: 'github.mergePullRequest', score: 0.78 }
      ]);

      // Act
      const result = await router.selectTools(query, context);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].toolId).toBe('github.createPullRequest');
      expect(mockFAISS.search).toHaveBeenCalledTimes(2); // Category + Tool
      expect(mockGraphRAG.enhanceWithRelationships).toHaveBeenCalled();
    });

    it('should handle category selection failure with fallback', async () => {
      mockFAISS.search.mockRejectedValueOnce(new Error('FAISS index corrupted'));

      await expect(router.selectTools('test query', {}))
        .rejects.toThrow(ToolSelectionError);
    });

    it('should respect token budget in tool selection', async () => {
      const result = await router.selectTools('complex query', { tokenBudget: 500 });

      const totalTokens = result.reduce((sum, tool) => sum + tool.tokenCost, 0);
      expect(totalTokens).toBeLessThanOrEqual(500);
    });
  });
});
```

### Integration Tests (Generated MCPs)
```typescript
// integrations/code/github/tests/integration.test.ts

describe('GitHub MCP Integration', () => {
  let mcpServer: MCPServer;
  let mockOAuthProxy: jest.Mocked<OAuthProxy>;

  beforeAll(async () => {
    mockOAuthProxy = createMockOAuthProxy();
    mcpServer = await startMCPServer({ oauthProxy: mockOAuthProxy });
  });

  afterAll(async () => {
    await mcpServer.stop();
  });

  describe('createPullRequest tool', () => {
    it('should create PR with OAuth credentials injected', async () => {
      // Arrange
      const input = {
        repo: 'owner/repo',
        title: 'Test PR',
        head: 'feature',
        base: 'main',
        body: 'Description'
      };

      mockOAuthProxy.proxyRequest.mockResolvedValueOnce({
        status: 201,
        data: { number: 123, url: 'https://github.com/owner/repo/pull/123' }
      });

      // Act
      const result = await mcpServer.callTool('createPullRequest', input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.number).toBe(123);
      expect(mockOAuthProxy.proxyRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/repos/owner/repo/pulls',
          integration: 'github'
        })
      );
    });

    it('should handle rate limit with proper error', async () => {
      mockOAuthProxy.proxyRequest.mockRejectedValueOnce(
        new RateLimitError('Rate limit exceeded', { resetTime: Date.now() + 3600000 })
      );

      await expect(mcpServer.callTool('createPullRequest', {}))
        .rejects.toThrow(RateLimitError);
    });
  });
});
```

### Test Coverage Requirements
- **Gateway:** 85%+ coverage (critical path: tool selection, OAuth, GraphRAG)
- **MCP Servers:** 70%+ coverage (focus on OAuth handling, error cases)
- **Generation Scripts:** 75%+ coverage (validation, template rendering)

---

## Logging Standards

### Gateway Logging (Structured)
```typescript
// gateway/src/logging/logger.ts

import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'mcp-gateway' },
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Usage
logger.info('Tool selection completed', {
  query: 'create PR',
  selectedTools: ['github.createPR', 'github.mergePR'],
  tokenCost: 1250,
  latency: 45
});

logger.error('OAuth refresh failed', {
  integration: 'github',
  tenantId: 'tenant-123',
  error: error.message,
  stack: error.stack
});
```

### Performance Logging
```typescript
// Log critical performance metrics
logger.info('tool_selection_performance', {
  query,
  categories_found: categories.length,
  tools_selected: tools.length,
  faiss_latency_ms: faissLatency,
  graphrag_latency_ms: graphLatency,
  total_latency_ms: totalLatency,
  token_reduction_pct: ((250000 - tokenCost) / 250000) * 100
});
```

---

## Performance Guidelines

### Token Optimization
- **Target:** 95% token reduction (1-3K vs 250K)
- **Measurement:** Log token usage for every query
- **Optimization:** Progressive loading, minimal schemas

### Latency Targets
- **Tool Selection:** <100ms (FAISS + GraphRAG)
- **OAuth Token Fetch:** <50ms (Vault cached)
- **MCP Tool Call:** <500ms (integration dependent)
- **Total Request:** <2s (end-to-end)

### Caching Strategy
```typescript
// gateway/src/caching/redis-cache.ts

export class ToolSelectionCache {
  private readonly _redis: Redis;

  async getCached(query: string, context: QueryContext): Promise<ToolSelection[] | null> {
    const key = this._generateKey(query, context);
    const cached = await this._redis.get(key);

    if (cached) {
      logger.debug('Tool selection cache hit', { query, key });
      return JSON.parse(cached);
    }

    return null;
  }

  async setCached(query: string, context: QueryContext, tools: ToolSelection[]): Promise<void> {
    const key = this._generateKey(query, context);
    await this._redis.setex(key, 3600, JSON.stringify(tools)); // 1 hour TTL
  }
}
```

---

## Security Guidelines

### Secrets Management
- **NEVER** commit credentials, API keys, or tokens to git
- **ALWAYS** use HashiCorp Vault for credential storage
- **ALWAYS** use per-tenant encryption keys
- Environment variables only for non-sensitive config

### OAuth Security
- Tokens encrypted at rest (Vault transit engine)
- Tokens transmitted over TLS only
- Auto-rotation before expiry (5 min buffer)
- Audit logging for all credential access

### API Security
- Rate limiting per tenant (Redis-backed)
- Input validation on all MCP tool calls
- SQL injection prevention (parameterized queries for GraphRAG)
- XSS prevention (sanitize descriptions from OpenAPI specs)

---

## Docker & Kubernetes

### Development (Docker Compose)
```yaml
# docker-compose.yml

version: '3.8'
services:
  gateway:
    build: ./gateway
    ports:
      - "3000:3000"
    environment:
      - VAULT_ADDR=http://vault:8200
      - NEO4J_URI=bolt://neo4j:7687
      - REDIS_URL=redis://redis:6379
    depends_on:
      - vault
      - neo4j
      - redis

  vault:
    image: hashicorp/vault:latest
    cap_add:
      - IPC_LOCK
    environment:
      - VAULT_DEV_ROOT_TOKEN_ID=dev-token
      - VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200

  neo4j:
    image: neo4j:5
    environment:
      - NEO4J_AUTH=neo4j/password
    ports:
      - "7474:7474"
      - "7687:7687"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Category MCP Servers
  mcp-code:
    build: ./integrations/code
    environment:
      - GATEWAY_URL=http://gateway:3000
```

### Production (Kubernetes)
```yaml
# k8s/gateway-deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mcp-gateway
  template:
    metadata:
      labels:
        app: mcp-gateway
    spec:
      containers:
      - name: gateway
        image: connectors/gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: VAULT_ADDR
          value: "http://vault:8200"
        - name: NEO4J_URI
          valueFrom:
            secretKeyRef:
              name: neo4j-creds
              key: uri
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## Git Workflow

### Branch Naming
- `feature/[issue-number]-short-description` - New features
- `fix/[issue-number]-short-description` - Bug fixes
- `refactor/component-name` - Refactoring
- `docs/topic` - Documentation
- `test/component-name` - Test improvements

### Commit Messages
```
type(scope): short description

Longer description if needed

- Bullet points for details
- Another detail

Refs: #123
```

**Types:** `feat`, `fix`, `refactor`, `test`, `docs`, `perf`, `chore`
**Scopes:** `gateway`, `mcp-gen`, `oauth`, `graphrag`, `cache`, `k8s`

**Examples:**
- `feat(gateway): add Less-is-More progressive loading`
- `fix(oauth): handle token refresh race condition`
- `perf(faiss): optimize category embedding search`
- `test(mcp-gen): add validation tests for OpenAPI generator`

### Pull Request Guidelines
1. **Title:** Clear, descriptive (follows commit message format)
2. **Description:**
   - What changed and why
   - How to test
   - Screenshots/logs if relevant
3. **Tests:** All tests passing, coverage maintained
4. **Review:** At least 1 approval required
5. **CI:** All checks passing (lint, typecheck, tests, build)

---

## Project-Specific Rules

### Integration Generation
1. **Max 100 operations per MCP server** - Split larger APIs
2. **OAuth config required** - No hardcoded credentials
3. **Rate limit handling** - All servers must respect API limits
4. **Error typing** - All error responses properly typed
5. **Integration tests** - Generated tests must pass

### Gateway Enhancement
1. **FAISS index updates** - Rebuild index when categories change
2. **GraphRAG updates** - Update Neo4j when usage patterns change
3. **Token measurement** - Log token usage for every query
4. **Backward compatibility** - Don't break existing MCP clients

### Tool Selection
1. **Two-level retrieval** - Category → Tools (not flat)
2. **GraphRAG enhancement** - Always check relationships
3. **Progressive loading** - Use tiered schemas
4. **Token budget** - Respect context limits

### OAuth Management
1. **Auto-refresh** - Always schedule refresh before expiry
2. **Tenant isolation** - Per-tenant encryption keys
3. **Audit logging** - Log all credential access
4. **Graceful degradation** - Fallback if Vault unavailable

---

## 🚀 Claude-Flow Integration

### Agent Coordination for Platform Development

**Use Claude Code's Task tool for ALL agent spawning:**

```javascript
// ✅ CORRECT: Spawn multiple agents concurrently
[Single Message]:
  Task("Gateway Developer", "Implement GraphRAG integration with Neo4j", "backend-dev")
  Task("MCP Generator", "Create OpenAPI to MCP generation script", "coder")
  Task("OAuth Engineer", "Setup HashiCorp Vault with auto-refresh", "security-manager")
  Task("Test Engineer", "Write integration tests for GitHub MCP", "tester")
  Task("DevOps", "Setup K8s manifests with auto-scaling", "cicd-engineer")

  TodoWrite { todos: [
    {content: "Implement GraphRAG service", status: "in_progress"},
    {content: "Create MCP generation pipeline", status: "pending"},
    {content: "Setup Vault OAuth flow", status: "pending"},
    {content: "Write integration tests", status: "pending"},
    {content: "Deploy K8s cluster", status: "pending"}
  ]}
```

### Available Agents
`backend-dev`, `coder`, `tester`, `reviewer`, `security-manager`, `cicd-engineer`, `system-architect`, `ml-developer`, `api-docs`

---

## Quick Reference

**Critical Metrics:**
- Token Reduction: 95% (1-3K vs 250K)
- Tool Selection Latency: <100ms
- Integration Coverage: 500+ tools
- Uptime Target: 99.9%

**Technology Stack:**
- Gateway: TypeScript, FAISS, GraphRAG, Redis
- MCP Servers: TypeScript (generated from OpenAPI)
- Auth: HashiCorp Vault (per-tenant encryption)
- Graph: Neo4j (tool relationships)
- Container: Docker, Kubernetes
- Monitoring: Prometheus, Grafana

**Key Repositories:**
- Gateway: Fork of agentic-community/mcp-gateway-registry
- Generation: openapi-mcp-generator, FastMCP
- Sources: APIs.guru, official OpenAPI specs

---

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
Never save working files, text/mds and tests to the root folder.
ALWAYS use concurrent/parallel operations in a single message.
