# MCP Server Orchestration Guide

Complete guide for running all MCP servers (Google Workspace + Others) using Docker Compose.

---

## 📊 Infrastructure Overview

### Total MCP Ecosystem

**18 Total Containers**:
- **4 Core Services**: Gateway, Vault, Neo4j, Redis
- **14 MCP Servers**:
  - **10 Google Workspace**: Gmail, Calendar, Drive, Docs, Sheets, Slides, Forms, Tasks, Chat, Search
  - **4 Other Integrations**: GitHub, LinkedIn, Reddit, Notion

### Architecture

```
┌─────────────────────────────────────────┐
│   AI Agent (Claude, ChatGPT, etc.)     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   Gateway (Port 3000)                   │
│   - Semantic routing (FAISS)            │
│   - GraphRAG (Neo4j)                    │
│   - OAuth proxy (Vault)                 │
│   - Token optimization                  │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴───────────────────────┐
       │                               │
┌──────▼──────────┐          ┌────────▼────────┐
│ Google Workspace│          │ Other MCPs      │
│ (10 services)   │          │ (4 services)    │
│ Ports 3130-3139 │          │ Ports 3100-3200 │
└─────────────────┘          └─────────────────┘
```

---

## 🚀 Quick Start

### Start Everything (Recommended)

```bash
# Start all 18 containers (core + 14 MCP servers)
docker compose --profile mcp-servers up -d
```

**What this starts**:
- ✅ Gateway (semantic routing, GraphRAG)
- ✅ Vault (credential storage)
- ✅ Neo4j (GraphRAG database)
- ✅ Redis (caching)
- ✅ All 10 Google Workspace services
- ✅ GitHub, LinkedIn, Reddit, Notion MCPs

**Total**: 18 containers running

---

## 🎛️ Startup Options

### Option 1: All MCP Servers (14 services)

```bash
docker compose --profile mcp-servers up -d
```

Starts:
- Core infrastructure (4 services)
- All 14 MCP servers (Google Workspace + Others)

### Option 2: Google Workspace Only (10 services)

```bash
docker compose --profile google-workspace up -d
```

Starts:
- Core infrastructure (4 services)
- Gmail, Calendar, Drive, Docs, Sheets, Slides, Forms, Tasks, Chat, Search

### Option 3: Specific Service Categories

```bash
# Just GitHub
docker compose --profile github up -d

# Just LinkedIn
docker compose --profile linkedin up -d

# Just Reddit
docker compose --profile reddit up -d

# Just Notion
docker compose --profile notion up -d

# Individual Google services
docker compose --profile gmail up -d
docker compose --profile sheets up -d
```

### Option 4: Mix and Match Profiles

```bash
# Google Workspace + LinkedIn + GitHub
docker compose --profile google-workspace --profile linkedin --profile github up -d

# Everything + Monitoring (Prometheus + Grafana)
docker compose --profile mcp-servers --profile monitoring up -d
```

### Option 5: Individual Services (No Profile)

```bash
# Start specific services by name
docker compose up -d mcp-gmail mcp-sheets mcp-github

# Start multiple services
docker compose up -d mcp-gmail mcp-calendar mcp-drive mcp-github mcp-linkedin
```

---

## 📦 Port Mapping Reference

### Core Services

| Service | Container | Host Port | Internal Port | Purpose |
|---------|-----------|-----------|---------------|---------|
| **Gateway** | connectors-gateway | 3000 | 3000 | Main API, semantic routing |
| **Vault** | connectors-vault | 8200 | 8200 | Credential storage |
| **Neo4j** | connectors-neo4j | 7474, 7687 | 7474, 7687 | GraphRAG database |
| **Redis** | connectors-redis | 6379 | 6379 | Caching layer |

### Other MCP Servers

| Service | Container | Host Port | OAuth | Tools |
|---------|-----------|-----------|-------|-------|
| **Notion** | connectors-mcp-notion | 3100 | ✅ Notion OAuth | 19 |
| **GitHub** | connectors-mcp-github | 3110 | ✅ GitHub OAuth | 29 |
| **LinkedIn** | connectors-mcp-linkedin | 3120 | ✅ LinkedIn OAuth | 12 |
| **Reddit** | connectors-mcp-reddit | 3200 | ✅ Reddit OAuth | 25 |

### Google Workspace MCP Servers

