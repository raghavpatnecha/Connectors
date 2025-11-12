# Code Cleanup and Deprecations

## Overview

This document tracks deprecated files, duplicate code, and cleanup recommendations as part of the multi-tenant migration.

**Status:** Migration to multi-tenant complete
**Last Updated:** 2025-11-12

---

## Files Deprecated (To Be Removed in Next Major Version)

### Notion-Specific Scripts

| File | Status | Replacement | Action |
|------|--------|-------------|--------|
| `vault/scripts/init-notion-oauth.sh` | ⚠️ **DEPRECATED** | `vault/scripts/init-tenant-oauth.sh` | Keep for backward compat until v2.0.0 |
| `scripts/validate-notion-integration.sh` | ⚠️ **DEPRECATED** | `vault/scripts/validate-tenant-oauth.sh` | Archive after migration period |

### Notion-Specific Configurations

| File | Status | Replacement | Action |
|------|--------|-------------|--------|
| `vault/configs/notion-oauth-config.json` | ⚠️ **DEPRECATED** | `gateway/config/tenants.json` | Move to `vault/configs/archive/` |
| `vault/policies/notion-oauth-policy.hcl` | ⚠️ **DEPRECATED** | `vault/policies/tenant-oauth-policy.hcl` | Generalize for all integrations |

### Single-Tenant Documentation

| File | Status | Replacement | Action |
|------|--------|-------------|--------|
| `docs/integrations/NOTION_SETUP.md` | ⚠️ **OUTDATED** | `docs/MULTI_TENANT_SETUP.md` | Add migration notice at top |
| `docs/notion-integration-guide.md` | ⚠️ **OUTDATED** | `docs/MULTI_TENANT_SETUP.md` | Add deprecation notice |
| `docs/notion-integration-summary.md` | ✅ **KEEP** | N/A | Historical reference |

---

## Duplicate Code Identified

### OAuth Initialization Logic

**Issue:** OAuth initialization logic exists in multiple places.

**Files:**
- `vault/scripts/init-notion-oauth.sh` (Notion-specific, 575 lines)
- `vault/scripts/init-tenant-oauth.sh` (Generic, handles all integrations)

**Recommendation:**
```bash
# Phase 1 (Current): Mark init-notion-oauth.sh as deprecated
echo "# DEPRECATED: Use init-tenant-oauth.sh instead" > vault/scripts/init-notion-oauth.sh.DEPRECATED

# Phase 2 (v1.1.0): Create wrapper that calls generic script
cat > vault/scripts/init-notion-oauth.sh <<'EOF'
#!/bin/bash
echo "⚠️  WARNING: This script is deprecated. Use init-tenant-oauth.sh instead."
echo "Redirecting to generic multi-tenant script..."
./vault/scripts/init-tenant-oauth.sh --integration notion "$@"
EOF

# Phase 3 (v2.0.0): Remove entirely
rm vault/scripts/init-notion-oauth.sh
```

### Validation Logic

**Issue:** Separate validation scripts for Notion vs generic tenants.

**Files:**
- `scripts/validate-notion-integration.sh`
- `vault/scripts/validate-tenant-oauth.sh`

**Recommendation:**
- Merge Notion-specific validation into generic validation script
- Add `--integration` flag to generic script
- Remove Notion-specific script

```bash
# Generic script should support:
./vault/scripts/validate-tenant-oauth.sh --tenant test-tenant-001 --integration notion
./vault/scripts/validate-tenant-oauth.sh --tenant test-tenant-001 --integration github
./vault/scripts/validate-tenant-oauth.sh --tenant test-tenant-001 --all
```

### Configuration Parsing

**Issue:** JSON configuration parsing logic duplicated.

**Files:**
- `vault/configs/notion-oauth-config.json` (Notion-specific schema)
- `gateway/config/tenants.schema.json` (Generic tenant schema)

**Recommendation:**
- Use `gateway/config/tenants.schema.json` as single source of truth
- Create integration-specific sub-schemas if needed
- Deprecate `vault/configs/notion-oauth-config.json`

---

## Code to Archive (Not Delete)

These files should be moved to `archive/` directory for historical reference:

