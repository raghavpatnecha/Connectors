#!/bin/bash

################################################################################
# Multi-Tenant OAuth Validation Script
################################################################################
#
# Purpose: Validate tenant OAuth configurations stored in HashiCorp Vault
#
# This script:
# - Checks which tenant configs are complete in Vault
# - Validates Vault connectivity and authentication
# - Verifies stored credentials can be decrypted
# - Tests encryption key accessibility
# - Reports on tenant OAuth status
#
# Requirements:
# - Vault CLI installed and available in PATH
# - VAULT_ADDR environment variable set
# - VAULT_TOKEN environment variable set (or logged in via vault login)
# - Vault server running and unsealed
#
# Usage:
#   # Validate specific tenant
#   ./validate-tenant-oauth.sh --tenant example-tenant-001
#
#   # Validate all tenants
#   ./validate-tenant-oauth.sh --all
#
#   # Validate with detailed output
#   ./validate-tenant-oauth.sh --tenant example-tenant-001 --verbose
#
# Options:
#   --tenant ID      Tenant ID to validate
#   --all            Validate all tenants in Vault
#   --verbose        Show detailed credential information (careful with sensitive data)
#   --check-decrypt  Test token decryption (requires access to Transit engine)
#   -h, --help       Show this help message
#
################################################################################

set -euo pipefail  # Exit on error, undefined variables, pipe failures

# =============================================================================
# Configuration
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VAULT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$VAULT_DIR")"

# Default values
TENANT_ID=""
VALIDATE_ALL=false
VERBOSE=false
CHECK_DECRYPT=false

# Vault paths
KV_MOUNT="secret"
TRANSIT_MOUNT="transit"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_section() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}▶${NC} $1"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_vault_connectivity() {
    log_info "Checking Vault connectivity..."

    # Check if vault CLI is installed
    if ! command -v vault &> /dev/null; then
        log_error "Vault CLI not found"
        return 1
    fi

    # Check if VAULT_ADDR is set
    if [ -z "${VAULT_ADDR:-}" ]; then
        log_error "VAULT_ADDR environment variable not set"
        return 1
    fi

    # Check if authenticated
    if ! vault token lookup &> /dev/null; then
        log_error "Not authenticated to Vault"
        return 1
    fi

    # Check if KV engine is enabled
    if ! vault secrets list -format=json | jq -e ".\"${KV_MOUNT}/\"" &> /dev/null; then
        log_error "KV v2 engine not enabled at ${KV_MOUNT}/"
        return 1
    fi

    # Check if Transit engine is enabled
    if ! vault secrets list -format=json | jq -e ".\"${TRANSIT_MOUNT}/\"" &> /dev/null; then
        log_error "Transit engine not enabled at ${TRANSIT_MOUNT}/"
        return 1
    fi

    log_success "Vault connectivity OK"
    log_info "  Vault Address: ${VAULT_ADDR}"
    log_info "  KV Mount: ${KV_MOUNT}/"
    log_info "  Transit Mount: ${TRANSIT_MOUNT}/"

    return 0
}

list_all_tenants() {
    # List all tenants from KV store
    local tenant_path="${KV_MOUNT}/metadata/tenants"

    if ! vault list -format=json "$tenant_path" &> /dev/null; then
        echo ""
        return 0
    fi

    vault list -format=json "$tenant_path" 2>/dev/null | jq -r '.[]' || echo ""
}

list_tenant_integrations() {
    local tenant_id=$1
    local tenant_path="${KV_MOUNT}/metadata/tenants/${tenant_id}"

    if ! vault list -format=json "$tenant_path" &> /dev/null; then
        echo ""
        return 0
    fi

    vault list -format=json "$tenant_path" 2>/dev/null | jq -r '.[]' || echo ""
}

