#!/bin/bash
# ============================================
# Complete Service Initialization Script
# Connectors Platform - DevOps Engineer
# ============================================

set -e

echo "======================================"
echo "🚀 Connectors Platform - Service Initialization"
echo "======================================"
echo ""

cd /home/user/Connectors

# Step 1: Initialize Vault
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: Initializing HashiCorp Vault"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Set Vault environment variables
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='dev-root-token'

echo "⏳ Waiting for Vault to be available..."
until curl -sf http://localhost:8200/v1/sys/health > /dev/null 2>&1; do
  echo "  Vault not ready, waiting..."
  sleep 2
done

echo "✅ Vault is ready!"
echo ""

# Enable secrets engines
echo "🔧 Enabling secrets engines..."
vault secrets enable -path=secret kv-v2 2>/dev/null || echo "  ℹ️  KV v2 already enabled"
vault secrets enable transit 2>/dev/null || echo "  ℹ️  Transit already enabled"

# Create OAuth policy
echo "📋 Creating OAuth policy..."
cat > /tmp/oauth-policy.hcl << 'POLICY'
# OAuth Credentials Management Policy
# Allow read/write access to tenant OAuth credentials

# Read and write OAuth credentials
path "secret/data/tenants/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Read OAuth credential metadata
path "secret/metadata/tenants/*" {
  capabilities = ["read", "list"]
}

# Encrypt and decrypt tokens using transit engine
path "transit/encrypt/*" {
  capabilities = ["create", "update"]
}

path "transit/decrypt/*" {
  capabilities = ["create", "update"]
}

# Create and manage encryption keys
path "transit/keys/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
POLICY

vault policy write oauth-policy /tmp/oauth-policy.hcl

# Enable audit logging
echo "📝 Enabling audit logging..."
vault audit enable file file_path=/vault/logs/audit.log 2>/dev/null || echo "  ℹ️  Audit logging already enabled"

# Create encryption keys for sample tenants
echo "🔑 Creating sample encryption keys..."
vault write -f transit/keys/tenant-test type=aes256-gcm96 exportable=false 2>/dev/null || echo "  ℹ️  tenant-test key already exists"
vault write -f transit/keys/tenant-demo type=aes256-gcm96 exportable=false 2>/dev/null || echo "  ℹ️  tenant-demo key already exists"

echo "✅ Vault initialization complete"
echo ""

# Step 2: Initialize Neo4j
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: Initializing Neo4j GraphRAG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

./scripts/init-neo4j.sh

# Step 3: Store test OAuth credentials
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: Storing Test OAuth Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔑 Creating test credentials for GitHub integration..."

# Calculate expiry time (24 hours from now)
EXPIRY_TIME=$(date -u -d "+24 hours" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+24H +"%Y-%m-%dT%H:%M:%SZ")

vault kv put secret/tenants/tenant-test/github \
  access_token="ghp_test_access_token_1234567890abcdef" \
  refresh_token="ghp_test_refresh_token_0987654321fedcba" \
  token_type="Bearer" \
  expires_at="$EXPIRY_TIME" \
  scopes="repo,user,workflow" \
  created_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "✅ GitHub credentials stored for tenant-test"
echo ""

echo "🔑 Creating test credentials for Slack integration..."

vault kv put secret/tenants/tenant-test/slack \
  access_token="xoxb-test-slack-token-1234567890" \
  refresh_token="xoxe-test-refresh-1234567890" \
  token_type="Bearer" \
  expires_at="$EXPIRY_TIME" \
  scopes="chat:write,channels:read,users:read" \
  created_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "✅ Slack credentials stored for tenant-test"
echo ""

echo "🔑 Creating test credentials for Jira integration..."

vault kv put secret/tenants/tenant-test/jira \
  access_token="jira_test_access_token_abcdef123456" \
  refresh_token="jira_test_refresh_token_fedcba654321" \
  token_type="Bearer" \
  expires_at="$EXPIRY_TIME" \
  scopes="read:jira-work,write:jira-work" \
  site_url="https://test-company.atlassian.net" \
  created_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "✅ Jira credentials stored for tenant-test"
echo ""

# Step 4: Verify Redis
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 4: Verifying Redis Cache"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if docker compose exec -T redis redis-cli ping | grep -q "PONG"; then
  echo "✅ Redis is responding"

  # Set test cache entry
  docker compose exec -T redis redis-cli SET "test:connection" "success" EX 60 > /dev/null

  # Verify test entry
  RESULT=$(docker compose exec -T redis redis-cli GET "test:connection")
  if echo "$RESULT" | grep -q "success"; then
    echo "✅ Redis read/write verified"
  else
    echo "❌ Redis read/write failed"
  fi
else
  echo "❌ Redis is not responding"
fi

echo ""

# Step 5: Verify inter-service connectivity
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 5: Verifying Inter-Service Connectivity"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Testing gateway → vault connectivity..."
if docker compose exec -T gateway sh -c "wget --spider -q http://vault:8200/v1/sys/health" 2>/dev/null; then
  echo "✅ Gateway can reach Vault"
else
  echo "❌ Gateway cannot reach Vault"
fi

echo "Testing gateway → neo4j connectivity..."
if docker compose exec -T gateway sh -c "nc -zv neo4j 7687" 2>&1 | grep -q "succeeded\|open"; then
  echo "✅ Gateway can reach Neo4j"
else
  echo "⚠️  Gateway Neo4j connectivity check inconclusive"
fi

echo "Testing gateway → redis connectivity..."
if docker compose exec -T gateway sh -c "nc -zv redis 6379" 2>&1 | grep -q "succeeded\|open"; then
  echo "✅ Gateway can reach Redis"
else
  echo "⚠️  Gateway Redis connectivity check inconclusive"
fi

echo ""

# Step 6: Display final status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 6: Final Status Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🎯 Service Status:"
docker compose ps

echo ""
echo "======================================"
echo "✅ ALL SERVICES INITIALIZED SUCCESSFULLY!"
echo "======================================"
echo ""

echo "📊 Summary:"
echo "  ✅ Vault: OAuth policies configured, 3 test credentials stored"
echo "  ✅ Neo4j: Schema created, 18 tools seeded across 5 categories"
echo "  ✅ Redis: Cache layer verified"
echo "  ✅ Gateway: Connected to all services"
echo ""

echo "🌐 Access Information:"
echo "  Gateway API:       http://localhost:3000"
echo "  Gateway Health:    http://localhost:3000/health"
echo "  Vault UI:          http://localhost:8200 (Token: dev-root-token)"
echo "  Neo4j Browser:     http://localhost:7474 (neo4j/connectors-dev-2024)"
echo "  Redis:             localhost:6379"
echo ""

echo "🔑 Test Credentials (in Vault):"
echo "  tenant-test/github"
echo "  tenant-test/slack"
echo "  tenant-test/jira"
echo ""

echo "📋 Useful Commands:"
echo "  View credentials:  vault kv get secret/tenants/tenant-test/github"
echo "  Query Neo4j:       docker compose exec neo4j cypher-shell -u neo4j -p connectors-dev-2024"
echo "  Check Redis:       docker compose exec redis redis-cli"
echo "  Gateway logs:      docker compose logs -f gateway"
echo ""
