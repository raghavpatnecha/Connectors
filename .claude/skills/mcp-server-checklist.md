# MCP Server Integration Checklist

Comprehensive validation checklist for adding new MCP servers to the Connectors Platform.

---

## 📋 Pre-Integration Planning

### 1. Integration Analysis
- [ ] **API Documentation Review**: Reviewed official API docs and OpenAPI spec
- [ ] **Authentication Method**: Identified auth type (OAuth 2.0, API key, Bearer token)
- [ ] **Rate Limits**: Documented API rate limits (requests per hour/day)
- [ ] **Tool Count Estimation**: Estimated number of tools/endpoints (<100 per server)
- [ ] **Category Classification**: Assigned to category (code, communication, productivity, documents, search, storage)
- [ ] **Integration Type**: Determined type (custom-built, official remote, or direct API)

### 2. Naming Conventions
- [ ] **Integration ID**: Lowercase, no spaces (e.g., `producthunt`, `github`, `linkedin`)
- [ ] **Display Name**: Proper capitalization (e.g., "Product Hunt", "GitHub", "LinkedIn")
- [ ] **Tool ID Format**: `{integration}.{toolName}` (e.g., `producthunt.getPostDetails`)
- [ ] **Port Assignment**: Assigned unique port (3000-3999 range, check docker-compose.yml)

---

## 🏗️ MCP Server Implementation

### 3. Server Code Structure
- [ ] **Directory Created**: `/integrations/{category}/{integration}-unified/`
- [ ] **Main Server File**: `src/index.ts` or generated from OpenAPI
- [ ] **Package.json**: Dependencies (FastMCP, axios, etc.), build scripts
- [ ] **TypeScript Config**: tsconfig.json with proper compilation settings
- [ ] **Environment Variables**: Documented in .env.example
- [ ] **README**: Integration-specific documentation

### 4. Tool Definitions
- [ ] **Tool Schemas**: All tools have proper JSON schemas for parameters
- [ ] **Descriptions**: Clear, concise descriptions for each tool (1-2 sentences)
- [ ] **Parameter Validation**: Required vs optional parameters clearly defined
- [ ] **Return Types**: Response schemas documented
- [ ] **Error Handling**: Proper error types and messages
- [ ] **Examples**: Usage examples for complex tools

### 5. Authentication Implementation
- [ ] **Auth Type**: Correctly implemented (OAuth, API key, Bearer token)
- [ ] **Credential Injection**: Gateway handles auth injection (NOT in MCP server)
- [ ] **Token Refresh**: Auto-refresh logic if using OAuth (handled by gateway)
- [ ] **Vault Integration**: Credentials stored in HashiCorp Vault
- [ ] **Per-Tenant Isolation**: Credentials encrypted per tenant

### 6. Rate Limiting
- [ ] **Rate Limiter Class**: Implemented token bucket or sliding window algorithm
- [ ] **Configurable Limits**: Rate limits from environment variables
- [ ] **Throttling Logic**: Proper wait/retry logic when limit reached
- [ ] **Rate Limit Headers**: Respect API's rate limit headers
- [ ] **Logging**: Rate limit events logged for monitoring

---

## 🔌 Gateway Integration

### 7. Gateway Adapter Creation
- [ ] **File Created**: `/gateway/src/integrations/{integration}-integration.ts`
- [ ] **Pattern Followed**: Copied from similar integration (reddit-integration.ts, notion-integration.ts)
- [ ] **Class Structure**: Proper class name `{Integration}Integration`
- [ ] **Dependencies**: OAuthProxy, SemanticRouter injected via constructor
- [ ] **Rate Limiter**: Integration-specific rate limiter instantiated
- [ ] **Server URL**: Configurable via environment variable

### 8. Integration Registry Registration
- [ ] **Import Added**: Import statement in `/gateway/src/config/integrations.ts`
- [ ] **Factory Import**: `create{Integration}Integration` function imported
- [ ] **Registration Method**: `_register{Integration}()` method created
- [ ] **Metadata Complete**: All IntegrationMetadata fields populated
  - id, name, category, description
  - enabled, serverUrl, rateLimit
  - requiresOAuth, oauthProvider, docsUrl
- [ ] **Instance Creation**: Integration instance created and stored in `_instances` Map
- [ ] **Initialize Call**: `this._register{Integration}()` added to `initialize()` method
- [ ] **Logging**: Registration logged with metadata

