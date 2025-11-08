#!/bin/sh
# ============================================
# Vault Development Initialization Script
# ============================================

set -e

echo "Waiting for Vault to be ready..."
sleep 5

# Login to Vault
vault login dev-root-token

echo "Enabling KV v2 secrets engine..."
vault secrets enable -path=secret kv-v2 || echo "KV v2 already enabled"

echo "Enabling Transit engine for encryption..."
vault secrets enable transit || echo "Transit already enabled"

echo "Creating encryption keys..."
vault write -f transit/keys/tenant-encryption || echo "Key already exists"

echo "Storing sample OAuth credentials..."
vault kv put secret/github/oauth \
  client_id="sample_client_id" \
  client_secret="sample_client_secret" \
  scopes="repo,user"

vault kv put secret/slack/oauth \
  client_id="sample_slack_client" \
  client_secret="sample_slack_secret" \
  scopes="chat:write,channels:read"

echo "Setting up auth methods..."
vault auth enable approle || echo "AppRole already enabled"

echo "Creating policies..."
cat <<EOF | vault policy write gateway-policy -
path "secret/data/*" {
  capabilities = ["read", "list"]
}

path "transit/encrypt/*" {
  capabilities = ["update"]
}

path "transit/decrypt/*" {
  capabilities = ["update"]
}
EOF

echo "Vault initialization complete!"
echo "Root token: dev-root-token"
echo "Access UI at: http://localhost:8200"
