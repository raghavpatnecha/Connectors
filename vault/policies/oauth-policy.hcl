# OAuth Management Policy for MCP Gateway
# Grants permissions for OAuth credential storage, retrieval, and encryption

# Transit engine - Per-tenant encryption keys
path "transit/encrypt/*" {
  capabilities = ["update"]
}

path "transit/decrypt/*" {
  capabilities = ["update"]
}

path "transit/keys/*" {
  capabilities = ["read", "list"]
}

path "transit/keys/*" {
  capabilities = ["create", "update"]
  allowed_parameters = {
    "type" = ["aes256-gcm96"]
    "exportable" = [false]
  }
}

# KV v2 - OAuth credentials storage
# Format: secret/data/{tenantId}/{integration}
path "secret/data/*" {
  capabilities = ["create", "read", "update", "delete"]
}

path "secret/metadata/*" {
  capabilities = ["list", "read", "delete"]
}

# Allow listing all secrets for a tenant
path "secret/metadata/*" {
  capabilities = ["list"]
}

# Token lookup for validation
path "auth/token/lookup-self" {
  capabilities = ["read"]
}

# Token renewal
path "auth/token/renew-self" {
  capabilities = ["update"]
}