| Service | Container | Host Port | OAuth Scopes | Tools |
|---------|-----------|-----------|--------------|-------|
| **Gmail** | connectors-mcp-gmail | 3130 | GMAIL_MODIFY, COMPOSE, SEND, LABELS, SETTINGS | 48 |
| **Calendar** | connectors-mcp-calendar | 3131 | CALENDAR, CALENDAR_EVENTS | 29 |
| **Drive** | connectors-mcp-drive | 3132 | DRIVE | 35 |
| **Docs** | connectors-mcp-docs | 3133 | DOCUMENTS, DRIVE | 32 |
| **Sheets** | connectors-mcp-sheets | 3134 | SPREADSHEETS | 40 |
| **Slides** | connectors-mcp-slides | 3135 | PRESENTATIONS, DRIVE | 28 |
| **Forms** | connectors-mcp-forms | 3136 | FORMS_BODY, FORMS_RESPONSES_READONLY | 14 |
| **Tasks** | connectors-mcp-tasks | 3137 | TASKS | 16 |
| **Chat** | connectors-mcp-chat | 3138 | CHAT_MESSAGES, CHAT_SPACES | 23 |
| **Search** | connectors-mcp-search | 3139 | USERINFO_EMAIL, USERINFO_PROFILE | 6 |

**Total Tools**: 271 (Google Workspace) + 85 (Others) = **356 tools**

---

## 🔐 Environment Variables

### Required Before Starting

Create `.env` file in project root:

```bash
# Google OAuth (for all 10 Google Workspace services)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# LinkedIn OAuth (optional)
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Reddit OAuth (optional)
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret

# Google Custom Search (for Search service)
GOOGLE_PSE_API_KEY=your-api-key
GOOGLE_PSE_ENGINE_ID=your-engine-id
```

Or export directly:

```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export GITHUB_CLIENT_ID="your-github-client-id"
export GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### Vault Configuration (Auto-Configured)

These are automatically set by docker-compose:

```bash
VAULT_ADDR=http://vault:8200     # Internal network
VAULT_TOKEN=dev-root-token        # Development token (change in production!)
```

---

## 🔍 Monitoring & Health Checks

### Check All Running Services

```bash
# List all containers
docker compose ps

# Filter by status
docker compose ps --filter "status=running"

# See resource usage
docker stats
```

### Health Check Endpoints

```bash
# Core Services
curl http://localhost:3000/health          # Gateway
curl http://localhost:8200/v1/sys/health   # Vault
curl http://localhost:7474                 # Neo4j Browser

# Google Workspace Services
curl http://localhost:3130/health  # Gmail
curl http://localhost:3131/health  # Calendar
curl http://localhost:3132/health  # Drive
curl http://localhost:3133/health  # Docs
curl http://localhost:3134/health  # Sheets
curl http://localhost:3135/health  # Slides
curl http://localhost:3136/health  # Forms
curl http://localhost:3137/health  # Tasks
curl http://localhost:3138/health  # Chat
curl http://localhost:3139/health  # Search

# Other MCP Services
curl http://localhost:3110/health  # GitHub
curl http://localhost:3120/health  # LinkedIn
curl http://localhost:3200/health  # Reddit
curl http://localhost:3100/health  # Notion
```

### Automated Health Check Script

```bash
#!/bin/bash
# check-health.sh

services=(
  "Gateway:3000"
  "Gmail:3130"
  "Sheets:3134"
  "GitHub:3110"
  "LinkedIn:3120"
)

for service in "${services[@]}"; do
  name="${service%%:*}"
  port="${service##*:}"

  if curl -sf "http://localhost:$port/health" > /dev/null; then
    echo "✅ $name (port $port)"
  else
    echo "❌ $name (port $port)"
  fi
done
```

---

## 📝 Viewing Logs

### All Services

```bash
# Follow all logs
docker compose logs -f

# Show last 100 lines
docker compose logs --tail=100

# Specific service
docker compose logs -f mcp-gmail

# Multiple services
docker compose logs -f mcp-gmail mcp-sheets mcp-github
```

### Filter by Time

```bash
# Logs since 1 hour ago
docker compose logs --since 1h

# Logs from specific time
docker compose logs --since 2025-11-15T10:00:00
```

### Search Logs

```bash
# Search for errors
docker compose logs | grep -i error

# Search specific service
docker compose logs mcp-gmail | grep -i "oauth"

# Count errors
docker compose logs | grep -c "ERROR"
```

---

## 🛑 Stopping Services

### Stop All Services

```bash
# Stop all containers
docker compose --profile mcp-servers down

# Stop and remove volumes (clean slate)
docker compose --profile mcp-servers down -v
```

### Stop Specific Profiles

```bash
# Stop just Google Workspace services
docker compose --profile google-workspace down

# Stop specific service category
docker compose --profile github down
docker compose --profile linkedin down
```

### Stop Individual Services

```bash
# Stop specific services
docker compose stop mcp-gmail mcp-sheets

