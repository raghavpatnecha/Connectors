# API Response Format Inconsistencies - MCP Gateway Analysis

## Executive Summary
The MCP Gateway has **significant response format inconsistencies** across 28+ JSON responses. Different endpoints follow different patterns, mixing:
- `success` boolean (some endpoints)
- `error` field naming (inconsistent)
- `message` vs `error` for descriptions
- Missing metadata structures on some endpoints
- Validation error response format differs from OAuth error format
- Health check endpoints use different structures

---

## 1. API ENDPOINTS & RESPONSE FORMATS

### A. Root & Health Endpoints

#### 1.1 GET /
**File:** `gateway/src/server.ts` (Lines 182-194)
```typescript
res.json({
  name: 'MCP Gateway',
  version: '1.0.0',
  status: 'operational',
  endpoints: {
    health: '/health',
    ready: '/ready',
    api: '/api/v1',
    docs: '/api/v1/docs',
  },
});
```
**Pattern:** No `success` field, uses `status`, top-level endpoint mapping

---

#### 1.2 GET /health
**File:** `gateway/src/server.ts` (Lines 208-215)
```typescript
res.status(200).json({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage(),
});
```
**Pattern:** No `success` field, uses `status`, includes detailed memory metrics

---

#### 1.3 GET /ready
**File:** `gateway/src/server.ts` (Lines 220-256)
**Success Case (Lines 233-239):**
```typescript
res.status(200).json({
  status: 'ready',
  checks: {
    semanticRouter: 'ok',
    oauthProxy: 'ok',
  },
});
```
**Error Case (Lines 241-248):**
```typescript
res.status(503).json({
  status: 'not_ready',
  checks: checks.map((check, idx) => ({
    service: ['semanticRouter', 'oauthProxy'][idx],
    status: check.status === 'fulfilled' ? 'ok' : 'failed',
    error: check.status === 'rejected' ? (check.reason as Error).message : undefined,
  })),
});
```
**Fallback Error (Lines 252-255):**
```typescript
res.status(503).json({
  status: 'not_ready',
  error: (error as Error).message,
});
```
**Pattern:** No `success` field, inconsistent `checks` structure, mixed `error` usage

---

### B. 404 Handler

#### 1.4 404 Not Found
**File:** `gateway/src/server.ts` (Lines 197-202)
```typescript
res.status(404).json({
  error: 'Not Found',
  message: `Route ${req.method} ${req.path} not found`,
});
```
**Pattern:** No `success` field, uses `error` + `message`

---

### C. Tool Selection API

#### 1.5 POST /api/v1/tools/select
**File:** `gateway/src/server.ts` (Lines 263-333)

**Success Case (Lines 303-317):**
```typescript
res.status(200).json({
  success: true,
  query,
  tools: {
    tier1: tiered.tier1,
    tier2: tiered.tier2,
    tier3: tiered.tier3,
  },
  metadata: {
    totalTools: selectedTools.length,
    tokenUsage: tiered.totalTokens,
    tokenBudget: queryContext.tokenBudget,
    latency_ms: selectionLatency,
  },
});
```
**ToolSelectionError Case (Lines 324-328):**
```typescript
res.status(500).json({
  error: 'Tool Selection Failed',
  message: error.message,
  query: error.query,
});
```
**Pattern:** Uses `success`, includes `metadata`, error response missing `success` field

---

### D. Tool Invocation API

#### 1.6 POST /api/v1/tools/invoke
**File:** `gateway/src/server.ts` (Lines 339-395)

**Success Case (Lines 371-378):**
```typescript
res.status(200).json({
  success: true,
  toolId,
  result: result.data,
  metadata: {
    latency_ms: invocationLatency,
  },
});
```
**OAuthError Case (Lines 386-390):**
```typescript
res.status(401).json({
  error: 'Authentication Failed',
  message: error.message,
  integration: error.integration,
});
```
**Pattern:** Uses `success`, minimal `metadata`, missing `tenantId` in error response

---

### E. Tool Listing API

#### 1.7 GET /api/v1/tools/list
**File:** `gateway/src/server.ts` (Lines 401-425)
```typescript
res.status(200).json({
  success: true,
  tools,
  metadata: {
    total: tools.length,
    limit,
    offset,
  },
});
```
**Pattern:** Uses `success`, paginated metadata

---

