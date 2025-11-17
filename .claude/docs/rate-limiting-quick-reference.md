# Rate Limiting - Quick Reference Summary

**Last Updated:** 2025-11-17  
**Full Analysis:** See `rate-limiting-analysis.md`

## Current Implementation Status

### IMPLEMENTED ✅
- Per-integration rate limiting (token bucket algorithm)
  - Location: `/home/user/Connectors/gateway/src/integrations/*/integration.ts`
  - Example: `/home/user/Connectors/gateway/src/integrations/slides-integration.ts` lines 53-94
  - 14 integrations with configured limits (Notion: 3 req/s, GitHub: 60 req/s, etc.)

- Upstream 429 error handling
  - Location: `/home/user/Connectors/gateway/src/auth/oauth-proxy.ts` lines 230-248
  - Detects and reports provider rate limits
  - Throws `RateLimitError` with reset time tracking

- Redis infrastructure
  - Available via `/home/user/Connectors/gateway/src/caching/redis-cache.ts`
  - Currently used for caching only (embedding cache, tool selection cache)
  - Dependencies: `redis@^4.6.13`, `ioredis@^5.8.2`

### NOT IMPLEMENTED ❌ (CRITICAL GAPS)
- Gateway-level rate limiting (per-IP, global)
- Per-tenant rate limiting
- Per-endpoint granular limiting
- Distributed rate limiting (across multiple instances)

## All Endpoints Without Rate Limiting

### Critical (High Resource Usage)
| Endpoint | Method | Line | Recommended Limit |
|----------|--------|------|------------------|
| `/api/v1/tools/select` | POST | 163 | 10 req/s/tenant |
| `/api/v1/tools/invoke` | POST | 164 | 20 req/s/tenant |
| `/api/v1/tools/list` | GET | 165 | 5 req/s/tenant |

### Configuration (Vault I/O)
| Endpoint | Method | Line | Recommended Limit |
|----------|--------|------|------------------|
| POST `/tenants/{id}/integrations/{integration}/oauth-config` | POST | 41-94 | 1 req/s/tenant |
| GET `/tenants/{id}/integrations/{integration}/oauth-config` | GET | 102-159 | 10 req/s/tenant |
| DELETE `/tenants/{id}/integrations/{integration}/oauth-config` | DELETE | 165-222 | 1 req/s/tenant |
| GET `/tenants/{id}/integrations` | GET | 228-262 | 5 req/s/tenant |

### Informational (Low Resource)
| Endpoint | Method | Recommended Limit |
|----------|--------|------------------|
| `/api/v1/categories` | GET | 100 req/s/IP |
| `/api/v1/metrics` | GET | 100 req/s/IP |
| `/health` | GET | 1000 req/s/IP |
| `/ready` | GET | 1000 req/s/IP |

## Implementation Strategy

### Recommended Approach: Multi-Layer
```
Layer 1: Global per-IP (1000 req/s) - DDoS protection
Layer 2: Per-tenant (100 req/s) - Multi-tenancy fairness
Layer 3: Per-endpoint-per-tenant (varied by endpoint)
Layer 4: Per-integration (already implemented, needs Redis backing)
```

### Package Recommendations
- Primary: `express-rate-limit@^7.1.5` (gateway middleware)
- Secondary: `bottleneck@^2.19.5` (distributed coordination)
- Storage: Use existing Redis client

### Key Implementation Files to Modify

1. **Gateway Server (server.ts)**
   - Location: `/home/user/Connectors/gateway/src/server.ts`
   - Lines to add: 113-150 (setupMiddleware), 155-203 (setupRoutes)
   - Action: Add rate limiting middleware and route-specific limiters

2. **OAuth Routes (tenant-oauth.ts)**
   - Location: `/home/user/Connectors/gateway/src/routes/tenant-oauth.ts`
   - Lines to add: After line 34 (router creation)
   - Action: Add OAuth-specific limiters

3. **New Rate Limiter Module**
   - Create: `/home/user/Connectors/gateway/src/middleware/rate-limiter.ts`
   - Purpose: Centralized rate limiting logic

4. **New Error Class**
   - Location: `/home/user/Connectors/gateway/src/errors/gateway-errors.ts`
   - Add: `RateLimitExceededError` class

## Priority Implementation Order

**PHASE 1 (URGENT - Week 1)**
1. Implement global per-IP rate limiter (1000 req/s)
2. Implement per-tenant rate limiter (100 req/s)
3. Add 429 response format and headers
4. Add basic logging

**PHASE 2 (HIGH - Week 2-3)**
1. Implement endpoint-specific limiters
2. Migrate integration limiters to Redis backing
3. Add comprehensive monitoring
4. Add Prometheus metrics

**PHASE 3 (MEDIUM - Week 4+)**
1. Sliding window algorithm (Lua scripts)
2. Priority queuing
3. Adaptive limiting based on load
4. Dashboard and alerting

## Risk Assessment

**Current Risk Level: HIGH**

Without gateway-level rate limiting:
- Vulnerable to token exhaustion attacks
- Single tenant can starve others
- Resource exhaustion from unbounded requests
- Cost overruns on third-party APIs
- 3x actual rate limits if 3 gateway instances (not distributed)

## Success Metrics
- Latency overhead: <5ms per request
- False positive rate: <0.1%
- Distributed accuracy: 99.9%
- Redis uptime: 99.99% (critical)

## Environment Variables (Proposed)

```bash
# Global Rate Limiting
RATE_LIMIT_GLOBAL_ENABLED=true
RATE_LIMIT_GLOBAL_RPS=1000
RATE_LIMIT_GLOBAL_WINDOW_MS=1000

# Per-Tenant
RATE_LIMIT_TENANT_ENABLED=true
RATE_LIMIT_TENANT_RPS=100
RATE_LIMIT_TENANT_WINDOW_MS=60000

# Per-Endpoint
RATE_LIMIT_ENDPOINT_TOOLS_SELECT_RPS=10
RATE_LIMIT_ENDPOINT_TOOLS_INVOKE_RPS=20

# Redis
RATE_LIMIT_REDIS_URL=redis://localhost:6379
RATE_LIMIT_EXEMPT_PATHS=/health,/ready
```

## Quick Start Implementation Checklist

- [ ] Create `/gateway/src/middleware/rate-limiter.ts`
- [ ] Add `express-rate-limit` and `bottleneck` to package.json
- [ ] Implement global rate limiter in `server.ts` setupMiddleware()
- [ ] Implement per-tenant rate limiter in setupMiddleware()
- [ ] Add endpoint-specific limiters in setupRoutes()
- [ ] Update tenant-oauth.ts with OAuth limiters
- [ ] Add `RateLimitExceededError` to errors/gateway-errors.ts
- [ ] Create tests: `gateway/tests/rate-limiting.test.ts`
- [ ] Add environment variables to .env.example
- [ ] Update docker-compose.yml for Redis (if needed)
- [ ] Add monitoring/metrics

## References
- Full analysis: `/home/user/Connectors/.claude/docs/rate-limiting-analysis.md`
- Gateway source: `/home/user/Connectors/gateway/src/`
- Package.json: `/home/user/Connectors/gateway/package.json`