### 9. Tool Embeddings Registration
- [ ] **Method Created**: `_registerToolEmbeddings()` or `_index{Integration}Tools()`
- [ ] **ToolEmbedding Format**: Correct structure:
  ```typescript
  {
    toolId: 'integration.toolName',
    embedding: [],
    category: 'category',
    metadata: {
      name: 'Display Name',
      description: 'Tool description',
      usageCount: 0
    }
  }
  ```
- [ ] **All Tools Registered**: Every MCP server tool has corresponding embedding
- [ ] **Semantic Router**: Tools registered with `semanticRouter.addToolEmbedding()`
- [ ] **Logging**: Tool count logged after registration

### 10. Error Mapping
- [ ] **Error Map Created**: HTTP status codes mapped to user-friendly messages
- [ ] **Rate Limit Errors**: 429 errors properly handled with RateLimitError
- [ ] **Auth Errors**: 401/403 mapped to OAuthError or AuthenticationError
- [ ] **Not Found**: 404 errors handled gracefully
- [ ] **Server Errors**: 500+ errors logged with details
- [ ] **Timeout Handling**: Request timeouts configured and handled

### 11. Request Handling
- [ ] **handleRequest Method**: Implements `handleRequest(req: MCPRequest): Promise<MCPResponse>`
- [ ] **Rate Limiting Applied**: `await this._rateLimiter.acquire()`
- [ ] **OAuth Proxy Used**: Requests proxied through `_oauthProxy.proxyRequest()`
- [ ] **Integration Field**: Request includes `integration: '{integration}'`
- [ ] **Error Mapping**: Errors caught and mapped via `_map{Integration}Error()`
- [ ] **Logging**: Request/response logged with duration, status, tenant

### 12. Health Check
- [ ] **Health Check Method**: `healthCheck(): Promise<boolean>` implemented
- [ ] **Endpoint**: Hits MCP server `/health` endpoint
- [ ] **Timeout**: Configured timeout (default 10s)
- [ ] **State Tracking**: `_isHealthy` flag maintained
- [ ] **Initialize Call**: Health check called during `initialize()`
- [ ] **Logging**: Health check results logged

### 13. Status Method
- [ ] **Status Method**: `getStatus()` returns integration status
- [ ] **Fields Returned**: enabled, healthy, serverUrl, rateLimit, availableTokens
- [ ] **Real-time Data**: Rate limiter tokens calculated dynamically

---

## 🐳 Docker Configuration

### 14. Docker Compose Service
- [ ] **Service Added**: Entry in `/docker-compose.yml`
- [ ] **Service Name**: `mcp-{integration}` (e.g., `mcp-producthunt`)
- [ ] **Build Context**: Correct path `./integrations/{category}/{integration}-unified`
- [ ] **Container Name**: `connectors-mcp-{integration}`
- [ ] **Port Mapping**: Unique port mapped (e.g., `"3140:3000"`)
- [ ] **Environment Variables**:
  - `INTEGRATION={integration}`
  - Auth credentials (if needed)
  - Rate limit config
- [ ] **Network**: Connected to default network
- [ ] **Dependencies**: Depends on vault/redis if needed
- [ ] **Health Check**: Docker health check configured (optional)

### 15. Docker Testing
- [ ] **Build Success**: `docker compose build mcp-{integration}` succeeds
- [ ] **Container Starts**: `docker compose up mcp-{integration}` starts without errors
- [ ] **Health Endpoint**: `curl http://localhost:{port}/health` returns 200 OK
- [ ] **Logs Clean**: No errors in `docker compose logs mcp-{integration}`

---

## 📊 API Response Standards

### 16. Response Format Consistency
- [ ] **Success Response**: Standard `{ success: true, data: {...} }` format
- [ ] **Error Response**: Standard `{ success: false, error: {...} }` format
- [ ] **Status Codes**: Proper HTTP status codes (200, 201, 400, 401, 404, 429, 500)
- [ ] **Error Details**: Errors include `message`, `code`, `integration` fields
- [ ] **Pagination**: Consistent pagination format if applicable (limit, offset, total)
- [ ] **Timestamps**: ISO 8601 format for all timestamps
- [ ] **Field Naming**: camelCase for JSON fields

### 17. MCP Protocol Compliance
- [ ] **Request Format**: Follows MCP request structure
- [ ] **Response Format**: Follows MCP response structure
- [ ] **Tool Listing**: `/tools/list` endpoint works
- [ ] **Tool Invocation**: `/tools/call` endpoint works
- [ ] **Error Format**: MCP error format for tool failures

---

## 📚 Documentation Updates

### 18. Main README.md
- [ ] **Server Count**: Updated total MCP server count
- [ ] **Tool Count**: Updated total tool count
- [ ] **Category Table**: Integration added to correct category row
- [ ] **Integration Type**: Explained architecture type (custom-built, official remote, direct API)
- [ ] **Badges**: Updated badges if counts changed
- [ ] **Description**: Brief mention in key features or quick start