### F. Categories API

#### 1.8 GET /api/v1/categories
**File:** `gateway/src/server.ts` (Lines 431-442)
```typescript
res.status(200).json({
  success: true,
  categories,
});
```
**Pattern:** Uses `success`, minimal structure

---

### G. Metrics API

#### 1.9 GET /api/v1/metrics
**File:** `gateway/src/server.ts` (Lines 448-475)
```typescript
res.status(200).json({
  success: true,
  metrics,
});
```
**Pattern:** Uses `success`, flat metrics structure

---

### H. Global Error Handler

#### 1.10 Global Error Handler (All Unhandled Errors)
**File:** `gateway/src/server.ts` (Lines 481-494)
```typescript
res.status(500).json({
  error: 'Internal Server Error',
  message: NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  ...(NODE_ENV === 'development' && { stack: err.stack }),
});
```
**Pattern:** No `success` field, uses `error` + `message`, conditional stack trace

---

### I. Tenant OAuth Configuration API

#### 1.11 POST /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
**File:** `gateway/src/routes/tenant-oauth.ts` (Lines 41-94)

**Success Case (Lines 60-67):**
```typescript
const response: OAuthConfigResponse = {
  success: true,
  tenantId,
  integration,
  message: 'OAuth configuration stored successfully'
};
res.status(201).json(response);
```
**VaultError Case (Lines 75-82):**
```typescript
const response: OAuthConfigResponse = {
  success: false,
  tenantId,
  integration,
  error: 'Failed to store OAuth configuration in Vault'
};
res.status(500).json(response);
```
**Pattern:** Uses `success`, includes `tenantId` + `integration`, no `metadata`

---

#### 1.12 GET /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
**File:** `gateway/src/routes/tenant-oauth.ts` (Lines 102-159)

**Success Case (Lines 120-127):**
```typescript
const response: OAuthConfigResponse = {
  success: true,
  tenantId,
  integration,
  config: configWithoutSecret
};
res.status(200).json(response);
```
**CredentialNotFoundError Case (Lines 135-141):**
```typescript
const response: OAuthConfigResponse = {
  success: false,
  tenantId,
  integration,
  error: 'OAuth configuration not found'
};
res.status(404).json(response);
```
**Pattern:** Uses `success`, returns `config` object

---

#### 1.13 DELETE /api/v1/tenants/:tenantId/integrations/:integration/oauth-config
**File:** `gateway/src/routes/tenant-oauth.ts` (Lines 165-222)

**Success Case (Lines 198-205):**
```typescript
const response: OAuthConfigResponse = {
  success: true,
  tenantId,
  integration,
  message: 'OAuth configuration deleted successfully'
};
res.status(200).json(response);
```
**Pattern:** Same as POST success response

---

#### 1.14 GET /api/v1/tenants/:tenantId/integrations
**File:** `gateway/src/routes/tenant-oauth.ts` (Lines 228-262)

**Success Case (Lines 243-248):**
```typescript
res.status(200).json({
  success: true,
  tenantId,
  integrations,
  count: integrations.length
});
```
**Pattern:** Uses `success`, inline response (no `OAuthConfigResponse` type)

---

#### 1.15 GET /api/v1/oauth-config/health
**File:** `gateway/src/routes/tenant-oauth.ts` (Lines 268-299)

**Success Case (Lines 273-278):**
```typescript
res.status(200).json({
  success: true,
  service: 'tenant-oauth-config',
  status: 'healthy',
  vault: 'connected'
});
```
**Error Cases (Lines 280-297):**
```typescript
res.status(503).json({
  success: false,
  service: 'tenant-oauth-config',
  status: 'unhealthy',
  vault: 'disconnected'
});
```
**Pattern:** Uses `success`, includes service/status fields

---

### J. Validation Middleware Errors

#### 1.16 OAuth Config Validation Failure
**File:** `gateway/src/middleware/validate-oauth-config.ts` (Lines 61-65)
```typescript
res.status(400).json({
  success: false,
  error: 'Validation failed',
  errors
});
```
**Pattern:** Different error structure with `errors` array

---

#### 1.17 Tenant ID Validation Failure
**File:** `gateway/src/middleware/validate-oauth-config.ts` (Lines 206-210)
```typescript
res.status(400).json({
  success: false,
  error: 'Invalid tenant ID',
  message: 'Tenant ID is required and must be a non-empty string'
});
```
**Pattern:** Uses `success` + `error` + `message`

