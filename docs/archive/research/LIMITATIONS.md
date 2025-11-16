# Current Limitations & Setup Requirements

**Last Updated:** 2025-11-13

---

## What Works Out of the Box

### ✅ Fully Operational

**Multi-Tenant OAuth System:**
- Per-tenant credential encryption via HashiCorp Vault Transit engine
- Automatic token refresh (5 minutes before expiry)
- REST API for OAuth configuration management
- Background refresh scheduler with event system
- **Status:** Production-ready, 2,000+ lines of tested code

**Integration Modules:**
- GitHub, Notion, LinkedIn, Reddit integration modules
- OAuth proxy with rate limiting
- Error handling and retry logic
- Health check endpoints
- **Status:** Now wired to server and initialize on startup

**Infrastructure Services:**
- HashiCorp Vault for secrets management
- Redis for caching
- Neo4j for GraphRAG (database ready)
- Docker Compose orchestration
- **Status:** Ready to run

---

## What Requires Setup

### ⚠️ FAISS Vector Search Indices

**Issue:** FAISS indices for semantic tool selection are not pre-generated.

**Impact:**
- `POST /api/v1/tools/select` endpoint will fail
- Tool selection and semantic routing unavailable
- Category-based filtering won't work

**Required Action:**
```bash
cd gateway
npm run generate-embeddings
```

**What this does:**
- Generates embeddings for all registered tool categories
- Generates embeddings for all registered tools
- Creates FAISS indices for vector similarity search
- Stores indices in `gateway/data/indices/`

**Estimated time:** 5-10 minutes

---

### ⚠️ MCP Server Docker Images

**Issue:** MCP servers are not pre-built.

**Impact:**
- `POST /api/v1/tools/invoke` endpoint will fail
- Cannot execute actual tool calls
- Integration endpoints unavailable

**Required Action:**
```bash
# Build all MCP servers
docker compose build mcp-github mcp-linkedin mcp-reddit mcp-notion

# Or build individually
docker compose build mcp-github
docker compose build mcp-linkedin
docker compose build mcp-reddit
```

**What this does:**
- Compiles TypeScript to JavaScript
- Creates Docker images for each MCP server
- Installs dependencies
- Prepares runtime environment

**Estimated time:** 10-15 minutes

---

### ⚠️ Neo4j Graph Data

**Issue:** Neo4j database is empty (no tool relationships).

**Impact:**
- GraphRAG enhancement unavailable
- Tool relationship suggestions not working
- `OFTEN_USED_WITH`, `DEPENDS_ON` relationships missing

**Required Action:**
```bash
./scripts/init-neo4j.sh
```

**What this does:**
- Creates Neo4j schema (nodes, relationships, indexes)
- Seeds initial tool relationship data
- Creates tool usage tracking infrastructure

**Estimated time:** 2-3 minutes

---

### ⚠️ Metrics Tracking

**Issue:** Metrics endpoint returns placeholder data.

**Impact:**
- `GET /api/v1/metrics` returns all zeros
- No usage statistics available
- Performance tracking unavailable

**Status:** Not yet implemented (planned for Phase 2)

**Workaround:** Use structured logs for now
```bash
# Gateway logs contain performance metrics
tail -f gateway/logs/combined.log | grep tool_selection_completed
```

---

## Complete Setup Workflow

### Quick Start (Minimal)

For testing OAuth and health checks only:

```bash
# 1. Start infrastructure
docker compose up -d vault redis neo4j

# 2. Start gateway
cd gateway && npm install && npm run dev

# 3. Test OAuth API
curl -X POST http://localhost:3000/api/v1/tenants/test-tenant/integrations/github/oauth-config \
  -H "Content-Type: application/json" \
  -d '{"clientId":"your-client-id","clientSecret":"your-secret"}'
```

**What works:**
- ✅ Health checks
- ✅ OAuth credential management
- ✅ Integration module initialization

**What doesn't:**
- ❌ Tool selection
- ❌ Tool invocation
- ❌ Metrics

---

### Full Setup (All Features)

For complete platform functionality:

```bash
# 1. Start all infrastructure
docker compose up -d vault redis neo4j

# 2. Initialize Neo4j
./scripts/init-neo4j.sh

# 3. Generate FAISS indices
cd gateway
npm install
npm run generate-embeddings

# 4. Build MCP servers
cd ..
docker compose build mcp-github mcp-linkedin mcp-reddit

# 5. Start everything
docker compose --profile mcp-servers up -d

# 6. Verify
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

**What works:**
- ✅ Everything except metrics tracking

---

## API Endpoint Status

| Endpoint | Status | Requirements |
|----------|--------|--------------|
| `GET /health` | ✅ Works | None |
| `GET /ready` | ✅ Works | None |
| `POST /api/v1/tenants/.../oauth-config` | ✅ Works | Vault running |
| `GET /api/v1/tenants/.../oauth-config` | ✅ Works | Vault running |
| `POST /api/v1/tools/select` | ⚠️ Needs setup | FAISS indices |
| `POST /api/v1/tools/invoke` | ⚠️ Needs setup | MCP servers + OAuth |
| `GET /api/v1/tools/list` | ⚠️ Needs setup | FAISS indices |
| `GET /api/v1/categories` | ⚠️ Needs setup | FAISS indices |
| `GET /api/v1/metrics` | ⚠️ Placeholder | Implementation pending |

---

## Common Issues

### "FAISS index not found"

**Error:**
```
Error: FAISS index file not found at data/indices/categories.faiss
```

**Solution:**
```bash
cd gateway
npm run generate-embeddings
```

---

### "Cannot connect to MCP server"

**Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:3110
```

**Solution:**
```bash
# Check if MCP servers are running
docker compose ps | grep mcp-

# Start MCP servers
docker compose --profile mcp-servers up -d
```

---

### "OAuth credentials not found"

**Error:**
```
CredentialNotFoundError: No credentials found for tenant test-tenant and integration github
```

**Solution:**
```bash
# Configure OAuth credentials for tenant
curl -X POST http://localhost:3000/api/v1/tenants/test-tenant/integrations/github/oauth-config \
  -H "Content-Type: application/json" \
  -d '{"clientId":"...","clientSecret":"...","redirectUri":"..."}'
```

---

### "Vault is sealed"

**Error:**
```
Error: Vault is sealed
```

**Solution:**
```bash
# Check Vault status
docker compose logs vault

# Restart Vault in dev mode (unseal automatic)
docker compose restart vault
```

---

## Roadmap: When Will This Be Fixed?

### Phase 2 (Weeks 3-6)
- [ ] Pre-generate FAISS indices during build
- [ ] Implement full metrics tracking
- [ ] Add metrics aggregation service
- [ ] Create developer portal with tool catalog

### Phase 3 (Weeks 7-10)
- [ ] Pre-built MCP server Docker images
- [ ] Automated Neo4j seeding
- [ ] One-command setup script
- [ ] Production-ready deployment guide

---

## Getting Help

**Documentation:**
- [Code vs README Verification](CODE_VS_README_VERIFICATION.md) - Detailed gap analysis
- [Multi-Tenant OAuth Setup](MULTI_TENANT_SETUP.md) - OAuth configuration guide
- [API Reference](../README.md#api-reference) - Complete API documentation

**Troubleshooting:**
- Check logs: `docker compose logs gateway`
- Check health: `curl http://localhost:3000/ready`
- Check integrations: `docker compose ps`

**Support:**
- GitHub Issues: Report bugs or ask questions
- GitHub Discussions: Community support
