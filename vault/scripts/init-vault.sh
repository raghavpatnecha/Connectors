#!/bin/sh
# Vault initialization script for development
# Connectors Platform - OAuth Setup

set -e

echo "🔐 Initializing HashiCorp Vault for OAuth Management"

# Wait for Vault to be ready
echo "⏳ Waiting for Vault to be available..."
until vault status > /dev/null 2>&1; do
  echo "  Vault not ready, waiting..."
  sleep 2
done

echo "✅ Vault is ready!"

# Enable secrets engines
echo "🔧 Enabling secrets engines..."
vault secrets enable -path=secret kv-v2 2>/dev/null || echo "  ℹ️  KV v2 already enabled"
vault secrets enable transit 2>/dev/null || echo "  ℹ️  Transit already enabled"

# Configure OAuth policy
echo "📋 Configuring OAuth policy..."
vault policy write oauth-policy /vault/policies/oauth-policy.hcl

# Enable audit logging
echo "📝 Enabling audit logging..."
vault audit enable file file_path=/vault/logs/audit.log 2>/dev/null || echo "  ℹ️  Audit logging already enabled"

# Create sample encryption key for testing
echo "🔑 Creating sample encryption key..."
vault write -f transit/keys/sample-tenant type=aes256-gcm96 exportable=false 2>/dev/null || echo "  ℹ️  Sample key already exists"

echo "✅ Vault initialization complete!"
echo ""
echo "📊 Vault Status:"
vault status

echo ""
echo "🎯 Next Steps:"
echo "  1. Store OAuth credentials: vault kv put secret/data/{tenantId}/{integration} ..."
echo "  2. Encrypt tokens: vault write transit/encrypt/{tenantId} plaintext=..."
echo "  3. View audit logs: docker exec connectors-vault cat /vault/logs/audit.log"
echo ""
echo "🌐 Vault UI: http://localhost:8200"
echo "🔑 Root Token: \$VAULT_DEV_TOKEN"