---

#### 1.18 Integration Validation Failure
**File:** `gateway/src/middleware/validate-oauth-config.ts` (Lines 240-244)
```typescript
res.status(400).json({
  success: false,
  error: 'Invalid integration name',
  message: 'Integration name is required and must be a non-empty string'
});
```
**Pattern:** Same as tenant ID validation

---

---

## 2. IDENTIFIED INCONSISTENCIES

| Aspect | Problem | Affected Endpoints |
|--------|---------|-------------------|
| **`success` field** | Absent on health/ready/404/global errors | 4 endpoints |
| **`error` field naming** | Mixed: `error: 'Not Found'` vs `error: error.message` | Multiple |
| **Error description** | Uses both `message` and inline error text | 10+ endpoints |
| **Validation errors** | Different structure with `errors` array | Validation middleware |
| **Metadata structure** | Some endpoints, inconsistent keys (camelCase vs snake_case) | 3 endpoints |
| **Service identity** | Missing on most API endpoints, only on health checks | Most endpoints |
| **Status codes** | 201 on POST create, 200 on others (should be consistent) | oauth-config routes |
| **Field naming** | Mix of camelCase/snake_case in metadata | Multiple |
| **Tenant context** | Missing `tenantId` in error responses where relevant | Tool invocation |
| **Root endpoint** | Uses `status` field meaning different from health check | GET / |

---

## 3. STANDARD RESPONSE FORMAT RECOMMENDATION

### 3.1 Base Response Structure
```typescript
interface APIResponse<T = unknown> {
  // Always required
  success: boolean;
  
  // Common metadata
  metadata?: {
    timestamp?: string;
    requestId?: string;
    latency_ms?: number;
    [key: string]: unknown;
  };

  // Success response
  data?: T;

  // Error response
  error?: {
    code: string;
    message: string;
    details?: unknown;
    [key: string]: unknown;
  };
}
```

### 3.2 Specific Response Types
```typescript
// Tool Selection Response
interface ToolSelectionResponse extends APIResponse {
  data?: {
    query: string;
    tools: {
      tier1: Tool[];
      tier2: Tool[];
      tier3: ToolReference[];
    };
  };
}

// Health Check Response
interface HealthResponse extends APIResponse {
  data?: {
    service: string;
    status: 'healthy' | 'unhealthy' | 'ready' | 'not_ready';
    checks?: Record<string, 'ok' | 'failed'>;
    vault?: string;
  };
}

// Validation Error Response
interface ValidationErrorResponse extends APIResponse {
  error?: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: {
      field: string;
      message: string;
    }[];
  };
}

// OAuth Config Response
interface OAuthConfigResponse extends APIResponse {
  data?: {
    tenantId: string;
    integration: string;
    config?: TenantOAuthConfig;
  };
}
```

### 3.3 HTTP Status Code Convention
- **201** - Resource created (POST with resource)
- **200** - Success (GET, POST without resource, PUT, DELETE)
- **400** - Validation/client error
- **401** - Authentication error
- **403** - Authorization error
- **404** - Not found
- **429** - Rate limited
- **500** - Server error
- **503** - Service unavailable

---

## 4. IMPLEMENTATION APPROACH

### 4.1 Create Response Formatter Utility
**File:** `gateway/src/middleware/response-formatter.ts`

Purpose: Central utility for consistent response formatting
- Wrap success responses
- Wrap error responses with automatic `success: false`
- Add metadata (timestamp, latency, requestId)
- Handle different error types (validation, OAuth, generic)

### 4.2 Create Express Response Extension
**File:** `gateway/src/middleware/express-extensions.ts`

Extend Express Response object:
```typescript
declare global {
  namespace Express {
    interface Response {
      sendSuccess<T>(data?: T, metadata?: Metadata): void;
      sendError(code: string, message: string, details?: unknown, status?: number): void;
      sendValidationError(errors: ValidationError[]): void;
    }
  }
}
```

### 4.3 Apply Middleware Pattern
```typescript
app.use(responseFormatter); // Apply to all routes
app.use(errorHandler);       // Global error handler
```

### 4.4 Update Handlers
Replace all `res.json()` calls with:
- `res.sendSuccess(data, metadata)` for success
- `res.sendError(code, message, details)` for errors
- `res.sendValidationError(errors)` for validation errors

