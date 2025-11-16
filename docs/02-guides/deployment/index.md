# Deployment Guide

**Connectors Platform - Deployment Options**

---

## Overview

The Connectors Platform supports multiple deployment options, from local development to production Kubernetes clusters with auto-scaling.

### Deployment Methods

| Method | Best For | Complexity | Resources | Guide |
|--------|----------|------------|-----------|-------|
| **Docker Compose** | Development, testing | Low | 8GB RAM, 4 cores | [Docker Guide](docker.md) |
| **Kubernetes** | Production, auto-scaling | Moderate | 12-42GB RAM, 11-21 CPUs | [Kubernetes Guide](kubernetes.md) |

---

## Architecture

### Hybrid Gateway Pattern

```
┌─────────────────────────────────────────┐
│           AI Agent (Claude)              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│         MCP Gateway Container          │
│  - Semantic routing                    │
│  - GraphRAG selection                  │
│  - OAuth proxy                         │
└────────┬───────────────────────────────┘
         │
    ┌────┴────┬─────────┬─────────┬──────────┐
    ▼         ▼         ▼         ▼          ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌───────┐ ┌──────┐
│  Code  │ │Comms │ │  PM  │ │ Cloud │ │ Data │
│  MCP   │ │ MCP  │ │ MCP  │ │  MCP  │ │ MCP  │
└────────┘ └──────┘ └──────┘ └───────┘ └──────┘
```

**Components:**
- **Gateway**: Smart routing, OAuth proxy, semantic search
- **Vault**: OAuth credential storage (per-tenant encryption)
- **Neo4j**: GraphRAG tool relationships
- **Redis**: Caching layer
- **MCP Servers**: Category-based tool containers (5-10 categories)

---

## Environment Comparison

### Development (Docker Compose)

**Pros:**
- ✅ One-command setup
- ✅ Hot-reload for code changes
- ✅ Easy debugging
- ✅ Minimal configuration

**Cons:**
- ❌ Not production-ready
- ❌ No auto-scaling
- ❌ Dev credentials only

**Resources:** 4 containers, 8GB RAM, 4 CPUs
**Setup Time:** 5-10 minutes

---

### Production (Kubernetes)

**Pros:**
- ✅ Auto-scaling (HPA)
- ✅ High availability
- ✅ Rolling updates
- ✅ Production security

**Cons:**
- ⚠️ Complex setup
- ⚠️ Higher resources
- ⚠️ K8s expertise needed

**Resources:** 10-55 containers, 12-42GB RAM, 11-21 CPUs
**Setup Time:** 1-2 hours

---

## Quick Start

### Development

```bash
cd /home/user/Connectors

# Start services
docker compose up -d

# Verify
curl http://localhost:3000/health
```

**Guide:** [Docker Deployment](docker.md)

---

### Production

```bash
# Deploy to K8s
kubectl apply -f k8s/ -n connectors

# Verify
kubectl get pods -n connectors
```

**Guide:** [Kubernetes Deployment](kubernetes.md)

---

## Service Endpoints

### Development URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Gateway API | http://localhost:3000 | - |
| Vault UI | http://localhost:8200 | Token: `dev-root-token` |
| Neo4j Browser | http://localhost:7474 | neo4j / connectors-dev-2024 |
| Redis | localhost:6379 | - |

### Production Access

```bash
# Gateway
kubectl port-forward svc/mcp-gateway 8000:8000 -n connectors

# Vault
kubectl port-forward svc/vault 8200:8200 -n connectors

# Neo4j
kubectl port-forward svc/neo4j 7474:7474 -n connectors
```

---

## Scaling Recommendations

### Development
```yaml
Gateway: 1 instance
Vault: 1 instance
Neo4j: 1 instance
Redis: 1 instance
Total: 4 containers
```

### Small Production (< 1K requests/day)
```yaml
Gateway: 2-3 replicas (HPA)
Code MCP: 1-2 replicas
Other MCPs: 1 replica each
Supporting: 1 replica each
Total: 8-12 containers
```

### Large Production (> 10K requests/day)
```yaml
Gateway: 3-10 replicas (HPA)
Code/Cloud MCP: 2-10 replicas (HPA)
Other MCPs: 1-5 replicas
Supporting: 2-3 replicas (HA)
Total: 20-55 containers
```

---

## Troubleshooting

### Port Conflicts

```bash
lsof -i :3000
kill -9 <PID>
```

### Service Health

```bash
# Docker
docker compose ps
docker compose logs [service]

# Kubernetes
kubectl get pods -n connectors
kubectl logs [pod] -n connectors
```

### Network Issues

```bash
# Docker
docker compose exec gateway ping vault

# Kubernetes
kubectl exec [pod] -n connectors -- nc -zv vault 8200
```

---

## Next Steps

### After Development Deploy

1. Initialize services: `./scripts/init-all-services.sh`
2. Store test credentials in Vault
3. Seed Neo4j with tools
4. Test MCP calls

**See:** [Docker Guide - Verification](docker.md#verification-checklist)

### After Production Deploy

1. Configure monitoring (Prometheus/Grafana)
2. Setup auto-scaling policies
3. Implement backups
4. Conduct load testing
5. Setup CI/CD pipeline

**See:** [Kubernetes Guide - Production Checklist](kubernetes.md#production-checklist)

---

## Resources

- **Docker Guide**: [docker.md](docker.md)
- **Kubernetes Guide**: [kubernetes.md](kubernetes.md)
- **Architecture**: `/docs/DEPLOYMENT_ARCHITECTURE.md`
- **Development**: `/CLAUDE.md`
- **Quick Reference**: `/DOCKER_QUICK_REFERENCE.md`

---

**Last Updated:** 2025-11-16
**Version:** 1.0
