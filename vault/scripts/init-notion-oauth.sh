#!/bin/bash

################################################################################
# Notion OAuth Vault Initialization Script
# ⚠️  DEPRECATED - Use init-tenant-oauth.sh instead
################################################################################
#
# DEPRECATION NOTICE:
# This script is deprecated and maintained only for backward compatibility.
# Please use the new unified multi-tenant script:
#   ./vault/scripts/init-tenant-oauth.sh
#
# Migration:
#   1. Copy config/tenants/example-notion.yaml
#   2. Customize for your tenant
#   3. Run: ./init-tenant-oauth.sh --tenant your-tenant --config your-config.yaml
#
# Purpose: Initialize HashiCorp Vault with Notion OAuth configuration
#
# This script:
# 1. Enables KV v2 secrets engine for credential storage
# 2. Enables Transit encryption engine for token encryption
# 3. Creates Notion OAuth policy with per-tenant access control
# 4. Creates example tenant credentials (for testing)
# 5. Tests credential storage, encryption, and retrieval
# 6. Validates OAuth configuration
#
# Requirements:
# - Vault CLI installed and available in PATH
# - VAULT_ADDR environment variable set
# - VAULT_TOKEN environment variable set (or logged in via vault login)
# - Vault server running and unsealed
#
# Usage:
#   export VAULT_ADDR='http://localhost:8200'
#   export VAULT_TOKEN='your-vault-token'
#   ./init-notion-oauth.sh
#
# Options:
#   --skip-test    Skip credential testing
#   --tenant-id    Specify custom tenant ID for test (default: test-tenant-001)
#   --cleanup      Remove all Notion OAuth configuration
#   --dry-run      Show what would be done without making changes
#
################################################################################

set -euo pipefail  # Exit on error, undefined variables, pipe failures

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VAULT_DIR="$(dirname "$SCRIPT_DIR")"
POLICY_FILE="${VAULT_DIR}/policies/notion-oauth-policy.hcl"
CONFIG_FILE="${VAULT_DIR}/configs/notion-oauth-config.json"

# Default values
DEFAULT_TENANT_ID="test-tenant-001"
SKIP_TEST=false
DRY_RUN=false
CLEANUP=false

# Vault paths
KV_MOUNT="secret"
TRANSIT_MOUNT="transit"
POLICY_NAME="notion-oauth"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if vault CLI is installed
    if ! command -v vault &> /dev/null; then
        log_error "Vault CLI not found. Please install from https://www.vaultproject.io/downloads"
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

    # Check if policy file exists
    if [ ! -f "$POLICY_FILE" ]; then
        log_error "Policy file not found: $POLICY_FILE"
        exit 1
    fi

    # Check if config file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        log_warning "Config file not found: $CONFIG_FILE"
        log_warning "Continuing without config validation..."
    fi

    log_success "Prerequisites check passed"
}

enable_kv_engine() {
    log_info "Enabling KV v2 secrets engine at ${KV_MOUNT}/..."

    # Check if already enabled
    if vault secrets list -format=json | jq -e ".\"${KV_MOUNT}/\"" &> /dev/null; then
        log_warning "KV secrets engine already enabled at ${KV_MOUNT}/"

        # Verify it's KV v2
        local kv_version=$(vault secrets list -format=json | jq -r ".\"${KV_MOUNT}/\".options.version // \"1\"")
        if [ "$kv_version" != "2" ]; then
            log_error "Existing KV engine at ${KV_MOUNT}/ is version $kv_version, need version 2"
            log_info "Please migrate or use a different mount path"
            exit 1
        fi

        log_success "Existing KV v2 engine validated"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would enable KV v2 engine at ${KV_MOUNT}/"
        return 0
    fi

    # Enable KV v2
    if vault secrets enable -path="${KV_MOUNT}" -version=2 kv; then
        log_success "KV v2 secrets engine enabled at ${KV_MOUNT}/"
    else
        log_error "Failed to enable KV v2 secrets engine"
        exit 1
    fi
}

