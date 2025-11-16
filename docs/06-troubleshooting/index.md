# Troubleshooting Guide

Solutions for common issues with the Connectors Platform.

---

## Quick Health Check

```bash
#!/bin/bash
echo "=== Health Check ==="

# Gateway
echo -n "Gateway: "
curl -s http://localhost:3000/health | jq -r '.status' || echo "FAIL"

# Vault
echo -n "Vault: "
curl -s http://localhost:8200/v1/sys/health | jq -r '.initialized' || echo "FAIL"

# Redis
echo -n "Redis: "
docker exec redis redis-cli ping || echo "FAIL"

# Neo4j
echo -n "Neo4j: "
curl -s http://localhost:7474 > /dev/null && echo "OK" || echo "FAIL"

# FAISS Indices
echo -n "FAISS: "
ls gateway/data/indices/*.faiss > /dev/null 2>&1 && echo "OK" || echo "MISSING"

# MCP Servers
echo "MCP Servers:"
docker compose ps | grep mcp-
```

---

## Common Issues

### Setup & Installation
- [Docker containers not starting](./common-issues.md#docker-issues)
- [FAISS index not found](./common-issues.md#faiss-index-not-found)
- [MCP servers not building](./common-issues.md#mcp-build-failures)

### OAuth & Authentication
- [OAuth credentials not found](./oauth-debugging.md#credentials-not-found)
- [Token refresh failures](./oauth-debugging.md#token-refresh-failures)
- [Vault connection errors](./oauth-debugging.md#vault-connection-errors)

### Runtime Errors
- [Tool selection failures](./common-issues.md#tool-selection-errors)
- [Tool invocation errors](./common-issues.md#tool-invocation-errors)
- [Connection timeouts](./common-issues.md#connection-timeouts)

---

## Debug Checklist

Before filing an issue:

- [ ] All containers running: `docker compose ps`
- [ ] Health check passes: `curl http://localhost:3000/health`
- [ ] Vault unsealed: `docker compose logs vault`
- [ ] FAISS indices exist: `ls gateway/data/indices/`
- [ ] OAuth configured: `curl http://localhost:3000/api/v1/tenants/test-tenant/integrations`
- [ ] Logs checked: `docker compose logs gateway`

---

## Log Locations

### Gateway Logs

```bash
# Combined logs
tail -f gateway/logs/combined.log

# Errors only
tail -f gateway/logs/error.log

# Filter by operation
tail -f gateway/logs/combined.log | grep tool_selection

# Filter by tenant
tail -f gateway/logs/combined.log | grep 'tenantId":"my-tenant"'
```

### Docker Logs

```bash
# Gateway
docker compose logs -f gateway

# Vault
docker compose logs -f vault

# MCP Servers
docker compose logs -f mcp-github
docker compose logs -f mcp-linkedin
```

---

## Performance Debugging

### Slow Tool Selection

```bash
# Check FAISS index size
ls -lh gateway/data/indices/

# Monitor Redis cache
docker exec redis redis-cli INFO stats | grep keyspace

# Check latency
tail -f gateway/logs/combined.log | grep tool_selection_completed | jq '.faiss_latency_ms'
```

### Slow Tool Invocation

```bash
# Check MCP server response time
docker compose logs mcp-github | grep duration_ms

# Check OAuth fetch time
tail -f gateway/logs/combined.log | grep oauth_token_fetch | jq '.latency_ms'
```

---

## Network Debugging

### Check Connectivity

```bash
# Gateway → Vault
docker exec gateway curl -s http://vault:8200/v1/sys/health

# Gateway → Redis
docker exec gateway redis-cli -h redis ping

# Gateway → Neo4j
docker exec gateway curl -s http://neo4j:7474

# Gateway → MCP
docker exec gateway curl -s http://mcp-github:3110/health
```

### Port Conflicts

```bash
# Check ports
lsof -i :3000  # Gateway
lsof -i :8200  # Vault
lsof -i :6379  # Redis
lsof -i :7474  # Neo4j

# Change ports in docker-compose.yml
docker compose down && docker compose up -d
```

---

## Reset & Recovery

### Complete Reset

⚠️ **Deletes all data**

```bash
# Stop containers
docker compose down -v

# Remove indices
rm -rf gateway/data/indices/*.faiss

# Remove logs
rm -rf gateway/logs/*.log

# Rebuild
docker compose build --no-cache
docker compose up -d vault redis neo4j

# Initialize
sleep 10
./scripts/init-neo4j.sh
cd gateway && npm run generate-embeddings

# Start all
cd .. && docker compose --profile mcp-servers up -d
```

### OAuth-Only Reset

```bash
# Delete OAuth configs
docker exec vault vault kv metadata delete -mount=secret oauth

# Restart gateway
docker compose restart gateway
```

---

## Detailed Guides

- **[Common Issues](./common-issues.md)** - General platform issues
- **[OAuth Debugging](./oauth-debugging.md)** - OAuth-specific troubleshooting

---

## Getting Help

### Create Bug Report

Include:

```markdown
**Environment:**
- OS: [Linux/macOS/Windows]
- Docker: `docker --version`
- Gateway: `git rev-parse HEAD`

**Issue:** [Description]

**Steps to Reproduce:**
1. Step 1
2. Step 2

**Expected:** [What should happen]
**Actual:** [What happens]

**Logs:** [Paste logs]
**Health Check:** [Paste output]
```

---

## Next Steps

- **[Common Issues](./common-issues.md)** - Detailed solutions
- **[OAuth Debugging](./oauth-debugging.md)** - OAuth troubleshooting
- **[API Reference](../05-api-reference/index.md)** - API docs