### 19. Getting Started Docs
- [ ] **docs/01-getting-started/index.md**: Server count and tool count updated
- [ ] **docs/01-getting-started/quick-start.md**: Example updated if needed
- [ ] **Integration Types Section**: Correctly categorized

### 20. Integration Documentation
- [ ] **Category Index**: `/docs/04-integrations/{category}/index.md` updated
- [ ] **Integration Guide**: `/docs/04-integrations/{category}/{integration}.md` created
  - Overview and features
  - Authentication setup
  - Available tools (full list)
  - Usage examples
  - Rate limits and quotas
  - Common errors and troubleshooting
- [ ] **Main Integrations Index**: `/docs/04-integrations/index.md` updated with new integration

### 21. Architecture Docs
- [ ] **docs/03-architecture/index.md**: Integration mentioned if architecturally significant
- [ ] **Integration Types**: Correctly classified (custom-built vs official remote vs direct API)
- [ ] **Diagrams**: Updated if integration adds new patterns

### 22. API Reference
- [ ] **Endpoint Documentation**: API endpoints documented if integration adds new ones
- [ ] **Tool Selection Examples**: Examples include new integration's tools
- [ ] **Error Codes**: Integration-specific error codes documented

---

## 🧪 Testing & Validation

### 23. TypeScript Compilation
- [ ] **Gateway Compiles**: `cd gateway && npm run typecheck` passes
- [ ] **MCP Server Compiles**: `cd integrations/{category}/{integration}-unified && npm run build` succeeds
- [ ] **No Type Errors**: Zero TypeScript errors related to integration
- [ ] **Linting**: `npm run lint` passes for both gateway and MCP server

### 24. Unit Tests
- [ ] **Rate Limiter Tests**: Rate limiter logic tested
- [ ] **Error Mapping Tests**: Error mapping function tested
- [ ] **Tool Embedding Tests**: Tool registration tested
- [ ] **Health Check Tests**: Health check logic tested

### 25. Integration Tests
- [ ] **Server Startup**: Integration initializes without errors
- [ ] **Tool Selection**: Semantic router finds integration's tools
  ```bash
  curl -X POST http://localhost:3000/api/v1/tools/select \
    -d '{"query": "use {integration} to...", "context": {"maxTools": 5}}'
  ```
- [ ] **Tool Invocation**: Can invoke tools successfully
  ```bash
  curl -X POST http://localhost:3000/api/v1/tools/invoke \
    -d '{"toolId": "{integration}.{tool}", "tenantId": "test", "parameters": {...}}'
  ```
- [ ] **Health Check**: Gateway can check MCP server health
  ```bash
  curl http://localhost:3000/api/v1/integrations/{integration}/health
  ```
- [ ] **Rate Limiting**: Rate limits enforced correctly
- [ ] **Error Handling**: Errors properly caught and mapped

### 26. End-to-End Tests
- [ ] **OAuth Flow**: Complete OAuth flow tested if applicable
- [ ] **API Call**: Real API call succeeds (use test/sandbox credentials)
- [ ] **Multi-Tenant**: Different tenants isolated correctly
- [ ] **Token Refresh**: Token auto-refresh works (OAuth integrations)
- [ ] **Concurrent Requests**: Multiple requests handled correctly

### 27. Performance Tests
- [ ] **Latency**: Tool selection <100ms average
- [ ] **Throughput**: Can handle expected load (requests per second)
- [ ] **Memory**: No memory leaks during extended use
- [ ] **Rate Limit Accuracy**: Rate limiting accurate within 5%

---

## 🚀 Deployment Preparation

### 28. Environment Configuration
- [ ] **.env.example**: All required env vars documented with examples
- [ ] **Default Values**: Sensible defaults for all optional env vars
- [ ] **Secrets**: No secrets committed to git (use Vault)
- [ ] **Port Conflicts**: No port conflicts with existing services

### 29. Monitoring & Observability
- [ ] **Logging**: Structured JSON logging with proper levels
- [ ] **Metrics**: Key metrics logged (request count, latency, errors)
- [ ] **Tracing**: Request IDs for distributed tracing
- [ ] **Health Endpoints**: Both MCP server and gateway have health checks
- [ ] **Alerts**: Consider what alerts needed for production

