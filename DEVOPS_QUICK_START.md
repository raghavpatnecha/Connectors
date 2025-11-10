# 🚀 Connectors Platform - DevOps Quick Start

**Environment Status:** ✅ Fully Configured (Docker Required)
**Last Updated:** 2025-11-08

---

## ⚡ 1-Minute Quick Start

```bash
cd /home/user/Connectors

# Start everything
./scripts/verify-docker-environment.sh

# Initialize services
./scripts/init-all-services.sh

# Verify health
./scripts/health-check.sh
```

**Total Time:** 5-10 minutes

---

## 📦 What Gets Deployed

| Service | Port | Purpose | Credentials |
|---------|------|---------|-------------|
| **Gateway** | 3000 | AI Agent API Gateway | - |
| **Vault** | 8200 | OAuth credentials storage | Token: `dev-root-token` |
| **Neo4j** | 7474, 7687 | GraphRAG tool relationships | `neo4j` / `connectors-dev-2024` |
| **Redis** | 6379 | Caching layer | No auth (dev mode) |

---

## 🎯 Access URLs

After deployment, access services at:

- **Gateway Health:** http://localhost:3000/health
- **Vault UI:** http://localhost:8200
- **Neo4j Browser:** http://localhost:7474
- **Redis:** localhost:6379 (use redis-cli)

---

## 📊 Expected Results

### Vault
- ✅ KV v2 secrets engine enabled
- ✅ Transit encryption engine enabled
- ✅ OAuth policy created
- ✅ 3 test credential sets (GitHub, Slack, Jira)

### Neo4j
- ✅ 18 tools seeded
- ✅ 5 categories (code, communication, pm, cloud, data)
- ✅ 7 tool relationships
- ✅ Schema constraints and indexes

### Redis
- ✅ Responding to PING
- ✅ Read/write operations working

### Gateway
- ✅ Connected to Vault, Neo4j, Redis
- ✅ Health endpoint responding
- ✅ Ready to serve requests

---

## 🔧 Common Commands

```bash
# View all services
docker compose ps

# View logs
docker compose logs -f gateway
docker compose logs -f vault
docker compose logs -f neo4j
docker compose logs -f redis

# Restart a service
docker compose restart gateway

# Stop everything
docker compose down

# Health check
./scripts/health-check.sh

# Test connectivity
./scripts/test-connectivity.sh
```

---

## 🐛 Troubleshooting

### Service won't start?
```bash
docker compose logs [service-name]
docker compose restart [service-name]
```

### Can't connect to Vault?
```bash
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='dev-root-token'
vault status
```

### Neo4j authentication failed?
```bash
# Credentials: neo4j / connectors-dev-2024
docker compose exec neo4j cypher-shell -u neo4j -p connectors-dev-2024
```

### Gateway not responding?
```bash
docker compose logs gateway --tail=50
curl http://localhost:3000/health
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **DEPLOYMENT_RUNBOOK.md** | Complete deployment guide (40+ pages) |
| **SERVICE_STATUS_REPORT.md** | Current status and configuration |
| **DOCKER_QUICK_REFERENCE.md** | Docker commands reference |
| **CLAUDE.md** | Development guidelines |

All docs in `/home/user/Connectors/docs/`

---

## 🔐 Test Credentials (in Vault)

After initialization, these credentials are available:

```bash
# GitHub
vault kv get secret/tenants/tenant-test/github

# Slack
vault kv get secret/tenants/tenant-test/slack

# Jira
vault kv get secret/tenants/tenant-test/jira
```

---

## ✅ Health Check Criteria

**Success = ALL of these pass:**

- ✅ All containers show `Up (healthy)` status
- ✅ Vault UI accessible and unsealed
- ✅ Neo4j Browser accessible (18 tools present)
- ✅ Redis responding to PING
- ✅ Gateway `/health` returns 200 OK
- ✅ Inter-service connectivity verified
- ✅ Test credentials stored in Vault

**Run:** `./scripts/health-check.sh` for automated verification

---

## 🚨 Emergency Commands

```bash
# Full restart
docker compose down
docker compose up -d

# Fresh start (deletes all data!)
docker compose down -v
./scripts/verify-docker-environment.sh
./scripts/init-all-services.sh

# View resource usage
docker stats

# Free up space
docker system prune -a
```

---

## 📈 Next Steps

1. ✅ **Deploy services** (scripts ready)
2. ⏳ Implement Gateway semantic routing
3. ⏳ Generate FAISS embeddings
4. ⏳ Create additional MCP integrations
5. ⏳ Build OAuth proxy middleware

---

## 💡 Pro Tips

1. **Always check logs first:** `docker compose logs -f`
2. **Health checks are your friend:** Run `./scripts/health-check.sh` often
3. **Vault token is always:** `dev-root-token` (dev mode only!)
4. **Neo4j password is:** `connectors-dev-2024`
5. **Gateway startup can take 30-60 seconds** (dependencies must be healthy)

---

## 🎓 Learning Resources

```bash
# Explore Neo4j data
docker compose exec neo4j cypher-shell -u neo4j -p connectors-dev-2024
MATCH (t:Tool)-[r]->(related) RETURN t.name, type(r), related.name LIMIT 10;

# Explore Vault
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='dev-root-token'
vault kv list secret/tenants/tenant-test

# Test Redis
docker compose exec redis redis-cli
> SET mykey "Hello"
> GET mykey
```

---

**Questions?** See `/home/user/Connectors/docs/DEPLOYMENT_RUNBOOK.md` for detailed information.

**Status:** 🟢 Ready to Deploy (Docker Required)
