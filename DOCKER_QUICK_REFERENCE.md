# Docker Quick Reference

**Connectors Platform - Development Environment**

---

## 🚀 One-Command Start

```bash
./scripts/start-dev.sh
```

## 🛑 One-Command Stop

```bash
./scripts/stop-dev.sh
```

---

## 📍 Service URLs

| Service | URL | Auth |
|---------|-----|------|
| Gateway API | http://localhost:3000 | - |
| Gateway Health | http://localhost:3000/health | - |
| Vault UI | http://localhost:8200 | `dev-root-token` |
| Neo4j Browser | http://localhost:7474 | neo4j / connectors-dev-2024 |
| Redis Commander | http://localhost:8081 | - |

---

## 🔧 Common Commands

### View Logs
```bash
./scripts/logs.sh              # All services
./scripts/logs.sh gateway      # Specific service
```

### Restart Service
```bash
docker compose restart gateway
```

### Rebuild Service
```bash
docker compose up -d --build gateway
```

### Execute in Container
```bash
docker compose exec gateway sh
docker compose exec gateway npm test
```

### Service Status
```bash
docker compose ps
```

### Stop with Cleanup
```bash
./scripts/stop-dev.sh --volumes    # ⚠️ Deletes all data
```

### Full Reset
```bash
./scripts/reset-dev.sh             # ⚠️ Complete wipe & rebuild
```

---

## 🎯 Start with Profiles

### With MCP Servers
```bash
docker compose --profile mcp-servers up -d
```

### With Monitoring
```bash
docker compose --profile monitoring up -d
```

### All Services
```bash
docker compose --profile mcp-servers --profile monitoring up -d
```

---

## 🗄️ Database Access

### Vault CLI
```bash
docker compose exec vault vault login dev-root-token
docker compose exec vault vault kv get secret/github/oauth
```

### Neo4j Cypher
```bash
docker compose exec neo4j cypher-shell -u neo4j -p connectors-dev-2024
```

### Redis CLI
```bash
docker compose exec redis redis-cli
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -i :3000    # Find process
kill -9 <PID>    # Kill it
```

### Service Won't Start
```bash
./scripts/logs.sh <service-name>
docker compose restart <service-name>
```

### Clean Everything
```bash
docker compose down -v --rmi all
docker system prune -a -f --volumes
```

---

## 📚 Documentation

- **Complete Guide:** `/docs/docker-setup.md`
- **Deployment Summary:** `/docs/DOCKER_DEPLOYMENT_SUMMARY.md`
- **Scripts Help:** `/scripts/README.md`
- **Dev Guidelines:** `/CLAUDE.md`

---

## 💡 Tips

1. **Hot Reload:** Edit `/gateway/src/*` files, changes auto-reload
2. **Data Persists:** Named volumes survive container restarts
3. **Logs Streaming:** Add `-f` flag to follow logs in real-time
4. **Resource Monitor:** Run `docker stats` to see resource usage

---

**Quick Help:** `./scripts/start-dev.sh` or see `/docs/docker-setup.md`