### 30. Security Review
- [ ] **Credentials**: Never in code, only in Vault
- [ ] **Injection Prevention**: No SQL/Cypher injection vulnerabilities
- [ ] **XSS Prevention**: User input sanitized
- [ ] **Rate Limiting**: Protects against abuse
- [ ] **HTTPS**: Production uses TLS
- [ ] **Audit Logging**: Sensitive operations logged

---

## ✅ Pre-Commit Checklist

### 31. Code Quality
- [ ] **No TODOs**: All TODO comments resolved or documented
- [ ] **No Console.logs**: Debug logs removed or converted to proper logger
- [ ] **No Hardcoded Values**: All config from environment variables
- [ ] **Comments**: Complex logic documented
- [ ] **Type Safety**: No `any` types without justification
- [ ] **Error Handling**: All promises handled, no unhandled rejections

### 32. Git Hygiene
- [ ] **Branch Named**: `feature/add-{integration}-integration` or similar
- [ ] **Commits Logical**: Each commit is atomic and logical
- [ ] **Commit Messages**: Follow conventional commits format
  ```
  feat(integrations): add Product Hunt MCP server integration

  - Create Product Hunt MCP server with 11 tools
  - Add gateway adapter with rate limiting and error mapping
  - Register in IntegrationRegistry
  - Add tool embeddings for semantic routing
  - Update documentation (README, integration docs)

  Closes #123
  ```
- [ ] **No Merge Conflicts**: Branch rebased on latest main
- [ ] **CI Passes**: All CI checks passing (if configured)

### 33. Documentation Review
- [ ] **README Accurate**: Main README reflects new integration
- [ ] **Integration Count**: Correct count in all docs
- [ ] **Tool Count**: Correct total tool count
- [ ] **Examples Work**: All code examples tested and working
- [ ] **Links Valid**: All documentation links work
- [ ] **Typos**: Spell-checked all new documentation

---

## 🎯 Post-Merge Tasks

### 34. Verification
- [ ] **Pull Latest**: Pull latest main branch
- [ ] **Clean Build**: `docker compose build --no-cache mcp-{integration}`
- [ ] **Integration Test**: Run full integration test suite
- [ ] **Smoke Test**: Basic smoke test in staging environment

### 35. Monitoring
- [ ] **Logs**: Monitor logs for errors/warnings
- [ ] **Metrics**: Check metrics dashboard for anomalies
- [ ] **Health**: Verify health checks passing
- [ ] **Performance**: Confirm latency within acceptable range

### 36. Communication
- [ ] **Changelog**: Add entry to CHANGELOG.md
- [ ] **Release Notes**: Include in next release notes
- [ ] **Team Notification**: Notify team of new integration
- [ ] **User Documentation**: Update user-facing docs if needed

---

## 📝 Quick Reference

### File Checklist Summary
```
✅ Created/Modified Files:
├── integrations/{category}/{integration}-unified/
│   ├── src/index.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
├── gateway/src/integrations/{integration}-integration.ts
├── gateway/src/config/integrations.ts (modified)
├── docker-compose.yml (modified)
├── README.md (modified)
├── docs/01-getting-started/index.md (modified)
├── docs/04-integrations/{category}/{integration}.md
└── docs/04-integrations/index.md (modified)
```

### Common Pitfalls
⚠️ **Watch out for:**
- Incorrect ToolEmbedding format (name/description in metadata, not top-level)
- Missing integration registration call in IntegrationRegistry.initialize()
- Port conflicts in docker-compose.yml
- Hardcoded credentials in code
- Not following existing patterns from similar integrations
- Forgetting to update tool/server counts in documentation
- Type safety bypasses (using `as any`)
- Missing error mapping for integration-specific errors

### Integration Patterns Reference
**OAuth Integration**: Follow `linkedin-integration.ts` or `reddit-integration.ts`
**API Key Integration**: Follow `producthunt-integration.ts`
**Official Remote**: Follow `notion-integration.ts`
**Google Workspace**: Follow any `{service}-integration.ts` in Google category

---

## 🏆 Success Criteria

Your integration is complete when:
1. ✅ TypeScript compiles with zero errors
2. ✅ Docker container builds and starts successfully
3. ✅ Health check returns 200 OK
4. ✅ Tool selection finds your tools via semantic routing
5. ✅ Tool invocation successfully calls the API
6. ✅ Documentation updated and accurate
7. ✅ All tests passing
8. ✅ No security vulnerabilities
9. ✅ Rate limiting works correctly
10. ✅ Team reviewed and approved

---

**Note**: This checklist is comprehensive but flexible. Some items may not apply to all integrations (e.g., OAuth for API-key-only integrations). Use judgment and consult existing integrations for patterns.

**Last Updated**: 2025-11-17
**Maintainer**: Connectors Platform Team