```bash
# Create archive directory
mkdir -p archive/single-tenant-setup

# Move deprecated files
mv vault/scripts/init-notion-oauth.sh archive/single-tenant-setup/
mv vault/configs/notion-oauth-config.json archive/single-tenant-setup/
mv scripts/validate-notion-integration.sh archive/single-tenant-setup/

# Create archive README
cat > archive/single-tenant-setup/README.md <<'EOF'
# Archived: Single-Tenant Setup Files

These files were used in the original single-tenant Notion-only setup.
They are archived for reference but are no longer maintained.

**Migration:** See docs/MIGRATION_SINGLE_TO_MULTI_TENANT.md

**Created:** 2025-11-01
**Archived:** 2025-11-12
**Reason:** Migrated to multi-tenant architecture
EOF

# Update .gitignore to include archives
echo "# Archived files (keep for history)" >> .gitignore
echo "archive/" >> .gitignore
```

---

## Vault Policy Generalization

### Current: Notion-Specific Policy

**File:** `vault/policies/notion-oauth-policy.hcl`

```hcl
# Notion-specific policy (DEPRECATED)
path "secret/data/*/notion" {
  capabilities = ["create", "read", "update"]
}

path "transit/encrypt/notion-*" {
  capabilities = ["update"]
}
```

### Recommended: Generic Tenant Policy

**New File:** `vault/policies/tenant-integration-policy.hcl`

```hcl
# Generic tenant integration policy
# Supports: notion, github, slack, jira, etc.

# Allow access to all integrations for a tenant
path "secret/data/${tenant_id}/*" {
  capabilities = ["create", "read", "update", "delete"]
}

# Allow encryption/decryption with tenant key
path "transit/encrypt/${tenant_id}" {
  capabilities = ["update"]
}

path "transit/decrypt/${tenant_id}" {
  capabilities = ["update"]
}

# Allow key creation for tenant
path "transit/keys/${tenant_id}" {
  capabilities = ["create", "read", "update"]
}

# Allow listing tenant integrations
path "secret/metadata/${tenant_id}/*" {
  capabilities = ["list"]
}
```

**Migration:**
```bash
# Create new generic policy
vault policy write tenant-integration vault/policies/tenant-integration-policy.hcl

# Update tokens to use new policy
vault token create -policy=tenant-integration

# Deprecate old policy
mv vault/policies/notion-oauth-policy.hcl vault/policies/notion-oauth-policy.hcl.deprecated
```

---

## Environment Variable Cleanup

### Deprecated Environment Variables

Remove these from `.env.example` in v2.0.0:

```bash
# DEPRECATED: These were Notion-specific
# NOTION_VAULT_PATH=secret/tenants/test-tenant-001/notion
# NOTION_ENCRYPTION_KEY=notion-test-tenant-001

# Replace with generic multi-tenant config:
TENANT_CONFIG_PATH=config/tenants.json
ENABLE_TENANT_CONFIG_FILE=true
```

### Recommended Environment Variables

```bash
# Vault Configuration
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
VAULT_TRANSIT_ENGINE=transit
VAULT_KV_ENGINE=secret

# Multi-Tenant Configuration
ENABLE_TENANT_CONFIG_FILE=true
TENANT_CONFIG_PATH=config/tenants.json

# OAuth Providers (keep for OAuth flow initiation)
NOTION_CLIENT_ID=your_client_id
NOTION_CLIENT_SECRET=your_client_secret
NOTION_REDIRECT_URI=http://localhost:3000/oauth/callback/notion

GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/oauth/callback/github

# Integration Endpoints
NOTION_SERVER_URL=http://localhost:3100
GITHUB_SERVER_URL=http://localhost:3200
```

---

## Test File Updates

### Tests Needing Updates

| Test File | Status | Action Required |
|-----------|--------|-----------------|
| `gateway/tests/e2e/notion-oauth-flow.test.ts` | ✅ **OK** | Keep for Notion-specific flow testing |
| `gateway/tests/integration/notion-integration.test.ts` | ✅ **OK** | Keep, but add multi-tenant test cases |
| `gateway/tests/integration/oauth-flow.integration.test.ts` | ⚠️ **UPDATE** | Add multi-tenant scenarios |

