# ============================================
# HashiCorp Vault Configuration
# Production Configuration (NOT used in dev mode)
# ============================================

# Storage backend
storage "file" {
  path = "/vault/data"
}

# HTTP listener
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1  # For development only
}

# UI
ui = true

# API address
api_addr = "http://0.0.0.0:8200"

# Cluster address
cluster_addr = "http://0.0.0.0:8201"

# Telemetry
telemetry {
  prometheus_retention_time = "30s"
  disable_hostname = true
}

# Log level
log_level = "info"

# Max lease TTL
max_lease_ttl = "87600h"  # 10 years

# Default lease TTL
default_lease_ttl = "87600h"
