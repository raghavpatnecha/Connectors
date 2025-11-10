#!/bin/bash
# ============================================
# Comprehensive Health Check Script
# Connectors Platform - DevOps Engineer
# ============================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

check_passed() {
  echo -e "${GREEN}✅ $1${NC}"
  ((PASSED_CHECKS++))
  ((TOTAL_CHECKS++))
}

check_failed() {
  echo -e "${RED}❌ $1${NC}"
  ((FAILED_CHECKS++))
  ((TOTAL_CHECKS++))
}

check_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  ((WARNING_CHECKS++))
  ((TOTAL_CHECKS++))
}

echo ""
echo "======================================"
echo "🏥 Connectors Platform - Health Check"
echo "======================================"
echo ""
echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

# ============================================
# Docker Container Health
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Docker Container Health"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Vault container
VAULT_STATUS=$(docker inspect --format='{{.State.Health.Status}}' connectors-vault 2>/dev/null || echo "not_found")
if [ "$VAULT_STATUS" == "healthy" ]; then
  check_passed "Vault container is healthy"
elif [ "$VAULT_STATUS" == "starting" ]; then
  check_warning "Vault container is starting"
elif [ "$VAULT_STATUS" == "not_found" ]; then
  check_failed "Vault container not found"
else
  check_failed "Vault container is unhealthy"
fi

# Check Neo4j container
NEO4J_STATUS=$(docker inspect --format='{{.State.Health.Status}}' connectors-neo4j 2>/dev/null || echo "not_found")
if [ "$NEO4J_STATUS" == "healthy" ]; then
  check_passed "Neo4j container is healthy"
elif [ "$NEO4J_STATUS" == "starting" ]; then
  check_warning "Neo4j container is starting"
elif [ "$NEO4J_STATUS" == "not_found" ]; then
  check_failed "Neo4j container not found"
else
  check_failed "Neo4j container is unhealthy"
fi

# Check Redis container
REDIS_STATUS=$(docker inspect --format='{{.State.Health.Status}}' connectors-redis 2>/dev/null || echo "not_found")
if [ "$REDIS_STATUS" == "healthy" ]; then
  check_passed "Redis container is healthy"
elif [ "$REDIS_STATUS" == "starting" ]; then
  check_warning "Redis container is starting"
elif [ "$REDIS_STATUS" == "not_found" ]; then
  check_failed "Redis container not found"
else
  check_failed "Redis container is unhealthy"
fi

# Check Gateway container
GATEWAY_STATUS=$(docker inspect --format='{{.State.Health.Status}}' connectors-gateway 2>/dev/null || echo "not_found")
if [ "$GATEWAY_STATUS" == "healthy" ]; then
  check_passed "Gateway container is healthy"
elif [ "$GATEWAY_STATUS" == "starting" ]; then
  check_warning "Gateway container is starting (this is normal)"
elif [ "$GATEWAY_STATUS" == "not_found" ]; then
  check_failed "Gateway container not found"
else
  check_failed "Gateway container is unhealthy"
fi

echo ""

# ============================================
# Service HTTP Health Endpoints
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Service HTTP Health Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vault HTTP health
if curl -sf http://localhost:8200/v1/sys/health > /dev/null 2>&1; then
  check_passed "Vault HTTP endpoint responding"
else
  check_failed "Vault HTTP endpoint not responding"
fi

# Neo4j HTTP health
if curl -sf http://localhost:7474 > /dev/null 2>&1; then
  check_passed "Neo4j HTTP endpoint responding"
else
  check_failed "Neo4j HTTP endpoint not responding"
fi

