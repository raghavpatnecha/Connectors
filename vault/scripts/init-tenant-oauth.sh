#!/bin/bash

################################################################################
# Multi-Tenant OAuth Vault Initialization Script
################################################################################
#
# Purpose: Initialize HashiCorp Vault with multi-tenant OAuth configuration
#
# This unified script replaces integration-specific scripts (e.g., init-notion-oauth.sh)
# and supports multiple OAuth integrations per tenant from a single YAML config file.
#
# Features:
# - Multi-integration support (Notion, GitHub, Slack, Linear, etc.)
# - YAML-based configuration with environment variable substitution
# - JSON Schema validation
# - Per-tenant encryption keys
# - Batch processing (--all flag)
# - Idempotent (safe to run multiple times)
#
# Requirements:
# - Vault CLI installed and available in PATH
# - yq (YAML processor) installed
# - VAULT_ADDR environment variable set
# - VAULT_TOKEN environment variable set (or logged in via vault login)
# - Vault server running and unsealed
#
# Usage:
#   # Single tenant
#   export NOTION_CLIENT_ID="..." NOTION_CLIENT_SECRET="..." GITHUB_CLIENT_ID="..." GITHUB_CLIENT_SECRET="..."
#   ./init-tenant-oauth.sh --tenant example-tenant-001 --config config/tenants/example-tenant.yaml
#
#   # All tenants in directory
#   ./init-tenant-oauth.sh --all
#
#   # Dry run (no changes)
#   ./init-tenant-oauth.sh --tenant example-tenant-001 --config config/tenants/example-tenant.yaml --dry-run
#
# Options:
#   --tenant ID         Tenant ID to initialize
#   --config FILE       Path to tenant YAML config file
#   --all               Process all config files in config/tenants/ directory
#   --skip-validation   Skip config validation (not recommended)
#   --dry-run           Show what would be done without making changes
#   --cleanup           Remove tenant credentials and keys
#   -h, --help          Show this help message
#
################################################################################

set -euo pipefail  # Exit on error, undefined variables, pipe failures

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VAULT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$VAULT_DIR")"
CONFIG_DIR="${PROJECT_ROOT}/config/tenants"
SCHEMA_FILE="${PROJECT_ROOT}/config/schemas/tenant-oauth-config.schema.json"

# Default values
TENANT_ID=""
CONFIG_FILE=""
PROCESS_ALL=false
SKIP_VALIDATION=false
DRY_RUN=false
CLEANUP=false

# Vault paths
KV_MOUNT="secret"
TRANSIT_MOUNT="transit"
POLICY_PREFIX="oauth"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}▶${NC} $1"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if vault CLI is installed
    if ! command -v vault &> /dev/null; then
        log_error "Vault CLI not found. Please install from https://www.vaultproject.io/downloads"
        exit 1
    fi

    # Check if yq is installed
    if ! command -v yq &> /dev/null; then
        log_error "yq not found. Please install from https://github.com/mikefarah/yq"
        exit 1
    fi

    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        log_error "jq not found. Please install jq"
        exit 1
    fi

    # Check if VAULT_ADDR is set
    if [ -z "${VAULT_ADDR:-}" ]; then
        log_error "VAULT_ADDR environment variable not set"
        log_info "Example: export VAULT_ADDR='http://localhost:8200'"
        exit 1
    fi

    # Check if authenticated
    if ! vault token lookup &> /dev/null; then
        log_error "Not authenticated to Vault. Please login first."
        log_info "Example: vault login or export VAULT_TOKEN='your-token'"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

validate_config_file() {
    local config_file=$1

    if [ ! -f "$config_file" ]; then
        log_error "Config file not found: $config_file"
        return 1
    fi

    log_info "Validating YAML syntax: $(basename "$config_file")"

    # Validate YAML syntax
    if ! yq eval '.' "$config_file" > /dev/null 2>&1; then
        log_error "Invalid YAML syntax in config file"
        return 1
    fi

    # Extract tenant_id
    local tenant_id=$(yq eval '.tenant_id' "$config_file")
    if [ -z "$tenant_id" ] || [ "$tenant_id" = "null" ]; then
        log_error "Missing tenant_id in config file"
        return 1
    fi

    # Check if integrations are defined
    local integration_count=$(yq eval '.integrations | keys | length' "$config_file")
    if [ "$integration_count" -eq 0 ]; then
        log_error "No integrations defined in config file"
        return 1
    fi

    log_success "Config file validated: tenant_id=$tenant_id, integrations=$integration_count"
    return 0
}