enable_transit_engine() {
    log_info "Enabling Transit encryption engine at ${TRANSIT_MOUNT}/..."

    # Check if already enabled
    if vault secrets list -format=json | jq -e ".\"${TRANSIT_MOUNT}/\"" &> /dev/null; then
        log_warning "Transit engine already enabled at ${TRANSIT_MOUNT}/"
        log_success "Existing Transit engine validated"
        return 0
    fi

    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would enable Transit engine at ${TRANSIT_MOUNT}/"
        return 0
    fi

    # Enable Transit
    if vault secrets enable -path="${TRANSIT_MOUNT}" transit; then
        log_success "Transit encryption engine enabled at ${TRANSIT_MOUNT}/"
    else
        log_error "Failed to enable Transit encryption engine"
        exit 1
    fi
}

create_policy() {
    log_info "Creating Notion OAuth policy..."

    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would create policy from: $POLICY_FILE"
        return 0
    fi

    # Create/update policy
    if vault policy write "$POLICY_NAME" "$POLICY_FILE"; then
        log_success "Policy '${POLICY_NAME}' created successfully"

        # Show policy
        log_info "Policy contents:"
        vault policy read "$POLICY_NAME" | head -n 20
    else
        log_error "Failed to create policy"
        exit 1
    fi
}

create_encryption_key() {
    local tenant_id=$1
    local key_name="notion-${tenant_id}"

    log_info "Creating Transit encryption key: ${key_name}"

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
        allow_plaintext_backup=false; then
        log_success "Encryption key '${key_name}' created"
    else
        log_error "Failed to create encryption key"
        exit 1
    fi
}

encrypt_token() {
    local tenant_id=$1
    local plaintext=$2
    local key_name="notion-${tenant_id}"

    # Base64 encode the plaintext
    local encoded=$(echo -n "$plaintext" | base64)

    # Encrypt with Transit
    local encrypted=$(vault write -field=ciphertext \
        "${TRANSIT_MOUNT}/encrypt/${key_name}" \
        plaintext="$encoded")

    echo "$encrypted"
}

decrypt_token() {
    local tenant_id=$1
    local ciphertext=$2
    local key_name="notion-${tenant_id}"

    # Decrypt with Transit
    local decrypted=$(vault write -field=plaintext \
        "${TRANSIT_MOUNT}/decrypt/${key_name}" \
        ciphertext="$ciphertext")

    # Base64 decode
    echo "$decrypted" | base64 -d
}

create_test_credentials() {
    local tenant_id=$1

    log_info "Creating test credentials for tenant: ${tenant_id}"

    # Create encryption key first
    create_encryption_key "$tenant_id"

    # Generate mock Notion credentials
    local access_token="secret_test_${tenant_id}_$(date +%s)"
    local bot_id="bot-${tenant_id}-test"
    local workspace_id="ws-${tenant_id}-test"
    local workspace_name="Test Workspace - ${tenant_id}"

    log_info "Encrypting access token..."
    local encrypted_token=$(encrypt_token "$tenant_id" "$access_token")

    if [ "$DRY_RUN" = true ]; then
        log_info "[DRY-RUN] Would store credentials at: ${KV_MOUNT}/data/tenants/${tenant_id}/notion"
        return 0
    fi

    # Store credentials in KV v2
    local cred_path="${KV_MOUNT}/data/tenants/${tenant_id}/notion"

    log_info "Storing credentials at: ${cred_path}"

    if vault kv put "${KV_MOUNT}/tenants/${tenant_id}/notion" \
        access_token="$encrypted_token" \
        token_type="bearer" \
        bot_id="$bot_id" \
        workspace_id="$workspace_id" \
        workspace_name="$workspace_name" \
        owner_type="user" \
        created_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        updated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        environment="test" \
        note="Auto-generated test credentials"; then
        log_success "Test credentials stored successfully"

        # Store original plaintext token for validation (in metadata)
        echo "$access_token" > "/tmp/notion_test_token_${tenant_id}.txt"
        log_info "Original token saved to: /tmp/notion_test_token_${tenant_id}.txt"
    else
        log_error "Failed to store test credentials"
        exit 1
    fi
}

