# Connectors Platform - Deployment Runbook

**DevOps Engineer Guide**
**Version:** 1.0
**Last Updated:** 2025-11-08

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Verification Checklist](#verification-checklist)
5. [Troubleshooting](#troubleshooting)
6. [Rollback Procedures](#rollback-procedures)
7. [Maintenance Tasks](#maintenance-tasks)

---

## Quick Start

**For experienced DevOps engineers:**

```bash
cd /home/user/Connectors

# 1. Start all services
./scripts/verify-docker-environment.sh

# 2. Initialize services
./scripts/init-all-services.sh

# 3. Verify health
./scripts/health-check.sh

# 4. Test connectivity
./scripts/test-connectivity.sh
```

**Expected Duration:** 5-10 minutes
**Services:** Gateway, Vault, Neo4j, Redis

---

## Prerequisites

### System Requirements

- **OS:** Linux, macOS, or Windows with WSL2
- **CPU:** 4+ cores recommended
- **RAM:** 8GB minimum, 16GB recommended
- **Disk:** 20GB available space
- **Docker:** 20.10+ with Docker Compose V2

### Software Dependencies

✅ Docker Engine 20.10+
✅ Docker Compose V2
✅ Bash 4.0+
✅ curl
✅ wget
✅ nc (netcat)
✅ vault CLI (optional, for manual Vault operations)
✅ redis-cli (optional, for manual Redis operations)

### Verification

```bash
# Check Docker
docker --version
docker compose version
docker info

# Check shell tools
bash --version
curl --version
wget --version
nc -h
```

---

## Step-by-Step Deployment

### Step 1: Environment Setup

**Duration:** 2 minutes

1. **Navigate to project directory:**
   ```bash
   cd /home/user/Connectors
   ```

2. **Make scripts executable:**
   ```bash
   chmod +x scripts/*.sh
   ```

3. **Review environment configuration:**
   ```bash
   cat docker-compose.yml | grep -A 20 "environment:"
   ```

4. **Verify network subnet (optional):**
   ```bash
   docker network ls
   docker network inspect connectors-network || echo "Network will be created"
   ```

**✅ Checkpoint:** All scripts are executable, docker-compose.yml exists

---

### Step 2: Start Core Infrastructure

**Duration:** 2-3 minutes

1. **Start infrastructure services (Vault, Neo4j, Redis):**
   ```bash
   docker compose up -d vault neo4j redis
   ```

2. **Wait for services to initialize:**
   ```bash
   echo "Waiting 30 seconds for services to stabilize..."
   sleep 30
   ```

3. **Check infrastructure status:**
   ```bash
   docker compose ps
   ```

   **Expected output:**
   ```
   NAME                  STATUS          PORTS
   connectors-vault      Up (healthy)    0.0.0.0:8200->8200/tcp
   connectors-neo4j      Up (healthy)    0.0.0.0:7474->7474/tcp, 0.0.0.0:7687->7687/tcp
   connectors-redis      Up (healthy)    0.0.0.0:6379->6379/tcp
   ```

**✅ Checkpoint:** All infrastructure services show `Up (healthy)` status

---

### Step 3: Start Gateway Service

**Duration:** 1 minute

1. **Start gateway:**
   ```bash
   docker compose up -d gateway
   ```

2. **Wait for gateway initialization:**
   ```bash
   echo "Waiting 30 seconds for gateway to initialize..."
   sleep 30
   ```

3. **Check gateway logs:**
   ```bash
   docker compose logs gateway | tail -20
   ```

4. **Verify gateway health:**
   ```bash
   curl http://localhost:3000/health
   ```

   **Expected output:** `{"status":"ok"}` or similar

**✅ Checkpoint:** Gateway is running and health endpoint responds

---

### Step 4: Initialize Vault

**Duration:** 1 minute

1. **Run Vault initialization script:**
   ```bash
   export VAULT_ADDR='http://localhost:8200'
   export VAULT_TOKEN='dev-root-token'

   # Enable secrets engines
   vault secrets enable -path=secret kv-v2 2>/dev/null || echo "KV v2 already enabled"
   vault secrets enable transit 2>/dev/null || echo "Transit already enabled"
   ```

2. **Create OAuth policy:**
   ```bash
   cat > /tmp/oauth-policy.hcl << 'EOF'
   # OAuth Credentials Management Policy
   path "secret/data/tenants/*" {
     capabilities = ["create", "read", "update", "delete", "list"]
   }
   path "secret/metadata/tenants/*" {
     capabilities = ["read", "list"]
   }
   path "transit/encrypt/*" {
     capabilities = ["create", "update"]
   }
   path "transit/decrypt/*" {
     capabilities = ["create", "update"]
   }
   path "transit/keys/*" {
     capabilities = ["create", "read", "update", "delete", "list"]
   }
   EOF

   vault policy write oauth-policy /tmp/oauth-policy.hcl
   ```

3. **Create encryption keys:**
   ```bash
   vault write -f transit/keys/tenant-test type=aes256-gcm96
   vault write -f transit/keys/tenant-demo type=aes256-gcm96
   ```

4. **Verify Vault setup:**
   ```bash
   vault secrets list
   vault policy list
   vault list transit/keys
   ```

**✅ Checkpoint:** Vault has KV and Transit engines enabled, OAuth policy created

---

### Step 5: Initialize Neo4j GraphRAG

**Duration:** 1-2 minutes

1. **Run Neo4j initialization script:**
   ```bash
   ./scripts/init-neo4j.sh
   ```

2. **Verify Neo4j schema:**
   ```bash
   docker compose exec neo4j cypher-shell -u neo4j -p connectors-dev-2024 \
     "CALL db.constraints()"
   ```

3. **Verify seed data:**
   ```bash
   docker compose exec neo4j cypher-shell -u neo4j -p connectors-dev-2024 \
     "MATCH (t:Tool) RETURN count(t) as total_tools"
   ```

   **Expected output:** `total_tools: 18`

4. **Verify categories:**
   ```bash
   docker compose exec neo4j cypher-shell -u neo4j -p connectors-dev-2024 \
     "MATCH (c:Category) RETURN c.name, c.toolCount ORDER BY c.name"
   ```

   **Expected output:**
   ```
   "cloud"              3
   "code"               4
   "communication"      3
   "data"               3
   "project-management" 3
   ```

**✅ Checkpoint:** Neo4j has 18 tools across 5 categories with relationships

---

### Step 6: Store Test Credentials

**Duration:** 1 minute

1. **Create test GitHub credentials:**
   ```bash
   EXPIRY=$(date -u -d "+24 hours" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+24H +"%Y-%m-%dT%H:%M:%SZ")

   vault kv put secret/tenants/tenant-test/github \
     access_token="ghp_test_token_1234567890" \
     refresh_token="ghp_refresh_token_0987654321" \
     token_type="Bearer" \
     expires_at="$EXPIRY" \
     scopes="repo,user,workflow"
   ```

2. **Create test Slack credentials:**
   ```bash
   vault kv put secret/tenants/tenant-test/slack \
     access_token="xoxb-test-slack-token" \
     refresh_token="xoxe-test-refresh" \
     token_type="Bearer" \
     expires_at="$EXPIRY" \
     scopes="chat:write,channels:read"
   ```

3. **Create test Jira credentials:**
   ```bash
   vault kv put secret/tenants/tenant-test/jira \
     access_token="jira_test_token" \
     refresh_token="jira_refresh_token" \
     token_type="Bearer" \
     expires_at="$EXPIRY" \
     scopes="read:jira-work,write:jira-work" \
     site_url="https://test-company.atlassian.net"
   ```

4. **Verify credentials:**
   ```bash
   vault kv list secret/tenants/tenant-test
   vault kv get secret/tenants/tenant-test/github
   ```

**✅ Checkpoint:** 3 test credential sets stored in Vault

---

### Step 7: Verify Deployment

**Duration:** 2 minutes

1. **Run comprehensive health check:**
   ```bash
   ./scripts/health-check.sh
   ```

   **Expected result:** All checks pass (green ✅)

2. **Run connectivity tests:**
   ```bash
   ./scripts/test-connectivity.sh
   ```

   **Expected result:** All connectivity tests pass

3. **Check container resource usage:**
   ```bash
   docker stats --no-stream
   ```

4. **View consolidated logs:**
   ```bash
   docker compose logs --tail=50
   ```

**✅ Checkpoint:** All health checks pass, no errors in logs

---

## Verification Checklist

Use this checklist to verify a successful deployment:

### Container Health

- [ ] **Vault container:** Status = `Up (healthy)`
- [ ] **Neo4j container:** Status = `Up (healthy)`
- [ ] **Redis container:** Status = `Up (healthy)`
- [ ] **Gateway container:** Status = `Up (healthy)`

### Service Endpoints

- [ ] **Vault UI:** http://localhost:8200 accessible
- [ ] **Neo4j Browser:** http://localhost:7474 accessible
- [ ] **Gateway Health:** http://localhost:3000/health returns success
- [ ] **Redis:** Port 6379 accepting connections

### Data Verification

- [ ] **Vault:** KV v2 engine enabled at `secret/`
- [ ] **Vault:** Transit engine enabled
- [ ] **Vault:** OAuth policy exists
- [ ] **Vault:** 3 test credential sets stored (GitHub, Slack, Jira)
- [ ] **Neo4j:** 18 tools seeded
- [ ] **Neo4j:** 5 categories created
- [ ] **Neo4j:** Relationships exist between tools
- [ ] **Redis:** Can read/write test keys

### Connectivity

- [ ] **Gateway → Vault:** HTTP connectivity verified
- [ ] **Gateway → Neo4j:** Bolt connectivity verified (port 7687)
- [ ] **Gateway → Redis:** Connectivity verified (port 6379)
- [ ] **Host → All services:** External access working

### Performance

- [ ] **Gateway response time:** < 2 seconds
- [ ] **Vault response time:** < 100ms
- [ ] **Neo4j query time:** < 500ms
- [ ] **Redis latency:** < 10ms

---

## Troubleshooting

### Common Issues

#### Issue 1: Container Not Starting

**Symptoms:**
- Container status shows `Exited` or `Restarting`
- Health check fails repeatedly

**Diagnosis:**
```bash
docker compose ps
docker compose logs [service-name]
```

**Solutions:**
1. Check logs for error messages
2. Verify environment variables in docker-compose.yml
3. Ensure ports are not in use: `netstat -tulpn | grep -E '3000|6379|7474|7687|8200'`
4. Restart container: `docker compose restart [service-name]`
5. Rebuild if needed: `docker compose up -d --build [service-name]`

---

#### Issue 2: Vault Sealed/Unavailable

**Symptoms:**
- Vault returns "sealed" error
- Gateway cannot connect to Vault

**Diagnosis:**
```bash
docker compose exec vault vault status
```

**Solutions:**
1. In dev mode, Vault should auto-unseal
2. Restart Vault: `docker compose restart vault`
3. Check Vault logs: `docker compose logs vault`
4. Verify environment variables: `docker compose exec vault env | grep VAULT`

---

#### Issue 3: Neo4j Authentication Failed

**Symptoms:**
- `cypher-shell` returns authentication error
- Gateway cannot query Neo4j

**Diagnosis:**
```bash
docker compose exec neo4j cypher-shell -u neo4j -p connectors-dev-2024 "RETURN 1"
```

**Solutions:**
1. Verify password in docker-compose.yml: `connectors-dev-2024`
2. Check Neo4j logs: `docker compose logs neo4j | grep -i auth`
3. Reset password (if needed):
   ```bash
   docker compose exec neo4j neo4j-admin set-initial-password connectors-dev-2024
   ```
4. Restart Neo4j: `docker compose restart neo4j`

---

#### Issue 4: Gateway Not Responding

**Symptoms:**
- http://localhost:3000/health returns 502/504
- Gateway container exits immediately

**Diagnosis:**
```bash
docker compose logs gateway --tail=100
docker compose exec gateway ps aux
```

**Solutions:**
1. Check if dependencies are healthy: `docker compose ps`
2. Verify environment variables match other services
3. Check TypeScript compilation errors in logs
4. Restart gateway: `docker compose restart gateway`
5. Rebuild if code changed: `docker compose up -d --build gateway`

---

#### Issue 5: Inter-Service Connectivity Issues

**Symptoms:**
- Gateway can't reach Vault/Neo4j/Redis
- Network errors in logs

**Diagnosis:**
```bash
docker network inspect connectors-network
docker compose exec gateway ping vault
docker compose exec gateway ping neo4j
docker compose exec gateway ping redis
```

**Solutions:**
1. Verify all services on same network: `docker compose ps --format json | jq '.[].Networks'`
2. Recreate network:
   ```bash
   docker compose down
   docker network rm connectors-network
   docker compose up -d
   ```
3. Check firewall rules (if applicable)
4. Verify DNS resolution inside containers

---

### Debug Commands

```bash
# View all container logs
docker compose logs -f

# View specific service logs
docker compose logs -f gateway

# Execute shell in container
docker compose exec gateway sh
docker compose exec vault sh
docker compose exec neo4j bash
docker compose exec redis sh

# Inspect container details
docker inspect connectors-gateway

# Check network connectivity
docker compose exec gateway nc -zv vault 8200
docker compose exec gateway nc -zv neo4j 7687
docker compose exec gateway nc -zv redis 6379

# Monitor container stats
docker stats

# Check disk usage
docker system df
```

---

## Rollback Procedures

### Full Rollback

**When:** Complete deployment failure, need to start fresh

```bash
# 1. Stop all services
docker compose down

# 2. Remove volumes (WARNING: deletes all data)
docker volume rm connectors_vault-data connectors_neo4j-data connectors_redis-data connectors_gateway-data

# 3. Remove network
docker network rm connectors-network

# 4. Redeploy from scratch
./scripts/verify-docker-environment.sh
./scripts/init-all-services.sh
```

### Partial Rollback

**When:** Single service needs reset

**Vault:**
```bash
docker compose stop vault
docker volume rm connectors_vault-data
docker compose up -d vault
./scripts/init-all-services.sh  # Re-run initialization
```

**Neo4j:**
```bash
docker compose stop neo4j
docker volume rm connectors_neo4j-data
docker compose up -d neo4j
./scripts/init-neo4j.sh
```

**Redis:**
```bash
docker compose exec redis redis-cli FLUSHALL
docker compose restart redis
```

**Gateway:**
```bash
docker compose restart gateway
# Or rebuild:
docker compose up -d --build gateway
```

---

## Maintenance Tasks

### Daily Tasks

1. **Monitor service health:**
   ```bash
   ./scripts/health-check.sh
   ```

2. **Check logs for errors:**
   ```bash
   docker compose logs --since 24h | grep -i error
   ```

3. **Verify disk space:**
   ```bash
   df -h
   docker system df
   ```

### Weekly Tasks

1. **Review Vault audit logs:**
   ```bash
   docker compose exec vault cat /vault/logs/audit.log | tail -100
   ```

2. **Backup Neo4j data:**
   ```bash
   docker compose exec neo4j neo4j-admin backup --backup-dir=/backups
   ```

3. **Clean unused Docker resources:**
   ```bash
   docker system prune -a --volumes --filter "until=168h"  # Older than 7 days
   ```

### Monthly Tasks

1. **Update Docker images:**
   ```bash
   docker compose pull
   docker compose up -d --build
   ```

2. **Review and rotate credentials:**
   ```bash
   # List all tenant credentials
   vault kv list secret/tenants/
   # Update expiring tokens
   ```

3. **Performance tuning based on metrics:**
   - Review container resource usage
   - Adjust Neo4j memory settings if needed
   - Tune Redis maxmemory based on usage

---

## Access Information

### Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Gateway | http://localhost:3000 | N/A |
| Gateway Health | http://localhost:3000/health | N/A |
| Vault UI | http://localhost:8200 | Token: `dev-root-token` |
| Neo4j Browser | http://localhost:7474 | User: `neo4j`, Pass: `connectors-dev-2024` |
| Redis | localhost:6379 | No auth (dev mode) |

### Test Credentials (in Vault)

```bash
# List all test credentials
vault kv list secret/tenants/tenant-test

# View GitHub credentials
vault kv get secret/tenants/tenant-test/github

# View Slack credentials
vault kv get secret/tenants/tenant-test/slack

# View Jira credentials
vault kv get secret/tenants/tenant-test/jira
```

---

## Support

### Useful Commands Reference

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart a service
docker compose restart [service-name]

# View logs
docker compose logs -f [service-name]

# Execute command in container
docker compose exec [service-name] [command]

# Check service health
./scripts/health-check.sh

# Test connectivity
./scripts/test-connectivity.sh

# Re-initialize services
./scripts/init-all-services.sh
```

### Emergency Contacts

- **DevOps Team:** [your-email@example.com]
- **On-Call:** [on-call-rotation]
- **Incident Channel:** #connectors-incidents

---

**Document Version:** 1.0
**Last Updated:** 2025-11-08
**Next Review:** 2025-12-08
