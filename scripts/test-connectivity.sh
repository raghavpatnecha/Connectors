#!/bin/bash
# ============================================
# Service Connectivity Test Script
# Connectors Platform - DevOps Engineer
# ============================================

set -e

echo ""
echo "======================================"
echo "🔗 Connectors Platform - Connectivity Tests"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_passed() {
  echo -e "${GREEN}✅ $1${NC}"
}

check_failed() {
  echo -e "${RED}❌ $1${NC}"
}

# ============================================
# Test 1: External Access (Host → Containers)
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: External Access (Host → Containers)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Testing localhost:8200 (Vault)..."
if curl -sf http://localhost:8200/v1/sys/health > /dev/null 2>&1; then
  check_passed "Vault accessible from host"
else
  check_failed "Vault not accessible from host"
fi

echo "Testing localhost:7474 (Neo4j HTTP)..."
if curl -sf http://localhost:7474 > /dev/null 2>&1; then
  check_passed "Neo4j HTTP accessible from host"
else
  check_failed "Neo4j HTTP not accessible from host"
fi

echo "Testing localhost:7687 (Neo4j Bolt)..."
if nc -zv localhost 7687 2>&1 | grep -q "succeeded\|open"; then
  check_passed "Neo4j Bolt accessible from host"
else
  check_failed "Neo4j Bolt not accessible from host"
fi

echo "Testing localhost:6379 (Redis)..."
if redis-cli -h localhost -p 6379 ping 2>/dev/null | grep -q "PONG"; then
  check_passed "Redis accessible from host"
elif nc -zv localhost 6379 2>&1 | grep -q "succeeded\|open"; then
  check_passed "Redis port accessible from host (redis-cli not installed)"
else
  check_failed "Redis not accessible from host"
fi

echo "Testing localhost:3000 (Gateway)..."
if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
  check_passed "Gateway accessible from host"
else
  check_failed "Gateway not accessible from host"
fi

echo ""

# ============================================
# Test 2: Inter-Container Communication
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Inter-Container Communication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Testing gateway → vault (http://vault:8200)..."
if docker compose exec -T gateway sh -c "wget --spider -q http://vault:8200/v1/sys/health" 2>/dev/null; then
  check_passed "Gateway can reach Vault via Docker network"
else
  check_failed "Gateway cannot reach Vault via Docker network"
fi

echo "Testing gateway → neo4j (bolt://neo4j:7687)..."
if docker compose exec -T gateway sh -c "nc -zv neo4j 7687" 2>&1 | grep -q "succeeded\|open"; then
  check_passed "Gateway can reach Neo4j Bolt via Docker network"
else
  check_failed "Gateway cannot reach Neo4j Bolt via Docker network"
fi

echo "Testing gateway → redis (redis://redis:6379)..."
if docker compose exec -T gateway sh -c "nc -zv redis 6379" 2>&1 | grep -q "succeeded\|open"; then
  check_passed "Gateway can reach Redis via Docker network"
else
  check_failed "Gateway cannot reach Redis via Docker network"
fi

echo ""

# ============================================
# Test 3: Database Connectivity with Auth
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Database Connectivity with Authentication"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='dev-root-token'

echo "Testing Vault authentication..."
if vault status > /dev/null 2>&1; then
  check_passed "Vault authentication successful"
else
  check_failed "Vault authentication failed"
fi

echo "Testing Neo4j authentication..."
if docker compose exec -T neo4j cypher-shell -u neo4j -p connectors-dev-2024 "RETURN 1" > /dev/null 2>&1; then
  check_passed "Neo4j authentication successful"
else
  check_failed "Neo4j authentication failed"
fi

echo "Testing Redis (no auth in dev mode)..."
if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
  check_passed "Redis connection successful"
else
  check_failed "Redis connection failed"
fi

echo ""

# ============================================
# Test 4: End-to-End Data Flow
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: End-to-End Data Flow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Test 4.1: Vault → Store and Retrieve..."
TIMESTAMP=$(date +%s)
TEST_VALUE="connectivity-test-$TIMESTAMP"

if vault kv put secret/test/connectivity value="$TEST_VALUE" > /dev/null 2>&1; then
  check_passed "Vault write successful"

  RETRIEVED=$(vault kv get -field=value secret/test/connectivity 2>/dev/null)
  if [ "$RETRIEVED" == "$TEST_VALUE" ]; then
    check_passed "Vault read successful (data matches)"
  else
    check_failed "Vault read failed (data mismatch)"
  fi

  # Cleanup
  vault kv delete secret/test/connectivity > /dev/null 2>&1
else
  check_failed "Vault write failed"
fi

echo ""
echo "Test 4.2: Neo4j → Query and Count..."

TOOL_COUNT=$(docker compose exec -T neo4j cypher-shell -u neo4j -p connectors-dev-2024 \
  "MATCH (t:Tool) RETURN count(t) as count" --format plain 2>/dev/null | grep -o '[0-9]\+' | head -1)

if [ -n "$TOOL_COUNT" ]; then
  check_passed "Neo4j query successful (found $TOOL_COUNT tools)"
else
  check_failed "Neo4j query failed"
fi

echo ""
echo "Test 4.3: Redis → Cache Operations..."

CACHE_KEY="test:cache:$TIMESTAMP"
CACHE_VALUE="cached-data-$TIMESTAMP"

docker compose exec -T redis redis-cli SET "$CACHE_KEY" "$CACHE_VALUE" EX 60 > /dev/null 2>&1

CACHED=$(docker compose exec -T redis redis-cli GET "$CACHE_KEY" 2>/dev/null | tr -d '[:space:]')

if [ "$CACHED" == "$CACHE_VALUE" ]; then
  check_passed "Redis cache operations successful"
  # Cleanup
  docker compose exec -T redis redis-cli DEL "$CACHE_KEY" > /dev/null 2>&1
else
  check_failed "Redis cache operations failed"
fi

echo ""

# ============================================
# Test 5: Network Latency
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Network Latency Measurements"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Measuring gateway → vault latency..."
VAULT_LATENCY=$(docker compose exec -T gateway sh -c "time wget -q -O /dev/null http://vault:8200/v1/sys/health" 2>&1 | grep real | awk '{print $2}')
echo "  Latency: $VAULT_LATENCY"

echo "Measuring Redis latency (100 pings)..."
REDIS_LATENCY=$(docker compose exec -T redis redis-cli --latency-history -i 1 -c 10 2>/dev/null | head -1 || echo "N/A")
echo "  $REDIS_LATENCY"

echo ""

# ============================================
# Final Summary
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Connectivity Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ All connectivity tests completed"
echo ""
echo "For detailed health status, run:"
echo "  ./scripts/health-check.sh"
echo ""