### New Tests to Create

```typescript
// gateway/tests/e2e/multi-tenant-oauth.test.ts
describe('Multi-Tenant OAuth Flow', () => {
  it('should handle OAuth for multiple tenants simultaneously', async () => {
    // Test tenant-001 Notion OAuth
    // Test tenant-002 GitHub OAuth
    // Verify credential isolation
  });

  it('should prevent cross-tenant credential access', async () => {
    // Tenant-001 tries to access tenant-002 credentials
    // Should fail with proper error
  });
});

// gateway/tests/integration/tenant-management.test.ts
describe('Tenant Management API', () => {
  it('should create new tenant with encryption key', async () => {});
  it('should list all tenant integrations', async () => {});
  it('should delete tenant and all credentials', async () => {});
});
```

---

## Documentation Cleanup

### Files to Archive

Move to `docs/archive/`:
- `docs/notion-integration-guide.md` (replaced by MULTI_TENANT_SETUP.md)
- `docs/oauth-quick-start.md` (merged into API_TENANT_OAUTH.md)

### Files to Update

Add deprecation notices:

**docs/integrations/NOTION_SETUP.md:**
```markdown
> **⚠️ DEPRECATION NOTICE**
>
> This guide describes the legacy single-tenant Notion setup.
> For new installations, use the [Multi-Tenant Setup Guide](../MULTI_TENANT_SETUP.md).
>
> For migration from this setup, see [Migration Guide](../MIGRATION_SINGLE_TO_MULTI_TENANT.md).
```

**README.md:**
```markdown
### Integration Guides

- [**Multi-Tenant Setup**](docs/MULTI_TENANT_SETUP.md) - **Recommended** for all new installations
- [Notion Setup (Legacy)](docs/integrations/NOTION_SETUP.md) - Single-tenant setup (deprecated)
```

---

## Cleanup Script

Create automated cleanup script:

```bash
#!/bin/bash
# scripts/cleanup-deprecated-files.sh

set -euo pipefail

echo "=== Connectors Platform - Deprecated File Cleanup ==="
echo ""
echo "This script moves deprecated files to archive/ directory."
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cleanup cancelled"
  exit 0
fi

# Create archive structure
mkdir -p archive/single-tenant-setup/{scripts,configs,policies,docs}

# Move deprecated scripts
echo "Moving deprecated scripts..."
mv vault/scripts/init-notion-oauth.sh archive/single-tenant-setup/scripts/ 2>/dev/null || true
mv scripts/validate-notion-integration.sh archive/single-tenant-setup/scripts/ 2>/dev/null || true

# Move deprecated configs
echo "Moving deprecated configs..."
mv vault/configs/notion-oauth-config.json archive/single-tenant-setup/configs/ 2>/dev/null || true

# Move deprecated policies
echo "Moving deprecated policies..."
mv vault/policies/notion-oauth-policy.hcl archive/single-tenant-setup/policies/ 2>/dev/null || true

# Move deprecated docs
echo "Moving deprecated documentation..."
mv docs/notion-integration-guide.md archive/single-tenant-setup/docs/ 2>/dev/null || true
mv docs/oauth-quick-start.md archive/single-tenant-setup/docs/ 2>/dev/null || true

# Create archive README
cat > archive/single-tenant-setup/README.md <<'EOF'
# Archived: Single-Tenant Setup Files

**Status:** Deprecated
**Archived:** $(date -u +%Y-%m-%d)
**Reason:** Migrated to multi-tenant architecture

## Contents

- `scripts/` - Single-tenant initialization scripts
- `configs/` - Notion-specific OAuth configuration
- `policies/` - Notion-specific Vault policies
- `docs/` - Legacy documentation

## Migration

See: [Migration Guide](../../docs/MIGRATION_SINGLE_TO_MULTI_TENANT.md)

## Files

### Scripts
- `init-notion-oauth.sh` - Notion OAuth initialization (replaced by init-tenant-oauth.sh)
- `validate-notion-integration.sh` - Notion validation (replaced by validate-tenant-oauth.sh)

### Configs
- `notion-oauth-config.json` - Notion config (replaced by gateway/config/tenants.json)

### Policies
- `notion-oauth-policy.hcl` - Notion Vault policy (replaced by tenant-integration-policy.hcl)

### Documentation
- `notion-integration-guide.md` - Single-tenant guide (replaced by MULTI_TENANT_SETUP.md)
- `oauth-quick-start.md` - Quick start (merged into API_TENANT_OAUTH.md)
EOF

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Archived files:"
ls -la archive/single-tenant-setup/
echo ""
echo "To restore files: cp archive/single-tenant-setup/[type]/[file] [original-location]"
```

