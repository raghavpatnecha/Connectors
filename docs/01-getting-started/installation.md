# Installation Guide

Complete guide to installing the Connectors Platform.

---

## Prerequisites

### System Requirements

- **RAM**: 8GB minimum (16GB recommended)
- **Disk**: 20GB free
- **OS**: Linux, macOS, or Windows with WSL2

### Software

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** 24+ ([Download](https://docs.docker.com/get-docker/))
- **Docker Compose** v2.20+ (included with Docker Desktop)
- **Git** 2.30+ ([Download](https://git-scm.com/))

### Verify Installations

```bash
node --version    # v18.0.0+
docker --version  # 24.0.0+
docker compose version  # v2.20.0+
```

---

## Step 1: Clone Repository

```bash
git clone https://github.com/your-org/connectors.git
cd connectors
```

---

## Step 2: Start Services

```bash
docker compose up -d

# Verify (wait 30-60s)
docker compose ps
```

**Expected:** All services show "Up (healthy)"

---

## Step 3: Initialize

### Neo4j Schema

```bash
./scripts/init-neo4j.sh
```

### FAISS Embeddings

```bash
cd gateway
npm install
npm run generate-embeddings
```

**Required** before using `/api/v1/tools/select`

---

## Step 4: Verify

### Gateway Health

```bash
curl http://localhost:3000/health
```

**Response:** `{"status":"ok","uptime":45.23}`

### Readiness

```bash
curl http://localhost:3000/ready
```

**Response:** `{"status":"ready","checks":{"vault":"ok","neo4j":"ok","redis":"ok","faiss":"ok"}}`

### Access UIs

- Gateway: http://localhost:3000/health
- Vault: http://localhost:8200/ui (token: `dev-root-token`)
- Neo4j: http://localhost:7474 (neo4j / connectors-dev-2024)

---

## Step 5: Test

```bash
curl -X POST http://localhost:3000/api/v1/tools/select \
  -H "Content-Type: application/json" \
  -d '{"query":"create a GitHub pull request","context":{"maxTools":5}}'
```

**Success:** Returns `{"success": true, "tools": {...}, "metadata": {"tokenUsage": 285}}`

---

## Troubleshooting

### Port Already in Use

```bash
lsof -i :3000 && kill -9 <PID>
# Or change port in docker-compose.yml
```

### Services Won't Start

```bash
docker compose logs gateway  # View logs
docker compose down -v && docker compose up -d  # Full cleanup
```

### Vault Unsealed Error

```bash
docker compose restart vault
```

### Neo4j Memory Error

```bash
# Edit docker-compose.yml: NEO4J_server_memory_heap_max__size: 512m
docker compose restart neo4j
```

### FAISS Not Generated

```bash
cd gateway && npm install && npm run generate-embeddings
```

### Redis Connection Refused

```bash
docker compose exec redis redis-cli ping  # Should return PONG
docker compose restart redis
```

---

## Service Access

| Service | URL | Credentials |
|---------|-----|-------------|
| Gateway | http://localhost:3000 | - |
| Vault | http://localhost:8200/ui | dev-root-token |
| Neo4j | http://localhost:7474 | neo4j / connectors-dev-2024 |

---

## Optional Components

### MCP Servers

```bash
docker compose --profile mcp-servers up -d
```

### Monitoring

```bash
docker compose --profile monitoring up -d
# Grafana: http://localhost:3001 (admin/admin)
```

---

## Useful Commands

```bash
docker compose logs -f gateway     # View logs
docker compose restart gateway     # Restart
docker compose down                # Stop all
docker compose down -v             # Full cleanup
docker compose up -d --build gateway  # Rebuild
docker compose exec gateway sh     # Shell
cd gateway && npm test             # Tests
```

---

## Next Steps

✅ **Installation complete!**

[Continue to Quick Start →](quick-start.md)
