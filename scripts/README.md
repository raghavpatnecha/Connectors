# Development Scripts

Utility scripts for managing the Connectors Platform development environment.

## Available Scripts

### `start-dev.sh`
Start the development environment with all core services.

```bash
./scripts/start-dev.sh
```

**Services started:**
- Gateway (port 3000)
- Vault (port 8200)
- Neo4j (ports 7474, 7687)
- Redis (port 6379)
- Redis Commander (port 8081)

### `stop-dev.sh`
Stop the development environment.

```bash
# Stop services only
./scripts/stop-dev.sh

# Stop and remove volumes (⚠️ DATA LOSS)
./scripts/stop-dev.sh --volumes

# Stop and remove images
./scripts/stop-dev.sh --images
```

**Options:**
- `-v, --volumes` - Remove all data volumes (⚠️ deletes all data)
- `-i, --images` - Remove all Docker images
- `-h, --help` - Show help message

### `reset-dev.sh`
Complete reset of the development environment.

```bash
./scripts/reset-dev.sh
```

**⚠️ WARNING:** This will:
1. Stop all containers
2. Remove all volumes (DATA LOSS!)
3. Remove all images
4. Rebuild from scratch
5. Start fresh environment

**Requires confirmation:** Type `reset` when prompted

### `logs.sh`
View service logs.

```bash
# View all logs (following)
./scripts/logs.sh

# View specific service logs
./scripts/logs.sh gateway

# View logs without following
./scripts/logs.sh gateway --no-follow
```

## Quick Start

```bash
# 1. Start environment
./scripts/start-dev.sh

# 2. View gateway logs
./scripts/logs.sh gateway

# 3. Stop when done
./scripts/stop-dev.sh
```

## Advanced Usage

### Start with MCP Servers

```bash
docker compose --profile mcp-servers up -d
```

### Start with Monitoring

```bash
docker compose --profile monitoring up -d
```

### Rebuild Specific Service

```bash
docker compose up -d --build gateway
```

### Execute Commands in Containers

```bash
# Gateway shell
docker compose exec gateway sh

# Run tests
docker compose exec gateway npm test

# Vault CLI
docker compose exec vault vault status
```

## Troubleshooting

### Port Conflicts

If ports are already in use:

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Service Won't Start

```bash
# Check logs
./scripts/logs.sh <service-name>

# Restart service
docker compose restart <service-name>

# Full reset
./scripts/reset-dev.sh
```

### Clean Everything

```bash
# Nuclear option - removes everything
docker compose down -v --rmi all
docker system prune -a -f --volumes
```

## See Also

- [Docker Setup Guide](/docs/docker-setup.md) - Complete documentation
- [CLAUDE.md](/CLAUDE.md) - Development guidelines