substitute_env_vars() {
    local config_file=$1
    local temp_file="/tmp/tenant_oauth_config_$$.json"

    # Convert YAML to JSON and substitute environment variables
    yq eval -o=json '.' "$config_file" > "$temp_file"

    # Find all ${VAR} patterns and substitute
    local json_content=$(cat "$temp_file")

    # Extract all environment variable references
    local env_vars=$(echo "$json_content" | grep -oP '\$\{[A-Z_][A-Z0-9_]*\}' | sort -u || true)

    local missing_vars=()
    for var_placeholder in $env_vars; do
        # Extract variable name (remove ${ and })
        local var_name=$(echo "$var_placeholder" | sed 's/\${\(.*\)}/\1/')
        local var_value="${!var_name:-}"

        if [ -z "$var_value" ]; then
            missing_vars+=("$var_name")
        else
            # Replace in JSON content
            json_content=$(echo "$json_content" | sed "s|\${$var_name}|$var_value|g")
        fi
    done

    # Save substituted content
    echo "$json_content" > "$temp_file"

    # Report missing variables
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_warning "Missing environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        echo ""
        log_error "Cannot proceed with missing credentials. Please set environment variables."
        rm -f "$temp_file"
        return 1
    fi

    echo "$temp_file"
}

enable_vault_engines() {
    log_info "Enabling Vault secrets engines..."

    # Enable KV v2
    if vault secrets list -format=json | jq -e ".\"${KV_MOUNT}/\"" &> /dev/null; then
        log_warning "KV secrets engine already enabled at ${KV_MOUNT}/"
    else
        if [ "$DRY_RUN" = false ]; then
            vault secrets enable -path="${KV_MOUNT}" -version=2 kv
            log_success "KV v2 secrets engine enabled at ${KV_MOUNT}/"
        else
            log_info "[DRY-RUN] Would enable KV v2 engine at ${KV_MOUNT}/"
        fi
    fi

    # Enable Transit
    if vault secrets list -format=json | jq -e ".\"${TRANSIT_MOUNT}/\"" &> /dev/null; then
        log_warning "Transit engine already enabled at ${TRANSIT_MOUNT}/"
    else
        if [ "$DRY_RUN" = false ]; then
            vault secrets enable -path="${TRANSIT_MOUNT}" transit
            log_success "Transit encryption engine enabled at ${TRANSIT_MOUNT}/"
        else
            log_info "[DRY-RUN] Would enable Transit engine at ${TRANSIT_MOUNT}/"
        fi
    fi
}

create_encryption_key() {
    local tenant_id=$1
    local integration=$2
    local key_name="${integration}-${tenant_id}"

    log_info "Creating encryption key: ${key_name}"

    # Check if key already exists
    if vault read "${TRANSIT_MOUNT}/keys/${key_name}" &> /dev/null; then
        log_warning "Encryption key '${key_name}' already exists"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would create encryption key: ${key_name}"
        return 0
    fi

    # Create encryption key (AES-GCM with 256-bit key)
    if vault write "${TRANSIT_MOUNT}/keys/${key_name}" \
        type=aes256-gcm96 \
        derived=false \
        exportable=false \
        allow_plaintext_backup=false &> /dev/null; then
        log_success "Encryption key '${key_name}' created"
    else
        log_error "Failed to create encryption key: ${key_name}"
        return 1
    fi
}

encrypt_token() {
    local tenant_id=$1
    local integration=$2
    local plaintext=$3
    local key_name="${integration}-${tenant_id}"

    # Base64 encode the plaintext
    local encoded=$(echo -n "$plaintext" | base64 -w 0)

    # Encrypt with Transit
    local encrypted=$(vault write -field=ciphertext \
        "${TRANSIT_MOUNT}/encrypt/${key_name}" \
        plaintext="$encoded" 2>/dev/null || echo "")

    if [ -z "$encrypted" ]; then
        log_error "Failed to encrypt token for ${integration}"
        return 1
    fi

    echo "$encrypted"
}

