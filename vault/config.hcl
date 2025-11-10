# HashiCorp Vault Configuration for MCP Gateway OAuth Management
# Connectors Platform - OAuth Credential Storage

# Storage backend - Using file storage for development, switch to Consul/etc for production
storage "file" {
  path = "/vault/data"
}

# Listener configuration - API endpoint
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1  # Disabled for development - ENABLE in production with proper certs
}

# API address
api_addr = "http://0.0.0.0:8200"

# Cluster address
cluster_addr = "https://0.0.0.0:8201"

# UI - Enable for management console
ui = true

# Telemetry for monitoring
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname = true
}

# Enable audit logging for credential access
# This will be configured post-init via: vault audit enable file file_path=/vault/logs/audit.log