Make executable:
```bash
chmod +x scripts/cleanup-deprecated-files.sh
```

---

## Git Commit Plan

### Recommended Git Workflow

```bash
# 1. Add deprecation notices (non-breaking)
git add vault/configs/DEPRECATED.md
git add docs/CODE_CLEANUP_DEPRECATIONS.md
git commit -m "docs: add deprecation notices for single-tenant files"

# 2. Add new multi-tenant files
git add gateway/config/tenants.*.json
git add vault/scripts/init-tenant-oauth.sh
git add vault/scripts/validate-tenant-oauth.sh
git add vault/policies/tenant-integration-policy.hcl
git commit -m "feat: add multi-tenant configuration and scripts"

# 3. Add documentation
git add docs/MULTI_TENANT_SETUP.md
git add docs/API_TENANT_OAUTH.md
git add docs/MIGRATION_SINGLE_TO_MULTI_TENANT.md
git commit -m "docs: add comprehensive multi-tenant documentation"

# 4. Update existing documentation
git add README.md
git add docs/integrations/NOTION_SETUP.md
git commit -m "docs: update references to multi-tenant setup"

# 5. Archive deprecated files (v1.1.0)
git add archive/
git add .gitignore
git commit -m "chore: archive deprecated single-tenant files"

# 6. Remove deprecated files (v2.0.0 - breaking change)
git rm vault/scripts/init-notion-oauth.sh
git rm vault/configs/notion-oauth-config.json
git rm vault/policies/notion-oauth-policy.hcl
git rm scripts/validate-notion-integration.sh
git commit -m "chore!: remove deprecated single-tenant files

BREAKING CHANGE: Removed single-tenant Notion setup files.
Migrate to multi-tenant setup. See docs/MIGRATION_SINGLE_TO_MULTI_TENANT.md"
```

---

## Timeline

### Phase 1: Documentation (Current)
- ✅ Create deprecation notices
- ✅ Add multi-tenant documentation
- ✅ Update README references

### Phase 2: Transition (v1.1.0)
- Move deprecated files to archive/
- Update tests
- Add migration guide
- **Estimated:** 1-2 weeks

### Phase 3: Cleanup (v2.0.0)
- Remove deprecated files entirely
- Remove backward compatibility code
- Update CI/CD pipelines
- **Estimated:** 1-2 months

---

## Checklist

**Documentation:**
- [x] Create MULTI_TENANT_SETUP.md
- [x] Create API_TENANT_OAUTH.md
- [x] Create MIGRATION_SINGLE_TO_MULTI_TENANT.md
- [x] Create CODE_CLEANUP_DEPRECATIONS.md
- [ ] Add deprecation notices to existing docs
- [ ] Update README with multi-tenant references

**Code:**
- [x] Create generic tenant configuration schema
- [x] Create tenant config example files
- [ ] Create generic Vault policy
- [ ] Create cleanup script
- [ ] Archive deprecated files

**Testing:**
- [ ] Add multi-tenant test scenarios
- [ ] Test migration path
- [ ] Verify backward compatibility
- [ ] Performance test with multiple tenants

**Deployment:**
- [ ] Update CI/CD for multi-tenant
- [ ] Update production deployment docs
- [ ] Create rollback plan
- [ ] Schedule cleanup for v2.0.0

---

## Support

For questions about deprecations or migration:
1. See [Migration Guide](MIGRATION_SINGLE_TO_MULTI_TENANT.md)
2. Check [Multi-Tenant Setup](MULTI_TENANT_SETUP.md)
3. Review [API Documentation](API_TENANT_OAUTH.md)
4. Open GitHub issue if needed