# Remove stopped containers
docker compose rm -f mcp-gmail mcp-sheets
```

### Emergency Stop

```bash
# Kill all containers immediately
docker compose kill

# Full cleanup (containers + networks + volumes)
docker compose down -v --remove-orphans
```

---

## 🔄 Restarting Services

### Restart All

```bash
# Restart everything
docker compose --profile mcp-servers restart

# Restart with rebuild
docker compose --profile mcp-servers up -d --build
```

### Restart Specific Services

```bash
# Restart Gmail service
docker compose restart mcp-gmail

# Restart Google Workspace services
docker compose restart mcp-gmail mcp-calendar mcp-drive mcp-docs mcp-sheets mcp-slides mcp-forms mcp-tasks mcp-chat mcp-search
```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker compose build mcp-gmail

# Rebuild and restart
docker compose up -d --build mcp-gmail

# Rebuild all
docker compose --profile mcp-servers build
docker compose --profile mcp-servers up -d
```

---

## 🐛 Troubleshooting

### Service Won't Start

```bash
# 1. Check logs
docker compose logs mcp-gmail

# 2. Check container status
docker compose ps mcp-gmail

# 3. Inspect container
docker inspect connectors-mcp-gmail

# 4. Try starting manually
docker compose up mcp-gmail
```

### OAuth Issues

```bash
# 1. Verify environment variables
docker compose exec mcp-gmail env | grep GOOGLE

# 2. Check Vault connectivity
docker compose exec mcp-gmail curl -v http://vault:8200/v1/sys/health

# 3. View OAuth logs
docker compose logs mcp-gmail | grep -i oauth
```

### Health Check Failing

```bash
# 1. Test health endpoint manually
curl -v http://localhost:3130/health

# 2. Check if port is accessible
nc -zv localhost 3130

# 3. View recent logs
docker compose logs --tail=50 mcp-gmail
```

### Network Issues

```bash
# 1. Check network
docker network ls | grep connectors

# 2. Inspect network
docker network inspect connectors_connectors-network

# 3. Restart networking
docker compose down
docker compose --profile mcp-servers up -d
```

---

## 📊 Resource Management

### Resource Limits

Services are configured with resource limits in docker-compose.yml:

```yaml
resources:
  limits:
    memory: 2Gi
    cpu: "1000m"
  requests:
    memory: 1Gi
    cpu: "500m"
```

### Check Resource Usage

```bash
# Real-time stats
docker stats

# Specific services
docker stats connectors-mcp-gmail connectors-mcp-sheets

# Export to CSV
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" > stats.csv
```

### Scaling Services

```bash
# Scale specific service (if supported)
docker compose up -d --scale mcp-gmail=3

# Note: Most services are stateful (OAuth, Vault) so scaling requires additional config
```

---

## 🎯 Production Deployment

### Pre-Production Checklist

- [ ] Update `VAULT_TOKEN` from `dev-root-token` to production token
- [ ] Set proper `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- [ ] Configure OAuth redirect URIs for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure production logging (not just stdout)
- [ ] Set up monitoring alerts (Prometheus + Grafana)
- [ ] Configure backup for Vault and Neo4j data
- [ ] Review and adjust resource limits
- [ ] Test OAuth flow end-to-end
- [ ] Load test critical services

### Production Environment Variables

```bash
# Production .env
GOOGLE_CLIENT_ID=prod-client-id
GOOGLE_CLIENT_SECRET=prod-secret
VAULT_ADDR=https://vault.production.com
VAULT_TOKEN=<secure-production-token>
NODE_ENV=production
LOG_LEVEL=info
```

---

## 📖 Related Documentation

- **Google Workspace OAuth Status**: `docs/GOOGLE_WORKSPACE_OAUTH_STATUS.md`
- **Shared Google Auth Package**: `integrations/shared/google-auth/README.md`
- **OAuth Quick Start**: `docs/oauth-quick-start.md`
- **Main README**: `README.md`
- **Docker Compose**: `docker-compose.yml`

---

## 🆘 Quick Reference Commands

```bash
# Start everything
docker compose --profile mcp-servers up -d

# Check status
docker compose ps

# View logs
docker compose logs -f --tail=100

# Check health
curl http://localhost:3130/health  # Gmail
curl http://localhost:3134/health  # Sheets

# Stop everything
docker compose --profile mcp-servers down

# Restart service
docker compose restart mcp-gmail

# Rebuild service
docker compose up -d --build mcp-gmail

# Clean slate
docker compose down -v --remove-orphans
```

---

**Last Updated**: November 15, 2025
**Services**: 18 total (4 core + 14 MCP servers)
**Status**: ✅ Production-Ready
