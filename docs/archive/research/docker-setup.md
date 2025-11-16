# Docker Development Environment Setup

Complete guide for running the Connectors Platform development environment using Docker Compose.

---

## Prerequisites

- **Docker**: Version 24.0+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: Version 2.20+ (included with Docker Desktop)
- **System Requirements**:
  - 8GB RAM minimum (16GB recommended)
  - 20GB free disk space
  - Linux, macOS, or Windows with WSL2

---

## Quick Start

### 1. Start Core Services

```bash
# Start gateway, vault, neo4j, and redis
docker compose up -d

# View logs
docker compose logs -f gateway
```

### 2. Verify Services

```bash
# Check all services are healthy
docker compose ps

# Expected output:
# NAME                    STATUS
# connectors-gateway      Up (healthy)
# connectors-vault        Up (healthy)
# connectors-neo4j        Up (healthy)
# connectors-redis        Up (healthy)
```

### 3. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| Gateway | http://localhost:3000 | N/A |
| Gateway Health | http://localhost:3000/health | N/A |
| Vault UI | http://localhost:8200 | Token: `dev-root-token` |
| Neo4j Browser | http://localhost:7474 | neo4j / connectors-dev-2024 |
| Redis Commander | http://localhost:8081 | N/A |

---

## Service Architecture

```
┌─────────────────────────────────────────────┐
│           Gateway (Port 3000)               │
│  - FAISS Semantic Search                    │
│  - GraphRAG Integration                     │
│  - OAuth Proxy                              │
│  - Progressive Loading                      │
└─────┬───────────┬───────────┬───────────────┘
      │           │           │
  ┌───▼───┐   ┌───▼───┐   ┌───▼───┐   ┌─────────┐
  │ Vault │   │Neo4j  │   │ Redis │   │   MCP   │
  │ :8200 │   │ :7687 │   │ :6379 │   │ Servers │
  └───────┘   └───────┘   └───────┘   └─────────┘
```

---

## Detailed Service Configuration

### Gateway Service

**Container:** `connectors-gateway`

**Ports:**
- `3000:3000` - HTTP API

**Environment Variables:**
```bash
NODE_ENV=development
LOG_LEVEL=debug
VAULT_ADDR=http://vault:8200
NEO4J_URI=bolt://neo4j:7687
REDIS_URL=redis://redis:6379
MAX_TOOLS_PER_QUERY=5
TOKEN_BUDGET_DEFAULT=2000
```

**Volumes:**
- `./gateway/src:/app/src:ro` - Hot-reload source code
- `gateway-data:/app/data` - FAISS index and persistent data
- `gateway-logs:/app/logs` - Application logs

**Health Check:**
```bash
curl http://localhost:3000/health
```

### HashiCorp Vault

**Container:** `connectors-vault`

**Ports:**
- `8200:8200` - Vault API & UI

**Development Token:** `dev-root-token`

**Common Operations:**
```bash
# Login to Vault
docker compose exec vault vault login dev-root-token

# Store a secret
docker compose exec vault vault kv put secret/github/oauth \
  client_id=your_client_id \
  client_secret=your_client_secret

# Retrieve a secret
docker compose exec vault vault kv get secret/github/oauth

# Enable transit engine (for encryption)
docker compose exec vault vault secrets enable transit
```

**Vault UI:** http://localhost:8200/ui

### Neo4j Graph Database

**Container:** `connectors-neo4j`

**Ports:**
- `7474:7474` - HTTP (Browser UI)
- `7687:7687` - Bolt Protocol

**Credentials:**
- Username: `neo4j`
- Password: `connectors-dev-2024`