# Gateway HTTP health
GATEWAY_RESPONSE=$(curl -sf http://localhost:3000/health 2>&1)
if [ $? -eq 0 ]; then
  check_passed "Gateway HTTP endpoint responding"
  echo "    Response: $GATEWAY_RESPONSE"
else
  check_failed "Gateway HTTP endpoint not responding"
fi

echo ""

# ============================================
# Service Functionality Tests
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚙️  Service Functionality Tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vault - Check if secrets engine is enabled
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='dev-root-token'

if vault secrets list | grep -q "secret/"; then
  check_passed "Vault KV secrets engine enabled"
else
  check_failed "Vault KV secrets engine not found"
fi

if vault secrets list | grep -q "transit/"; then
  check_passed "Vault transit engine enabled"
else
  check_failed "Vault transit engine not found"
fi

# Neo4j - Check database connectivity
if docker compose exec -T neo4j cypher-shell -u neo4j -p connectors-dev-2024 "RETURN 1" > /dev/null 2>&1; then
  check_passed "Neo4j database connectivity verified"

  # Check tool count
  TOOL_COUNT=$(docker compose exec -T neo4j cypher-shell -u neo4j -p connectors-dev-2024 "MATCH (t:Tool) RETURN count(t)" --format plain 2>/dev/null | grep -o '[0-9]\+' | head -1)
  if [ "$TOOL_COUNT" == "18" ]; then
    check_passed "Neo4j has expected 18 tools"
  elif [ -n "$TOOL_COUNT" ]; then
    check_warning "Neo4j has $TOOL_COUNT tools (expected 18)"
  else
    check_warning "Could not verify Neo4j tool count"
  fi
else
  check_failed "Neo4j database connectivity failed"
fi

# Redis - Check connectivity and data operations
if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
  check_passed "Redis connectivity verified"

  # Test write/read
  docker compose exec -T redis redis-cli SET "healthcheck:test" "ok" EX 10 > /dev/null 2>&1
  READ_VALUE=$(docker compose exec -T redis redis-cli GET "healthcheck:test" 2>/dev/null)

  if echo "$READ_VALUE" | grep -q "ok"; then
    check_passed "Redis write/read operations verified"
  else
    check_failed "Redis write/read operations failed"
  fi
else
  check_failed "Redis connectivity failed"
fi

echo ""

# ============================================
# Inter-Service Connectivity
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 Inter-Service Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Gateway → Vault
if docker compose exec -T gateway sh -c "wget --spider -q http://vault:8200/v1/sys/health" 2>/dev/null; then
  check_passed "Gateway → Vault connectivity"
else
  check_warning "Gateway → Vault connectivity uncertain"
fi

# Gateway → Neo4j
if docker compose exec -T gateway sh -c "nc -zv neo4j 7687" 2>&1 | grep -q "succeeded\|open"; then
  check_passed "Gateway → Neo4j connectivity"
else
  check_warning "Gateway → Neo4j connectivity uncertain"
fi

# Gateway → Redis
if docker compose exec -T gateway sh -c "nc -zv redis 6379" 2>&1 | grep -q "succeeded\|open"; then
  check_passed "Gateway → Redis connectivity"
else
  check_warning "Gateway → Redis connectivity uncertain"
fi

echo ""

# ============================================
# Data Verification
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 Data Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Vault - Check test credentials exist
if vault kv get secret/tenants/tenant-test/github > /dev/null 2>&1; then
  check_passed "Test GitHub credentials exist in Vault"
else
  check_warning "Test GitHub credentials not found in Vault"
fi

if vault kv get secret/tenants/tenant-test/slack > /dev/null 2>&1; then
  check_passed "Test Slack credentials exist in Vault"
else
  check_warning "Test Slack credentials not found in Vault"
fi

# Neo4j - Verify categories exist
CATEGORY_COUNT=$(docker compose exec -T neo4j cypher-shell -u neo4j -p connectors-dev-2024 "MATCH (c:Category) RETURN count(c)" --format plain 2>/dev/null | grep -o '[0-9]\+' | head -1)
if [ "$CATEGORY_COUNT" == "5" ]; then
  check_passed "Neo4j has expected 5 categories"
elif [ -n "$CATEGORY_COUNT" ]; then
  check_warning "Neo4j has $CATEGORY_COUNT categories (expected 5)"
else
  check_warning "Could not verify Neo4j category count"
fi

# Neo4j - Verify relationships exist
RELATIONSHIP_COUNT=$(docker compose exec -T neo4j cypher-shell -u neo4j -p connectors-dev-2024 "MATCH ()-[r]->() RETURN count(r)" --format plain 2>/dev/null | grep -o '[0-9]\+' | head -1)
if [ -n "$RELATIONSHIP_COUNT" ] && [ "$RELATIONSHIP_COUNT" -gt "0" ]; then
  check_passed "Neo4j has $RELATIONSHIP_COUNT relationships"
else
  check_warning "Neo4j relationships not verified"
fi

echo ""

# ============================================
# Resource Usage
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resource Usage"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Container stats (one-time snapshot)
echo "Container CPU and Memory usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
  connectors-gateway connectors-vault connectors-neo4j connectors-redis 2>/dev/null || echo "Could not retrieve stats"

echo ""

# ============================================
# Final Summary
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Health Check Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED_CHECKS/$TOTAL_CHECKS)*100}")

echo "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}✅ Passed: $PASSED_CHECKS${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNING_CHECKS${NC}"
echo -e "${RED}❌ Failed: $FAILED_CHECKS${NC}"
echo ""
echo "Success Rate: $SUCCESS_RATE%"
echo ""

if [ $FAILED_CHECKS -eq 0 ] && [ $WARNING_CHECKS -eq 0 ]; then
  echo -e "${GREEN}======================================"
  echo "🎉 ALL CHECKS PASSED!"
  echo "======================================${NC}"
  exit 0
elif [ $FAILED_CHECKS -eq 0 ]; then
  echo -e "${YELLOW}======================================"
  echo "✅ All critical checks passed (warnings present)"
  echo "======================================${NC}"
  exit 0
else
  echo -e "${RED}======================================"
  echo "⚠️  SOME CHECKS FAILED"
  echo "======================================${NC}"
  echo ""
  echo "Run these commands to troubleshoot:"
  echo "  docker compose ps"
  echo "  docker compose logs gateway"
  echo "  docker compose logs vault"
  echo "  docker compose logs neo4j"
  echo "  docker compose logs redis"
  exit 1
fi
