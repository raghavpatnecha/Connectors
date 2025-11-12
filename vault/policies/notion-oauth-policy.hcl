# Notion OAuth Policy - Per-tenant credential access
# This policy provides fine-grained access control for Notion OAuth credentials
# following the least-privilege principle.
#
# Security Features:
# - Per-tenant isolation (credentials scoped to tenant ID)
# - Separate read/write permissions for credentials and metadata
# - Transit encryption support for token encryption at rest
# - Dedicated refresh token operations path
#
# Usage:
#   vault policy write notion-oauth /vault/policies/notion-oauth-policy.hcl

# =============================================================================
# Notion OAuth Credentials (KV v2 Secrets Engine)
# =============================================================================

# Full CRUD access to tenant-specific Notion credentials
# Path pattern: secret/data/tenants/{tenant-id}/notion
path "secret/data/tenants/*/notion" {
  capabilities = ["create", "read", "update", "delete"]

  # Additional constraints (optional, uncomment to enable)
  # allowed_parameters = {
  #   "data" = []
  # }
  #
  # required_parameters = ["data"]
}

# Read and list metadata for Notion credentials
# This allows checking version history and credential metadata
# Path pattern: secret/metadata/tenants/{tenant-id}/notion
path "secret/metadata/tenants/*/notion" {
  capabilities = ["read", "list"]
}

# List all tenants (for administrative purposes)
# Path: secret/metadata/tenants
path "secret/metadata/tenants" {
  capabilities = ["list"]
}

# =============================================================================
# Transit Encryption Engine (Token Encryption at Rest)
# =============================================================================

# Encrypt Notion tokens with tenant-specific encryption keys
# Path pattern: transit/encrypt/notion-{tenant-id}
path "transit/encrypt/notion-*" {
  capabilities = ["update"]

  # Enforce structured encryption requests
  required_parameters = ["plaintext"]
}

# Decrypt Notion tokens with tenant-specific encryption keys
# Path pattern: transit/decrypt/notion-{tenant-id}
path "transit/decrypt/notion-*" {
  capabilities = ["update"]

  # Enforce structured decryption requests
  required_parameters = ["ciphertext"]
}

# Rotate encryption keys (admin operation)
# Path pattern: transit/keys/notion-{tenant-id}/rotate
path "transit/keys/notion-*/rotate" {
  capabilities = ["update"]
}

# Read encryption key configuration and version
# Path pattern: transit/keys/notion-{tenant-id}
path "transit/keys/notion-*" {
  capabilities = ["read"]
}

# =============================================================================
# Token Refresh Operations
# =============================================================================

# Dedicated path for OAuth refresh token operations
# Path pattern: secret/data/tenants/{tenant-id}/notion/refresh
path "secret/data/tenants/*/notion/refresh" {
  capabilities = ["create", "update"]

  # Only allow writing refresh_token and related metadata
  # allowed_parameters = {
  #   "data" = []
  # }
}

# Read refresh token metadata
# Path pattern: secret/metadata/tenants/{tenant-id}/notion/refresh
path "secret/metadata/tenants/*/notion/refresh" {
  capabilities = ["read"]
}

# =============================================================================
# Audit and Monitoring
# =============================================================================

# Allow reading audit logs related to Notion OAuth operations
# (Requires audit backend to be enabled)
# path "sys/audit" {
#   capabilities = ["read", "list"]
# }

# =============================================================================
# NOTES
# =============================================================================
#
# 1. This policy uses wildcard (*) matching for tenant IDs to enable
#    multi-tenancy. In production, consider using templated policies
#    with identity-based templating for stronger isolation.
#
# 2. Notion OAuth tokens have the following characteristics:
#    - Access tokens: Long-lived (no expiration by default)
#    - Refresh tokens: Available but optional (tokens don't auto-expire)
#    - Bot tokens: Workspace-specific integration tokens
#
# 3. The transit engine provides encryption-as-a-service. All Notion
#    tokens should be encrypted before storage in the KV engine.
#
# 4. For enhanced security, enable periodic key rotation:
#    vault write -f transit/keys/notion-{tenant-id}/rotate
#
# 5. Token versioning: KV v2 maintains version history. Use this for
#    audit trails and rollback capabilities.
#
# Example usage:
#   # Store encrypted Notion credentials
#   vault kv put secret/tenants/tenant-123/notion \
#     access_token="encrypted:vault:v1:..." \
#     workspace_id="ws-abc123" \
#     bot_id="bot-xyz789"
#
#   # Encrypt a new token
#   vault write transit/encrypt/notion-tenant-123 \
#     plaintext=$(echo -n "notion_token_here" | base64)
#
#   # Decrypt a token
#   vault write transit/decrypt/notion-tenant-123 \
#     ciphertext="vault:v1:..."