store_credentials() {
    local tenant_id=$1
    local integration=$2
    local config_json=$3

    log_info "Processing integration: ${integration}"

    # Extract integration config
    local client_id=$(echo "$config_json" | jq -r ".integrations.${integration}.client_id // empty")
    local client_secret=$(echo "$config_json" | jq -r ".integrations.${integration}.client_secret // empty")
    local redirect_uri=$(echo "$config_json" | jq -r ".integrations.${integration}.redirect_uri // empty")
    local scopes=$(echo "$config_json" | jq -c ".integrations.${integration}.scopes // []")
    local enabled=$(echo "$config_json" | jq -r ".integrations.${integration}.enabled // true")

    # Validate required fields
    if [ -z "$client_id" ] || [ -z "$client_secret" ] || [ -z "$redirect_uri" ]; then
        log_error "Missing required fields for integration: ${integration}"
        return 1
    fi

    # Skip if disabled
    if [ "$enabled" = "false" ]; then
        log_warning "Integration '${integration}' is disabled, skipping"
        return 0
    fi

    # Create encryption key
    create_encryption_key "$tenant_id" "$integration" || return 1

    # Encrypt client_secret
    log_info "Encrypting client_secret for ${integration}..."
    local encrypted_secret=$(encrypt_token "$tenant_id" "$integration" "$client_secret")

    if [ -z "$encrypted_secret" ]; then
        log_error "Failed to encrypt client_secret"
        return 1
    fi

    # Store in Vault KV
    local cred_path="${KV_MOUNT}/tenants/${tenant_id}/${integration}"

    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would store credentials at: ${cred_path}"
        return 0
    fi

    log_info "Storing credentials at: ${cred_path}"

    if vault kv put "$cred_path" \
        client_id="$client_id" \
        client_secret="$encrypted_secret" \
        redirect_uri="$redirect_uri" \
        scopes="$scopes" \
        created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        updated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        environment="${ENVIRONMENT:-production}" \
        integration="$integration" &> /dev/null; then
        log_success "Credentials stored: ${integration}"
    else
        log_error "Failed to store credentials for ${integration}"
        return 1
    fi
}