validate_tenant_integration() {
    local tenant_id=$1
    local integration=$2
    local issues=0

    echo -e "\n  ${MAGENTA}Integration: ${integration}${NC}"

    # Check if credentials exist
    local cred_path="${KV_MOUNT}/tenants/${tenant_id}/${integration}"

    if ! vault kv get -format=json "$cred_path" &> /dev/null; then
        log_error "    Credentials not found: ${cred_path}"
        return 1
    fi

    local cred_data=$(vault kv get -format=json "$cred_path")

    # Extract credential fields
    local client_id=$(echo "$cred_data" | jq -r '.data.data.client_id // empty')
    local client_secret=$(echo "$cred_data" | jq -r '.data.data.client_secret // empty')
    local redirect_uri=$(echo "$cred_data" | jq -r '.data.data.redirect_uri // empty')
    local created_at=$(echo "$cred_data" | jq -r '.data.data.created_at // empty')

    # Validate required fields
    if [ -z "$client_id" ]; then
        log_error "    Missing client_id"
        ((issues++))
    else
        log_success "    client_id present"
        if [ "$VERBOSE" = true ]; then
            echo -e "      ${BLUE}Value: ${client_id:0:20}...${NC}"
        fi
    fi

    if [ -z "$client_secret" ]; then
        log_error "    Missing client_secret (encrypted)"
        ((issues++))
    else
        log_success "    client_secret present (encrypted)"
        if [ "$VERBOSE" = true ]; then
            echo -e "      ${BLUE}Value: ${client_secret:0:40}...${NC}"
        fi
    fi

    if [ -z "$redirect_uri" ]; then
        log_error "    Missing redirect_uri"
        ((issues++))
    else
        log_success "    redirect_uri: ${redirect_uri}"
    fi

    # Check encryption key
    local key_name="${integration}-${tenant_id}"
    if ! vault read "${TRANSIT_MOUNT}/keys/${key_name}" &> /dev/null; then
        log_error "    Encryption key not found: ${key_name}"
        ((issues++))
    else
        log_success "    Encryption key exists: ${key_name}"

        # Test decryption if requested
        if [ "$CHECK_DECRYPT" = true ] && [ -n "$client_secret" ]; then
            log_info "    Testing decryption..."
            if vault write -field=plaintext "${TRANSIT_MOUNT}/decrypt/${key_name}" \
                ciphertext="$client_secret" &> /dev/null; then
                log_success "    Decryption test passed"
            else
                log_error "    Decryption test failed"
                ((issues++))
            fi
        fi
    fi

    # Show metadata if verbose
    if [ "$VERBOSE" = true ]; then
        echo -e "    ${BLUE}Created: ${created_at}${NC}"

        local version=$(echo "$cred_data" | jq -r '.data.metadata.version // "unknown"')
        echo -e "    ${BLUE}Version: ${version}${NC}"
    fi

    if [ $issues -eq 0 ]; then
        log_success "    Integration valid"
        return 0
    else
        log_error "    Integration has $issues issue(s)"
        return 1
    fi
}

validate_tenant() {
    local tenant_id=$1

    log_section "Validating Tenant: ${tenant_id}"

    # List integrations
    local integrations=($(list_tenant_integrations "$tenant_id"))

    if [ ${#integrations[@]} -eq 0 ]; then
        log_warning "No integrations found for tenant: ${tenant_id}"
        return 1
    fi

    log_info "Found ${#integrations[@]} integration(s): ${integrations[*]}"

    # Validate each integration
    local valid_count=0
    local total_count=${#integrations[@]}

    for integration in "${integrations[@]}"; do
        if validate_tenant_integration "$tenant_id" "$integration"; then
            ((valid_count++))
        fi
    done

    # Summary
    echo ""
    if [ $valid_count -eq $total_count ]; then
        log_success "Tenant validation passed: $valid_count/$total_count integrations valid"
        return 0
    else
        log_error "Tenant validation failed: $valid_count/$total_count integrations valid"
        return 1
    fi
}

validate_all_tenants() {
    log_section "Validating All Tenants"

    local tenants=($(list_all_tenants))

    if [ ${#tenants[@]} -eq 0 ]; then
        log_warning "No tenants found in Vault"
        return 0
    fi

    log_info "Found ${#tenants[@]} tenant(s)"

    local valid_count=0
    for tenant in "${tenants[@]}"; do
        if validate_tenant "$tenant"; then
            ((valid_count++))
        fi
        echo ""
    done

    # Overall summary
    log_section "Validation Summary"
    echo ""
    echo "Total Tenants: ${#tenants[@]}"
    echo "Valid Tenants: ${valid_count}"
    echo "Invalid Tenants: $((${#tenants[@]} - valid_count))"
    echo ""

    if [ $valid_count -eq ${#tenants[@]} ]; then
        log_success "All tenants validated successfully"
        return 0
    else
        log_warning "Some tenants have issues"
        return 1
    fi
}

show_help() {
    cat << EOF
Multi-Tenant OAuth Validation Script

Usage:
  $0 --tenant TENANT_ID
  $0 --all
  $0 --tenant TENANT_ID --verbose --check-decrypt

Options:
  --tenant ID      Tenant ID to validate
  --all            Validate all tenants in Vault
  --verbose        Show detailed credential information
  --check-decrypt  Test token decryption (requires Transit access)
  -h, --help       Show this help message

Examples:
  # Validate specific tenant
  $0 --tenant example-tenant-001

  # Validate all tenants
  $0 --all

  # Validate with full details
  $0 --tenant example-tenant-001 --verbose --check-decrypt

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
            --all)
                VALIDATE_ALL=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --check-decrypt)
                CHECK_DECRYPT=true
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
    echo "  Multi-Tenant OAuth Validation"
    echo "  Vault Address: ${VAULT_ADDR:-not set}"
    echo "=============================================================================="
    echo ""

    # Check Vault connectivity
    if ! check_vault_connectivity; then
        log_error "Vault connectivity check failed"
        exit 1
    fi

    echo ""

    # Handle --all mode
    if [ "$VALIDATE_ALL" = true ]; then
        validate_all_tenants
        exit $?
    fi

    # Single tenant mode
    if [ -z "$TENANT_ID" ]; then
        log_error "Tenant ID required (--tenant) or use --all"
        show_help
        exit 1
    fi

    validate_tenant "$TENANT_ID"
    exit $?
}

# Run main function
main "$@"
