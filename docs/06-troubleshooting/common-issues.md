# Common Issues & Solutions

Detailed solutions for frequently encountered problems.

---

## Docker Issues

### Containers Not Starting

**Symptoms:** `docker compose ps` shows "Exit" or "Restarting"

**Solutions:**

**Port Conflicts:**
```bash
lsof -i :3000 :8200 :6379 :7474
docker compose down
# Edit ports in docker-compose.yml
docker compose up -d
```

**Insufficient Resources:**
```bash
docker stats
# Docker Desktop → Settings → Resources
# Minimum: 4GB RAM, 2 CPUs
```

**Network Issues:**
```bash
docker compose down
docker network prune
docker compose up -d
```

---

### MCP Build Failures

**Error:** `ERROR: npm run build failed`

**Solutions:**

```bash
# Clear cache
docker compose build --no-cache mcp-github

# Test locally
cd integrations/github
npm install && npm run build

# Fix dependencies
rm -rf node_modules package-lock.json
npm install && npm run build
```

---

## FAISS Index Issues

### Index Not Found

**Error:** `FAISS index file not found at data/indices/categories.faiss`

**Impact:** Tool selection returns 503

**Solution:**

```bash
cd gateway
npm install
npm run generate-embeddings

# Verify
ls -lh gateway/data/indices/
docker compose restart gateway
```

**Expected output:**
```
Generating embeddings...
✓ Created category index
✓ Created tool index
Done in 8.2s
```

---

### Index Corrupted

**Error:** `Invalid FAISS file format`

**Solution:**
```bash
rm -rf gateway/data/indices/*.faiss
cd gateway && npm run generate-embeddings
docker compose restart gateway
```

---

## Connection Issues

### Cannot Connect to MCP Server

**Error:** `connect ECONNREFUSED 127.0.0.1:3110`

**Diagnosis:**
```bash
docker compose ps | grep mcp-
# Expected: mcp-github Up 0.0.0.0:3110->3110/tcp
```

**Solutions:**

```bash
# Start servers
docker compose --profile mcp-servers up -d

# Check logs
docker compose logs mcp-github

# Test health
curl http://localhost:3110/health
```

---

### Connection Timeouts

**Error:** `Request timeout after 30000ms`

**Solutions:**

```bash
# Check network
docker exec gateway curl -s http://mcp-github:3110/health

# Increase timeouts in gateway/.env
HTTP_TIMEOUT=60000
MCP_TIMEOUT=45000
docker compose restart gateway

# Check resources
docker stats
```

---

## Tool Selection Errors

### No Results Returned

**Symptoms:** `{"success": true, "tools": []}`

**Solutions:**

```bash
# Check indices loaded
curl http://localhost:3000/ready | jq '.checks.faiss_indices'

# Verify indices exist
ls -lh gateway/data/indices/

# Test without filter
curl -X POST http://localhost:3000/api/v1/tools/select \
  -H "Content-Type: application/json" \
  -d '{"query":"create a pull request"}'
```

---

### Selection Too Slow

**Symptoms:** Selection >500ms

**Solutions:**

```bash
# Check Redis cache
docker exec gateway redis-cli -h redis ping
docker exec redis redis-cli INFO stats | grep keyspace_hits

# Optimize index
cd gateway
FAISS_NLIST=100 npm run generate-embeddings
```

---

## Tool Invocation Errors

### 401 Unauthorized

**Error:** `OAuth credentials not found`

**Solution:** See [OAuth Debugging Guide](./oauth-debugging.md#credentials-not-found)

**Quick Fix:**
```bash
curl -X POST http://localhost:3000/api/v1/tenants/my-tenant/integrations/github/oauth-config \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "your-id",
    "clientSecret": "your-secret",
    "redirectUri": "https://yourapp.com/callback",
    "scopes": ["repo"]
  }'
```

---

### 429 Rate Limited

**Error:** `Rate limit exceeded`

**Solutions:**

```bash
# Calculate wait time
RESET=1700046000
WAIT=$((RESET - $(date +%s)))
echo "Wait $WAIT seconds"

# Check status
curl -H "Authorization: Bearer TOKEN" \
  https://api.github.com/rate_limit

# Use different credentials
curl -X POST http://localhost:3000/api/v1/tenants/my-tenant/integrations/github/oauth-config \
  -d '{"clientId":"different-id",...}'
```

---

### 502 Bad Gateway

**Error:** `MCP server unavailable`

**Solutions:**

```bash
# Check status
docker compose ps mcp-github
docker compose logs mcp-github

# Restart
docker compose restart mcp-github

# Test directly
curl http://localhost:3110/health
```

---

## Neo4j Issues

### Database Empty

**Symptoms:** No tool relationships

**Solution:**
```bash
./scripts/init-neo4j.sh

# Verify
docker exec -it neo4j cypher-shell -u neo4j -p password
MATCH (t:Tool) RETURN count(t);
```

---

### Connection Refused

**Error:** `connect ECONNREFUSED 127.0.0.1:7687`

**Solution:**
```bash
docker compose up -d neo4j

# Wait 10-20s
docker compose logs -f neo4j
# Wait for: "Started."

curl http://localhost:7474
```

---

## Vault Issues

### Vault Sealed

**Error:** `Vault is sealed`

**Solution:**
```bash
docker compose logs vault | grep -i seal

# Restart (auto-unseals in dev mode)
docker compose restart vault
sleep 5

curl http://localhost:8200/v1/sys/health | jq '.sealed'
# Should return: false
```

---

### Connection Failed

**Error:** `connect ECONNREFUSED 127.0.0.1:8200`

**Solution:**
```bash
docker compose up -d vault
curl http://localhost:8200/v1/sys/health

# Check config
cat gateway/.env | grep VAULT
# VAULT_ADDR=http://vault:8200
# VAULT_TOKEN=dev-token
```

---

## Next Steps

- **[OAuth Debugging](./oauth-debugging.md)** - OAuth troubleshooting
- **[Troubleshooting Index](./index.md)** - Overview
- **[API Reference](../05-api-reference/index.md)** - API docs