**Common Cypher Queries:**
```cypher
// View all tool nodes
MATCH (t:Tool) RETURN t LIMIT 25;

// View tool relationships
MATCH (t1:Tool)-[r:OFTEN_USED_WITH]->(t2:Tool)
RETURN t1.name, type(r), t2.name
LIMIT 10;

// Find tools by category
MATCH (t:Tool {category: 'code'})
RETURN t.name, t.description
ORDER BY t.usageCount DESC
LIMIT 10;

// View relationship patterns
MATCH p=(t1:Tool)-[*1..2]-(t2:Tool)
WHERE t1.id = 'github.createPR'
RETURN p
LIMIT 5;
```

**Neo4j Browser:** http://localhost:7474

### Redis Cache

**Container:** `connectors-redis`

**Ports:**
- `6379:6379` - Redis Protocol

**Configuration:**
- Max Memory: 512MB (development)
- Eviction Policy: allkeys-lru
- Persistence: AOF enabled

**Common Commands:**
```bash
# Connect to Redis CLI
docker compose exec redis redis-cli

# View all keys
KEYS *

# Get cached tool selection
GET tool_selection:create_github_pr

# View cache statistics
INFO stats

# Clear all cache
FLUSHALL
```

**Redis Commander:** http://localhost:8081

---

## MCP Server Configuration

### Start MCP Servers

MCP servers are in a separate profile to avoid unnecessary startup:

```bash
# Start with MCP servers
docker compose --profile mcp-servers up -d

# Or start specific MCP server
docker compose up -d mcp-code
```

### Available MCP Servers

1. **mcp-code** - Code integrations (GitHub, GitLab, etc.)
2. **mcp-communication** - Communication tools (Slack, Email, etc.)

---

## Monitoring (Optional)

### Enable Prometheus & Grafana

```bash
# Start monitoring stack
docker compose --profile monitoring up -d

# Access Grafana
open http://localhost:3001
# Credentials: admin / admin
```

**Grafana Dashboards:**
- Gateway Performance
- FAISS Query Latency
- GraphRAG Relationship Queries
- OAuth Token Refresh Metrics
- Redis Cache Hit Rate

---

## Development Workflows

### Hot Reload Development

The gateway service automatically reloads when you modify source files:

```bash
# Edit code
vim gateway/src/routing/semantic-router.ts

# Watch logs for reload
docker compose logs -f gateway
```

### Running Tests

```bash
# Run tests in gateway container
docker compose exec gateway npm test

# Run with coverage
docker compose exec gateway npm run test:coverage

# Run specific test file
docker compose exec gateway npm test semantic-router.test.ts
```

### Debugging

```bash
# Attach to gateway container
docker compose exec gateway sh

# View real-time logs
docker compose logs -f

# View specific service logs
docker compose logs -f gateway

# Follow logs with timestamps
docker compose logs -f -t gateway
```

### Database Inspection

```bash
# Neo4j: Export graph data
docker compose exec neo4j cypher-shell -u neo4j -p connectors-dev-2024 \
  "MATCH (n) RETURN n LIMIT 100" > graph-export.csv

# Redis: Backup data
docker compose exec redis redis-cli SAVE

# Vault: Export secrets (development only)
docker compose exec vault vault kv get -format=json secret/github/oauth
```

---

## Common Operations

### Start/Stop Services

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes (⚠️ DATA LOSS)
docker compose down -v

# Restart specific service
docker compose restart gateway

# Rebuild and restart
docker compose up -d --build gateway
```

### View Service Status

```bash
# List all containers
docker compose ps

# View resource usage
docker stats

# Check service health
docker compose ps --format json | jq '.[].Health'
```

### Clean Up

```bash
# Remove stopped containers
docker compose down

# Remove all data volumes
docker compose down -v

# Remove images
docker compose down --rmi all

# Full cleanup
docker compose down -v --rmi all --remove-orphans
```

---

## Troubleshooting

### Gateway Won't Start

**Issue:** Gateway container exits immediately

```bash
# Check logs
docker compose logs gateway

# Common fixes:
# 1. Vault not ready
docker compose up -d vault
docker compose up -d gateway

# 2. Port 3000 already in use
lsof -i :3000
kill -9 <PID>