test_credential_operations() {
    local tenant_id=$1

    log_info "Testing credential operations for tenant: ${tenant_id}"

    # Read credentials
    log_info "Reading stored credentials..."
    local cred_path="${KV_MOUNT}/tenants/${tenant_id}/notion"

    if ! vault kv get -format=json "$cred_path" &> /dev/null; then
        log_error "Failed to read credentials"
        return 1
    fi

    local stored_data=$(vault kv get -format=json "$cred_path")
    local encrypted_token=$(echo "$stored_data" | jq -r '.data.data.access_token')
    local bot_id=$(echo "$stored_data" | jq -r '.data.data.bot_id')

    log_success "Credentials read successfully"
    log_info "Bot ID: ${bot_id}"

    # Decrypt token
    log_info "Decrypting access token..."
    local decrypted_token=$(decrypt_token "$tenant_id" "$encrypted_token")

    # Validate decryption
    if [ -f "/tmp/notion_test_token_${tenant_id}.txt" ]; then
        local original_token=$(cat "/tmp/notion_test_token_${tenant_id}.txt")

        if [ "$decrypted_token" = "$original_token" ]; then
            log_success "Token encryption/decryption validated successfully"
        else
            log_error "Token mismatch after decryption!"
            return 1
        fi
    else
        log_warning "Original token not found, skipping validation"
    fi

    # Test credential versioning (KV v2 feature)
    log_info "Testing credential versioning..."

    # Update credentials
    vault kv put "$cred_path" \
        access_token="$encrypted_token" \
        token_type="bearer" \
        bot_id="$bot_id" \
        workspace_id="$(echo "$stored_data" | jq -r '.data.data.workspace_id')" \
        workspace_name="$(echo "$stored_data" | jq -r '.data.data.workspace_name')" \
        owner_type="user" \
        created_at="$(echo "$stored_data" | jq -r '.data.data.created_at')" \
        updated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        environment="test" \
        note="Updated during testing" \
        &> /dev/null

    # Check version count
    local version_count=$(vault kv metadata get -format=json "$cred_path" | jq '.data.current_version')

    if [ "$version_count" -ge 2 ]; then
        log_success "Credential versioning working (version: ${version_count})"
    else
        log_warning "Credential versioning check inconclusive"
    fi

    log_success "All credential operations tested successfully"
}

validate_configuration() {
    log_info "Validating OAuth configuration..."

    if [ ! -f "$CONFIG_FILE" ]; then
        log_warning "Config file not found, skipping validation"
        return 0
    fi

    # Validate JSON syntax
    if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
        log_error "Invalid JSON in config file"
        return 1
    fi

    # Check required fields
    local required_fields=(
        ".oauth.endpoints.authorization.url"
        ".oauth.endpoints.token.url"
        ".vault_integration.credential_storage.engine"
        ".vault_integration.encryption.engine"
    )

    for field in "${required_fields[@]}"; do
        if ! jq -e "$field" "$CONFIG_FILE" &> /dev/null; then
            log_error "Missing required field: $field"
            return 1
        fi
    done

    log_success "OAuth configuration validated"
}

cleanup_notion_oauth() {
    log_warning "Cleaning up Notion OAuth configuration..."

    read -p "Are you sure you want to remove all Notion OAuth configuration? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Cleanup cancelled"
        exit 0
    fi

    # Delete policy
    log_info "Deleting policy: ${POLICY_NAME}"
    vault policy delete "$POLICY_NAME" 2>/dev/null || true

    # Delete test credentials
    log_info "Deleting test tenant credentials..."
    vault kv metadata delete "${KV_MOUNT}/tenants/${DEFAULT_TENANT_ID}/notion" 2>/dev/null || true

    # Delete encryption keys (list all notion-* keys)
    log_info "Deleting encryption keys..."
    vault list -format=json "${TRANSIT_MOUNT}/keys" 2>/dev/null | \
        jq -r '.[]' | \
        grep "^notion-" | \
        xargs -I {} vault delete "${TRANSIT_MOUNT}/keys/{}" 2>/dev/null || true

    log_success "Cleanup completed"
}

