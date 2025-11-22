# Environment Variables Documentation

Complete reference for all environment variables used in the MCP Gateway.

## 📋 **Table of Contents**

- [Server Configuration](#server-configuration)
- [Semantic Router Configuration](#semantic-router-configuration)
- [OAuth Refresh Scheduler](#oauth-refresh-scheduler)
- [API Key Authentication](#api-key-authentication)
- [Rate Limiting](#rate-limiting)
- [Vault Circuit Breaker](#vault-circuit-breaker)
- [FAISS Indices](#faiss-indices)
- [HashiCorp Vault](#hashicorp-vault)
- [Redis](#redis)
- [Neo4j (GraphRAG)](#neo4j-graphrag)
- [Security Best Practices](#security-best-practices)

---

## Server Configuration

### `PORT`
- **Description:** HTTP server port
- **Type:** Integer
- **Default:** `3000`
- **Example:** `PORT=8080`

### `NODE_ENV`
- **Description:** Node environment
- **Type:** String (development, production, test)
- **Default:** `development`
- **Example:** `NODE_ENV=production`
- **Note:** Affects logging, error handling, and validation strictness

### `CORS_ORIGINS`
- **Description:** Comma-separated list of allowed CORS origins
- **Type:** String (comma-separated)
- **Default:** `*` (all origins)
- **Example:** `CORS_ORIGINS=http://localhost:3000,https://app.example.com`
- **Security:** Restrict in production

### `ENABLE_REQUEST_LOGGING`
- **Description:** Enable HTTP request logging
- **Type:** Boolean
- **Default:** `true`
- **Example:** `ENABLE_REQUEST_LOGGING=false`

### `LOG_LEVEL`
- **Description:** Winston log level
- **Type:** String (error, warn, info, debug)
- **Default:** `info`
- **Example:** `LOG_LEVEL=debug`

---

## Semantic Router Configuration

These variables control the intelligent tool selection behavior.

### `SEMANTIC_ROUTER_MAX_TOOLS`
- **Description:** Maximum tools to return per query
- **Type:** Integer
- **Default:** `5`
- **Range:** 1-50
- **Example:** `SEMANTIC_ROUTER_MAX_TOOLS=10`
- **Impact:** Higher = more tools returned, higher token usage

### `SEMANTIC_ROUTER_CATEGORY_THRESHOLD`
- **Description:** Minimum similarity score for category selection
- **Type:** Float
- **Default:** `0.7`
- **Range:** 0.0-1.0
- **Example:** `SEMANTIC_ROUTER_CATEGORY_THRESHOLD=0.8`
- **Impact:** Higher = stricter matching, fewer categories selected

### `SEMANTIC_ROUTER_TOOL_THRESHOLD`
- **Description:** Minimum similarity score for tool selection
- **Type:** Float
- **Default:** `0.5`
- **Range:** 0.0-1.0
- **Example:** `SEMANTIC_ROUTER_TOOL_THRESHOLD=0.6`
- **Impact:** Higher = stricter matching, fewer tools selected

### `SEMANTIC_ROUTER_MAX_CATEGORIES`
- **Description:** Maximum categories to consider
- **Type:** Integer
- **Default:** `3`
- **Range:** 1-10
- **Example:** `SEMANTIC_ROUTER_MAX_CATEGORIES=5`
- **Impact:** Higher = broader search, more tools considered

---

## OAuth Refresh Scheduler

Controls automatic token refresh behavior.

### `OAUTH_REFRESH_BUFFER_MS`
- **Description:** Buffer time before token expiry to trigger refresh
- **Type:** Integer (milliseconds)
- **Default:** `300000` (5 minutes)
- **Example:** `OAUTH_REFRESH_BUFFER_MS=600000` (10 minutes)
- **Recommendation:** 5-15 minutes depending on token lifetime

### `OAUTH_CHECK_INTERVAL_MS`
- **Description:** Interval for checking pending refresh jobs
- **Type:** Integer (milliseconds)
- **Default:** `60000` (1 minute)
- **Example:** `OAUTH_CHECK_INTERVAL_MS=30000` (30 seconds)
- **Impact:** Lower = more frequent checks, higher CPU usage

### `OAUTH_MAX_RETRY_ATTEMPTS`
- **Description:** Maximum retry attempts for failed token refreshes
- **Type:** Integer
- **Default:** `3`
- **Range:** 1-10
- **Example:** `OAUTH_MAX_RETRY_ATTEMPTS=5`

---

## API Key Authentication

### `API_KEY_CACHE_TTL_MS`
- **Description:** Cache TTL for API key lookups in Vault
- **Type:** Integer (milliseconds)
- **Default:** `300000` (5 minutes)
- **Example:** `API_KEY_CACHE_TTL_MS=600000` (10 minutes)
- **Impact:** Higher = less Vault load, slower revocation propagation

### `API_KEY_CACHE_CLEANUP_INTERVAL_MS`
- **Description:** Interval for cleaning expired cache entries
- **Type:** Integer (milliseconds)
- **Default:** `60000` (1 minute)
- **Example:** `API_KEY_CACHE_CLEANUP_INTERVAL_MS=120000` (2 minutes)

---

## Rate Limiting

### `RATE_LIMIT_GLOBAL_RPS`
- **Description:** Global rate limit across all requests
- **Type:** Integer (requests per second)
- **Default:** `1000`
- **Example:** `RATE_LIMIT_GLOBAL_RPS=5000`
- **Recommendation:** Set based on infrastructure capacity

### `RATE_LIMIT_TENANT_RPS`
- **Description:** Per-tenant rate limit
- **Type:** Integer (requests per second)
- **Default:** `100`
- **Example:** `RATE_LIMIT_TENANT_RPS=200`
- **Recommendation:** Set based on tenant tier/plan

### `RATE_LIMIT_ANONYMOUS_RPS`
- **Description:** Rate limit for anonymous/unauthenticated requests
- **Type:** Integer (requests per second)
- **Default:** `10`
- **Example:** `RATE_LIMIT_ANONYMOUS_RPS=5`
- **Security:** Keep low to prevent abuse

---

## Vault Circuit Breaker

Controls resilience behavior for Vault operations.

### `VAULT_CB_FAILURE_THRESHOLD`
- **Description:** Consecutive failures before opening circuit
- **Type:** Integer
- **Default:** `5`
- **Example:** `VAULT_CB_FAILURE_THRESHOLD=10`
- **Impact:** Higher = more tolerance for transient failures

### `VAULT_CB_SUCCESS_THRESHOLD`
- **Description:** Successes needed to close circuit from HALF_OPEN
- **Type:** Integer
- **Default:** `2`
- **Example:** `VAULT_CB_SUCCESS_THRESHOLD=3`

### `VAULT_CB_RESET_TIMEOUT_MS`
- **Description:** Time to wait before attempting recovery
- **Type:** Integer (milliseconds)
- **Default:** `60000` (1 minute)
- **Example:** `VAULT_CB_RESET_TIMEOUT_MS=120000` (2 minutes)
- **Recommendation:** 30-300 seconds based on Vault recovery time

### `VAULT_CB_WINDOW_DURATION_MS`
- **Description:** Time window for counting failures
- **Type:** Integer (milliseconds)
- **Default:** `10000` (10 seconds)
- **Example:** `VAULT_CB_WINDOW_DURATION_MS=30000` (30 seconds)

---

## FAISS Indices

### `CATEGORY_INDEX_PATH`
- **Description:** Path to category FAISS index file
- **Type:** String (file path)
- **Default:** `data/indices/categories.faiss`
- **Example:** `CATEGORY_INDEX_PATH=/var/data/categories.faiss`

### `TOOL_INDEX_PATH`
- **Description:** Path to tool FAISS index file
- **Type:** String (file path)
- **Default:** `data/indices/tools.faiss`
- **Example:** `TOOL_INDEX_PATH=/var/data/tools.faiss`

---

## HashiCorp Vault

### `VAULT_ADDR`
- **Description:** Vault server address
- **Type:** String (URL)
- **Default:** `http://localhost:8200`
- **Example:** `VAULT_ADDR=https://vault.example.com:8200`
- **Security:** Use HTTPS in production

### `VAULT_TOKEN` ⚠️
- **Description:** Vault authentication token
- **Type:** String
- **Default:** None
- **Example:** `VAULT_TOKEN=s.AbCdEfGhIjKlMnOpQrSt`
- **Security:** **REQUIRED in production**, never commit, rotate regularly

### `VAULT_TRANSIT_ENGINE`
- **Description:** Name of Vault transit engine for encryption
- **Type:** String
- **Default:** `transit`
- **Example:** `VAULT_TRANSIT_ENGINE=encryption`

### `VAULT_KV_ENGINE`
- **Description:** Name of Vault KV v2 engine
- **Type:** String
- **Default:** `secret`
- **Example:** `VAULT_KV_ENGINE=kv`

### `VAULT_TIMEOUT_MS`
- **Description:** Vault request timeout
- **Type:** Integer (milliseconds)
- **Default:** `5000` (5 seconds)
- **Example:** `VAULT_TIMEOUT_MS=10000` (10 seconds)

### `VAULT_MAX_RETRIES`
- **Description:** Maximum retries for failed Vault operations
- **Type:** Integer
- **Default:** `3`
- **Example:** `VAULT_MAX_RETRIES=5`

---

## Redis

### `REDIS_URL`
- **Description:** Redis connection URL
- **Type:** String (URL)
- **Default:** `redis://localhost:6379`
- **Example:** `REDIS_URL=redis://:password@redis.example.com:6379/0`
- **Security:** Use TLS in production (`rediss://`)

### `REDIS_CONNECT_TIMEOUT_MS`
- **Description:** Redis connection timeout
- **Type:** Integer (milliseconds)
- **Default:** `5000` (5 seconds)
- **Example:** `REDIS_CONNECT_TIMEOUT_MS=10000`

### `REDIS_COMMAND_TIMEOUT_MS`
- **Description:** Redis command timeout
- **Type:** Integer (milliseconds)
- **Default:** `3000` (3 seconds)
- **Example:** `REDIS_COMMAND_TIMEOUT_MS=5000`

---

## Neo4j (GraphRAG)

### `NEO4J_URI`
- **Description:** Neo4j connection URI
- **Type:** String (URI)
- **Default:** `bolt://localhost:7687`
- **Example:** `NEO4J_URI=neo4j+s://graph.example.com:7687`
- **Security:** Use `neo4j+s://` in production

### `NEO4J_USERNAME`
- **Description:** Neo4j username
- **Type:** String
- **Default:** `neo4j`
- **Example:** `NEO4J_USERNAME=graph_user`

### `NEO4J_PASSWORD` ⚠️
- **Description:** Neo4j password
- **Type:** String
- **Default:** `password`
- **Example:** `NEO4J_PASSWORD=strong_password_here`
- **Security:** Use strong password in production, never commit

---

## Security Best Practices

### 🔒 **Secret Management**

1. **Never Commit Secrets**
   ```bash
   # Add .env to .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use Vault for Production**
   - Store all secrets in HashiCorp Vault
   - Use short-lived tokens
   - Enable audit logging

3. **Rotate Credentials Regularly**
   - `VAULT_TOKEN`: Every 30-90 days
   - `NEO4J_PASSWORD`: Every 90 days
   - API keys: As needed

### 🛡️ **Production Checklist**

- [ ] `NODE_ENV=production`
- [ ] `VAULT_TOKEN` set with proper permissions
- [ ] `CORS_ORIGINS` restricted to known domains
- [ ] TLS enabled for all external connections
- [ ] Strong passwords for Redis, Neo4j
- [ ] Rate limits tuned for production load
- [ ] Circuit breaker thresholds tested
- [ ] Monitoring and alerting configured

### 📊 **Performance Tuning**

| Use Case | Configuration |
|----------|--------------|
| **High Throughput** | Increase `RATE_LIMIT_GLOBAL_RPS`, reduce `OAUTH_CHECK_INTERVAL_MS` |
| **Low Latency** | Increase `API_KEY_CACHE_TTL_MS`, optimize `SEMANTIC_ROUTER_MAX_TOOLS` |
| **Resource Constrained** | Decrease `SEMANTIC_ROUTER_MAX_CATEGORIES`, increase cache TTLs |
| **High Availability** | Tune circuit breaker: `VAULT_CB_FAILURE_THRESHOLD=10`, `VAULT_CB_RESET_TIMEOUT_MS=30000` |

---

## 🔄 **Configuration Updates**

To update configuration without restart (where supported):
```bash
# Reload via API (if implemented)
curl -X POST http://localhost:3000/api/v1/admin/reload-config \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Most configuration changes require a service restart:
```bash
# Docker Compose
docker-compose restart gateway

# Kubernetes
kubectl rollout restart deployment/mcp-gateway
```

---

## 📚 **Related Documentation**

- [Gateway Architecture](../../gateway/README.md)
- [OAuth Flow](../../docs/oauth-setup.md)
- [Deployment Guide](../../docs/deployment.md)
- [Security Best Practices](../../docs/security.md)
