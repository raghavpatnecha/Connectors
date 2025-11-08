#!/bin/bash
# ============================================
# Docker Environment Verification Script
# Connectors Platform - DevOps Engineer
# ============================================

set -e

echo "======================================"
echo "🐳 Connectors Platform - Docker Environment Verification"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_passed() {
  echo -e "${GREEN}✅ $1${NC}"
}

check_failed() {
  echo -e "${RED}❌ $1${NC}"
}

check_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Step 1: Check Docker availability
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Checking Docker Prerequisites"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! command -v docker &> /dev/null; then
  check_failed "Docker command not found"
  echo "  Please install Docker: https://docs.docker.com/get-docker/"
  exit 1
else
  check_passed "Docker command available"
  docker --version
fi

if ! docker info > /dev/null 2>&1; then
  check_failed "Docker daemon is not running"
  echo "  Please start Docker daemon"
  exit 1
else
  check_passed "Docker daemon is running"
fi

if ! command -v docker compose &> /dev/null; then
  check_failed "Docker Compose not found"
  echo "  Please install Docker Compose: https://docs.docker.com/compose/install/"
  exit 1
else
  check_passed "Docker Compose available"
  docker compose version
fi

echo ""

# Step 2: Start services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Starting Docker Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /home/user/Connectors

echo "Starting core services (gateway, vault, neo4j, redis)..."
docker compose up -d vault neo4j redis

echo ""
echo "Waiting for infrastructure services to be healthy (30 seconds)..."
sleep 30

echo ""
echo "Starting gateway service..."
docker compose up -d gateway

echo ""
check_passed "All services started"

echo ""

# Step 3: Check service health
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Checking Service Health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Waiting additional 30 seconds for health checks..."
sleep 30

docker compose ps

echo ""
echo "Checking individual service health..."
echo ""

# Check Vault
if docker compose exec -T vault wget --no-verbose --tries=1 --spider http://localhost:8200/v1/sys/health 2>&1 | grep -q "200 OK"; then
  check_passed "Vault is healthy"
else
  check_failed "Vault is not healthy"
fi

# Check Neo4j
if docker compose exec -T neo4j wget --no-verbose --tries=1 --spider http://localhost:7474 2>&1 | grep -q "200 OK"; then
  check_passed "Neo4j is healthy"
else
  check_failed "Neo4j is not healthy"
fi

# Check Redis
if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
  check_passed "Redis is healthy"
else
  check_failed "Redis is not healthy"
fi

# Check Gateway
if docker compose exec -T gateway wget --no-verbose --tries=1 --spider http://localhost:3000/health 2>&1 | grep -q "200 OK"; then
  check_passed "Gateway is healthy"
else
  check_warning "Gateway may still be initializing (this is normal)"
  echo "  Check logs: docker compose logs gateway"
fi

echo ""

# Step 4: Display service information
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Service Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🌐 Access URLs:"
echo "  Gateway Health:    http://localhost:3000/health"
echo "  Gateway API:       http://localhost:3000"
echo "  Vault UI:          http://localhost:8200"
echo "  Neo4j Browser:     http://localhost:7474"
echo "  Redis:             localhost:6379"
echo ""

echo "🔑 Credentials:"
echo "  Vault Token:       dev-root-token"
echo "  Neo4j User:        neo4j"
echo "  Neo4j Password:    connectors-dev-2024"
echo ""

echo "📋 Next Steps:"
echo "  1. Initialize Vault:  ./scripts/init-all-services.sh"
echo "  2. View logs:         docker compose logs -f"
echo "  3. Stop services:     docker compose down"
echo ""

echo "======================================"
check_passed "Docker environment verification complete!"
echo "======================================"