### 4.5 Update Validation Middleware
Standardize all validation error responses to use new formatter

### 4.6 Update Error Classes
Add HTTP metadata to error classes:
```typescript
class ToolSelectionError extends GatewayError {
  public readonly httpStatus = 500;
  public readonly errorCode = 'TOOL_SELECTION_FAILED';
}
```

---

## 5. MIGRATION STRATEGY

### Phase 1: Foundation (No Breaking Changes)
1. Create response formatter utility
2. Create Express extensions
3. Create response type definitions
4. Add to common utilities

### Phase 2: Gradual Migration
1. Update global error handler first
2. Update middleware validation responses
3. Update health/ready endpoints
4. Update OAuth config routes
5. Update tool selection/invocation routes

### Phase 3: Validation & Testing
1. Write tests for response formatter
2. Test backward compatibility
3. Update API documentation
4. Publish breaking change notice (if needed)

---

## 6. CODE CHANGES NEEDED

### File: `gateway/src/middleware/response-formatter.ts` (NEW)
**Lines:** N/A (new file)
**Change Type:** Create

### File: `gateway/src/types/response.types.ts` (NEW)
**Lines:** N/A (new file)
**Change Type:** Create

### File: `gateway/src/server.ts`
**Lines:** 
- 182-194 (GET /)
- 208-256 (GET /health, GET /ready)
- 263-333 (POST /tools/select)
- 339-395 (POST /tools/invoke)
- 401-425 (GET /tools/list)
- 431-442 (GET /categories)
- 448-475 (GET /metrics)
- 481-494 (Global error handler)

**Change Type:** Update to use new response formatter

### File: `gateway/src/routes/tenant-oauth.ts`
**Lines:**
- 41-94 (POST oauth-config)
- 102-159 (GET oauth-config)
- 165-222 (DELETE oauth-config)
- 228-262 (GET integrations)
- 268-299 (GET oauth-config/health)

**Change Type:** Update to use new response formatter

### File: `gateway/src/middleware/validate-oauth-config.ts`
**Lines:**
- 61-65 (OAuth config validation)
- 206-210 (Tenant ID validation)
- 240-244 (Integration validation)
- 177-181 (URL validation errors)

**Change Type:** Update to use new response formatter

### File: `gateway/src/errors/gateway-errors.ts`
**Lines:** End of file

**Change Type:** Add HTTP metadata to all error classes

---

## 7. EXAMPLE IMPLEMENTATION

### Current Inconsistent Code:
```typescript
// /tools/select
res.status(200).json({
  success: true,
  query,
  tools: { tier1, tier2, tier3 },
  metadata: { totalTools, tokenUsage, latency_ms }
});

// /health
res.status(200).json({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memory: process.memoryUsage()
});

// /ready
res.status(503).json({
  status: 'not_ready',
  error: error.message
});

// oauth-config/health
res.status(200).json({
  success: true,
  service: 'tenant-oauth-config',
  status: 'healthy',
  vault: 'connected'
});
```

### Proposed Consistent Code:
```typescript
// All endpoints use same pattern
res.sendSuccess(
  {
    query,
    tools: { tier1, tier2, tier3 }
  },
  {
    totalTools,
    tokenUsage,
    latency_ms,
    service: 'tool-selection'
  }
);

res.sendSuccess(
  {
    service: 'gateway',
    status: 'healthy',
    checks: { vault: 'connected' }
  },
  { timestamp: new Date().toISOString() }
);

res.sendError(
  'SERVICE_UNAVAILABLE',
  'Gateway service not ready',
  { checks: [...] },
  503
);
```

---

## Summary

**Total Inconsistencies Found:** 18 response format variations across 10 error patterns

**Files Affected:** 3 major files
- `gateway/src/server.ts` - 8 endpoint handlers
- `gateway/src/routes/tenant-oauth.ts` - 5 endpoint handlers  
- `gateway/src/middleware/validate-oauth-config.ts` - 3 validation handlers

**Implementation Effort:** 
- Foundation: 2-3 hours (response formatter + types)
- Migration: 3-4 hours (update all handlers)
- Testing: 2-3 hours (comprehensive tests)

**Risk Level:** Low (gradual migration, no breaking changes initially)