# 3. Node modules issue
docker compose build --no-cache gateway
docker compose up -d gateway
```

### Vault Unsealed Error

**Issue:** Vault is sealed (production mode)

```bash
# Development mode should auto-unseal, but if not:
docker compose exec vault vault operator unseal

# Or restart in dev mode
docker compose restart vault
```

### Neo4j Memory Issues

**Issue:** Neo4j crashes or won't start

```bash
# Check logs
docker compose logs neo4j

# Reduce memory in docker-compose.override.yml:
# NEO4J_server_memory_heap_max__size=512m

# Restart
docker compose restart neo4j
```

### Redis Connection Refused

**Issue:** Gateway can't connect to Redis

```bash
# Check Redis is running
docker compose ps redis

# Test connection
docker compose exec redis redis-cli ping

# Restart Redis
docker compose restart redis
```

### Port Conflicts

**Issue:** Port already in use

```bash
# Find process using port
lsof -i :3000
lsof -i :8200
lsof -i :7474

# Kill process
kill -9 <PID>

# Or change port in docker-compose.override.yml
```

### Network Issues

**Issue:** Services can't communicate

```bash
# Check network
docker network ls
docker network inspect connectors_connectors-network

# Recreate network
docker compose down
docker compose up -d
```

---

## Performance Optimization

### Resource Limits

Edit `docker-compose.yml` to add resource constraints:

```yaml
services:
  gateway:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

### Volume Performance

For macOS/Windows, use delegated volumes for better performance:

```yaml
volumes:
  - ./gateway/src:/app/src:delegated
```

### Build Cache

Speed up builds with BuildKit:

```bash
# Enable BuildKit
export DOCKER_BUILDKIT=1

# Build with cache
docker compose build --parallel
```

---

## Production Considerations

**⚠️ This setup is for DEVELOPMENT ONLY**

For production deployment:

1. **Remove dev mode from Vault**
   - Use proper Vault configuration
   - Enable auto-unseal
   - Setup proper TLS

2. **Secure Neo4j**
   - Change default password
   - Enable TLS
   - Restrict network access

3. **Redis Security**
   - Enable authentication
   - Use persistent storage
   - Configure proper eviction

4. **Gateway**
   - Use production build
   - Enable rate limiting
   - Setup proper logging
   - Configure TLS

5. **Use Kubernetes**
   - See `/k8s` directory for manifests
   - Setup proper secrets management
   - Configure auto-scaling

---

## Next Steps

1. **Setup Gateway Source Code:**
   - Fork `agentic-community/mcp-gateway-registry`
   - Implement FAISS semantic router
   - Add GraphRAG integration

2. **Generate MCP Servers:**
   - Use `generator/openapi_generator.py`
   - Add OAuth configurations
   - Generate integration tests

3. **Configure Vault:**
   - Setup OAuth credentials
   - Configure auto-refresh
   - Enable audit logging

4. **Populate Neo4j:**
   - Import tool relationships
   - Add usage patterns
   - Setup GraphRAG queries

---

## Useful Commands

```bash
# View all container logs
docker compose logs --tail=100

# Stream gateway logs
docker compose logs -f gateway

# Execute command in container
docker compose exec gateway npm run lint

# Shell into container
docker compose exec gateway sh

# View environment variables
docker compose exec gateway env

# Check disk usage
docker system df

# Prune unused data
docker system prune -a

# Export database
docker compose exec neo4j neo4j-admin dump --to=/backups/neo4j.dump

# Backup Vault
docker compose exec vault vault operator raft snapshot save /vault/backups/snapshot.snap
```

---

## Support

For issues or questions:
- Check logs: `docker compose logs -f`
- Review health: `docker compose ps`
- Restart services: `docker compose restart`
- Full reset: `docker compose down -v && docker compose up -d`

---

**Last Updated:** 2024-11-08
**Version:** 1.0.0