process_tenant_config() {
    local config_file=$1

    log_section "Processing: $(basename "$config_file")"

    # Validate config file
    if ! validate_config_file "$config_file"; then
        log_error "Config validation failed, skipping"
        return 1
    fi

    # Substitute environment variables
    local substituted_file=$(substitute_env_vars "$config_file")
    if [ -z "$substituted_file" ]; then
        return 1
    fi

    # Extract tenant info
    local config_json=$(cat "$substituted_file")
    local tenant_id=$(echo "$config_json" | jq -r '.tenant_id')
    local integrations=($(echo "$config_json" | jq -r '.integrations | keys[]'))

    log_info "Tenant ID: ${tenant_id}"
    log_info "Integrations: ${integrations[*]}"

    # Enable Vault engines
    enable_vault_engines

    # Process each integration
    local success_count=0
    local total_count=${#integrations[@]}

    for integration in "${integrations[@]}"; do
        if store_credentials "$tenant_id" "$integration" "$config_json"; then
            ((success_count++))
        fi
    done

    # Cleanup temp file
    rm -f "$substituted_file"

    # Summary
    echo ""
    if [ $success_count -eq $total_count ]; then
        log_success "All integrations processed successfully ($success_count/$total_count)"
        print_summary "$tenant_id" "${integrations[@]}"
        return 0
    else
        log_warning "Some integrations failed ($success_count/$total_count succeeded)"
        return 1
    fi
}

cleanup_tenant() {
    local tenant_id=$1

    log_warning "Cleaning up tenant: ${tenant_id}"

    read -p "Are you sure you want to remove all credentials for ${tenant_id}? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Cleanup cancelled"
        exit 0
    fi

    # Delete all tenant credentials
    log_info "Deleting credentials for tenant: ${tenant_id}"
    vault kv metadata delete "${KV_MOUNT}/tenants/${tenant_id}" 2>/dev/null || true

    # Delete encryption keys
    log_info "Deleting encryption keys..."
    vault list -format=json "${TRANSIT_MOUNT}/keys" 2>/dev/null | \
        jq -r '.[]' | \
        grep -- "-${tenant_id}$" | \
        xargs -I {} vault delete "${TRANSIT_MOUNT}/keys/{}" 2>/dev/null || true

    log_success "Cleanup completed for tenant: ${tenant_id}"
}

print_summary() {
    local tenant_id=$1
    shift
    local integrations=("$@")

    echo ""
    echo "=============================================================================="
    log_success "Tenant OAuth Initialization Complete!"
    echo "=============================================================================="
    echo ""
    echo "Tenant ID: ${tenant_id}"
    echo "Integrations:"
    for integration in "${integrations[@]}"; do
        echo "  - ${integration}"
        echo "      Credentials: ${KV_MOUNT}/tenants/${tenant_id}/${integration}"
        echo "      Encryption:  ${TRANSIT_MOUNT}/keys/${integration}-${tenant_id}"
    done
    echo ""
    echo "Next Steps:"
    echo "  1. Configure OAuth applications in each provider"
    echo "  2. Implement OAuth flows in gateway service"
    echo "  3. Test with real OAuth callbacks"
    echo ""
    echo "Useful Commands:"
    echo "  # Validate stored credentials"
    echo "  ./vault/scripts/validate-tenant-oauth.sh --tenant ${tenant_id}"
    echo ""
    echo "  # Read credentials"
    for integration in "${integrations[@]}"; do
        echo "  vault kv get ${KV_MOUNT}/tenants/${tenant_id}/${integration}"
    done
    echo ""
    echo "=============================================================================="
}

show_help() {
    cat << EOF
Multi-Tenant OAuth Vault Initialization Script

Usage:
  $0 --tenant TENANT_ID --config CONFIG_FILE
  $0 --all
  $0 --cleanup --tenant TENANT_ID

Options:
  --tenant ID         Tenant ID to initialize
  --config FILE       Path to tenant YAML config file
  --all               Process all config files in config/tenants/ directory
  --skip-validation   Skip config validation (not recommended)
  --dry-run           Show what would be done without making changes
  --cleanup           Remove tenant credentials and keys
  -h, --help          Show this help message

Examples:
  # Initialize single tenant
  export NOTION_CLIENT_ID="..." NOTION_CLIENT_SECRET="..."
  $0 --tenant example-tenant-001 --config config/tenants/example-tenant.yaml

  # Initialize all tenants
  $0 --all

  # Dry run
  $0 --tenant example-tenant-001 --config config/tenants/example-tenant.yaml --dry-run

  # Cleanup tenant
  $0 --cleanup --tenant example-tenant-001

EOF
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --tenant)
                TENANT_ID="$2"
                shift 2
                ;;
            --config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            --all)
                PROCESS_ALL=true
                shift
                ;;
            --skip-validation)
                SKIP_VALIDATION=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --cleanup)
                CLEANUP=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Banner
    echo "=============================================================================="
    echo "  Multi-Tenant OAuth Vault Initialization"
    echo "  Vault Address: ${VAULT_ADDR}"
    if [ "$DRY_RUN" = true ]; then
        echo "  Mode: DRY-RUN (no changes will be made)"
    fi
    echo "=============================================================================="
    echo ""

    # Check prerequisites
    check_prerequisites
    echo ""

    # Handle cleanup mode
    if [ "$CLEANUP" = true ]; then
        if [ -z "$TENANT_ID" ]; then
            log_error "Tenant ID required for cleanup (--tenant)"
            exit 1
        fi
        cleanup_tenant "$TENANT_ID"
        exit 0
    fi

    # Handle --all mode
    if [ "$PROCESS_ALL" = true ]; then
        log_section "Processing All Tenant Configs"

        if [ ! -d "$CONFIG_DIR" ]; then
            log_error "Config directory not found: $CONFIG_DIR"
            exit 1
        fi

        local config_files=($(find "$CONFIG_DIR" -maxdepth 1 -name "*.yaml" -o -name "*.yml"))

        if [ ${#config_files[@]} -eq 0 ]; then
            log_warning "No config files found in: $CONFIG_DIR"
            exit 0
        fi

        log_info "Found ${#config_files[@]} config file(s)"

        local success_count=0
        for config_file in "${config_files[@]}"; do
            if process_tenant_config "$config_file"; then
                ((success_count++))
            fi
            echo ""
        done

        log_success "Processed $success_count/${#config_files[@]} tenant(s) successfully"
        exit 0
    fi

    # Single tenant mode
    if [ -z "$CONFIG_FILE" ]; then
        log_error "Config file required (--config)"
        show_help
        exit 1
    fi

    process_tenant_config "$CONFIG_FILE"
}

# Run main function
main "$@"
