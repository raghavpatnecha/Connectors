# Docker Deployment Guide

**Connectors Platform - Docker Compose for Development**

---

## Overview

Deploy locally using Docker Compose for development and testing.

**Duration:** 5-10 minutes | **Resources:** 8GB RAM, 4 CPUs, 20GB disk

---

## Prerequisites

```bash
docker --version                # Docker 24.0+
docker compose version          # Compose V2.20+
```

**Requirements:** Docker Desktop or Engine, 8GB RAM, 4 CPUs, 20GB disk

---

## Quick Start

```bash
cd /home/user/Connectors
docker compose up -d
docker compose ps
curl http://localhost:3000/health
```

**Expected:**
```
connectors-gateway    Up (healthy)    0.0.0.0:3000->3000/tcp
connectors-vault      Up (healthy)    0.0.0.0:8200->8200/tcp
connectors-neo4j      Up (healthy)    0.0.0.0:7474->7474/tcp
connectors-redis      Up (healthy)    0.0.0.0:6379->6379/tcp
```

---

## Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Gateway | http://localhost:3000 | - |
| Vault | http://localhost:8200 | Token: `dev-root-token` |
| Neo4j | http://localhost:7474 | neo4j / connectors-dev-2024 |
| Redis | localhost:6379 | - |

---

## Gateway

**Port:** 3000 | **Environment:** `NODE_ENV=development`, `VAULT_ADDR=http://vault:8200`

```bash
curl http://localhost:3000/health
docker compose logs -f gateway
```

---

## Vault

**Port:** 8200 | **Token:** `dev-root-token`

```bash
# Login
docker compose exec vault vault login dev-root-token

# Store credentials
docker compose exec vault vault kv put secret/tenants/test/github \
  client_id=your_id client_secret=your_secret

# Retrieve
docker compose exec vault vault kv get secret/tenants/test/github

# Enable encryption
docker compose exec vault vault secrets enable transit
docker compose exec vault vault write -f transit/keys/tenant-test
```

---

## Neo4j

**Ports:** 7474, 7687 | **Auth:** neo4j / connectors-dev-2024

```cypher
// All tools
MATCH (t:Tool) RETURN t LIMIT 25;

// Relationships
MATCH (t1:Tool)-[r:OFTEN_USED_WITH]->(t2:Tool)
RETURN t1.name, type(r), t2.name LIMIT 10;

// By category
MATCH (t:Tool {category: 'code'})
RETURN t.name ORDER BY t.usageCount DESC LIMIT 10;

// GraphRAG
MATCH p=(t1:Tool)-[*1..2]-(t2:Tool)
WHERE t1.id = 'github.createPR' RETURN p LIMIT 5;
```

**CLI:** `docker compose exec neo4j cypher-shell -u neo4j -p connectors-dev-2024`

---

## Redis

```bash
docker compose exec redis redis-cli
KEYS *
INFO stats
FLUSHALL
```

---

## Development

### Hot Reload
```bash
vim gateway/src/routing/semantic-router.ts
docker compose logs -f gateway
```

### Tests
```bash
docker compose exec gateway npm test
docker compose exec gateway npm run test:coverage
```

### Export Data
```bash
# Neo4j
docker compose exec neo4j cypher-shell -u neo4j -p connectors-dev-2024 \
  "MATCH (n) RETURN n LIMIT 100" > export.csv

# Redis
docker compose exec redis redis-cli SAVE

# Vault
docker compose exec vault vault kv get -format=json secret/tenants/test/github
```

---

## Advanced

```bash
# MCP servers
docker compose --profile mcp-servers up -d

# Monitoring
docker compose --profile monitoring up -d
open http://localhost:3001  # Grafana: admin/admin
```

---

## Common Commands

```bash
# Start/Stop
docker compose up -d
docker compose down
docker compose down -v  # ⚠️ Deletes data

# Service Management
docker compose restart gateway
docker compose up -d --build gateway
docker compose ps
docker stats

# Logs
docker compose logs --tail=100
docker compose logs -f gateway
docker compose logs -f -t gateway

# Shell
docker compose exec gateway sh
docker compose exec vault sh
```

---

## Troubleshooting

### Port Conflict
```bash
lsof -i :3000
kill -9 <PID>
```

### Gateway Won't Start
```bash
docker compose logs gateway
docker compose up -d vault && sleep 10 && docker compose up -d gateway
docker compose build --no-cache gateway && docker compose up -d gateway
```

### Neo4j Memory
```bash
docker compose logs neo4j
# Edit docker-compose.yml: NEO4J_server_memory_heap_max__size=512m
docker compose restart neo4j
```

### Network Issues
```bash
docker network inspect connectors-network
docker compose down && docker network rm connectors-network && docker compose up -d
```

---

## Verification

- [ ] All containers `Up (healthy)`
- [ ] Gateway health responds
- [ ] Vault UI accessible
- [ ] Neo4j Browser accessible
- [ ] Redis connections work

**Script:** `./scripts/health-check.sh`

---

## Cleanup

```bash
docker compose down              # Keep data
docker compose down -v           # ⚠️ Delete data
docker compose down -v --rmi all # Delete everything
```

---

## Next Steps

1. Initialize: `./scripts/init-all-services.sh`
2. Store OAuth credentials in Vault
3. Seed Neo4j with tools
4. Test MCP calls