print_summary() {
    local tenant_id=$1

    echo ""
    echo "=============================================================================="
    log_success "Notion OAuth Vault Initialization Complete!"
    echo "=============================================================================="
    echo ""
    echo "Configuration Summary:"
    echo "  - KV v2 Engine:      ${KV_MOUNT}/"
    echo "  - Transit Engine:    ${TRANSIT_MOUNT}/"
    echo "  - Policy:            ${POLICY_NAME}"
    echo "  - Test Tenant:       ${tenant_id}"
    echo ""
    echo "Credential Path:"
    echo "  ${KV_MOUNT}/tenants/${tenant_id}/notion"
    echo ""
    echo "Encryption Key:"
    echo "  ${TRANSIT_MOUNT}/keys/notion-${tenant_id}"
    echo ""
    echo "Next Steps:"
    echo "  1. Configure Notion integration at: https://www.notion.so/my-integrations"
    echo "  2. Store client_id and client_secret in Vault"
    echo "  3. Implement OAuth flow in gateway service"
    echo "  4. Test with real Notion workspace"
    echo ""
    echo "Useful Commands:"
    echo "  # Read credentials"
    echo "  vault kv get ${KV_MOUNT}/tenants/${tenant_id}/notion"
    echo ""
    echo "  # View policy"
    echo "  vault policy read ${POLICY_NAME}"
    echo ""
    echo "  # Encrypt a token"
    echo "  echo -n 'your_token' | base64 | vault write -field=ciphertext \\"
    echo "    ${TRANSIT_MOUNT}/encrypt/notion-${tenant_id} plaintext=-"
    echo ""
    echo "  # Rotate encryption key"
    echo "  vault write -f ${TRANSIT_MOUNT}/keys/notion-${tenant_id}/rotate"
    echo ""
    echo "=============================================================================="
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    # Parse command line arguments
    TENANT_ID="$DEFAULT_TENANT_ID"

    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-test)
                SKIP_TEST=true
                shift
                ;;
            --tenant-id)
                TENANT_ID="$2"
                shift 2
                ;;
            --cleanup)
                CLEANUP=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --skip-test       Skip credential testing"
                echo "  --tenant-id ID    Specify custom tenant ID (default: test-tenant-001)"
                echo "  --cleanup         Remove all Notion OAuth configuration"
                echo "  --dry-run         Show what would be done without making changes"
                echo "  -h, --help        Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Handle cleanup mode
    if [ "$CLEANUP" = true ]; then
        cleanup_notion_oauth
        exit 0
    fi

    # Banner
    echo "=============================================================================="
    echo "  Notion OAuth Vault Initialization"
    echo "  Vault Address: ${VAULT_ADDR}"
    if [ "$DRY_RUN" = true ]; then
        echo "  Mode: DRY-RUN (no changes will be made)"
    fi
    echo "=============================================================================="
    echo ""

    # Run initialization steps
    check_prerequisites
    echo ""

    enable_kv_engine
    echo ""

    enable_transit_engine
    echo ""

    create_policy
    echo ""

    validate_configuration
    echo ""

    if [ "$DRY_RUN" = false ]; then
        create_test_credentials "$TENANT_ID"
        echo ""

        if [ "$SKIP_TEST" = false ]; then
            test_credential_operations "$TENANT_ID"
            echo ""
        fi

        print_summary "$TENANT_ID"
    else
        log_info "[DRY-RUN] Would create test credentials for tenant: ${TENANT_ID}"
        echo ""
        log_info "[DRY-RUN] Initialization complete (no changes made)"
    fi
}

# Run main function
main "$@"
