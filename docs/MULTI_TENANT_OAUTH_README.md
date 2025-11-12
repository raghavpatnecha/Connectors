# Multi-Tenant OAuth Architecture - Documentation Index

**Created:** 2025-11-12
**Status:** Design Complete, Ready for Implementation

---

## Overview

This directory contains the complete design and implementation plan for the multi-tenant OAuth architecture for the Connectors Platform. The design enables multiple tenants (Alice, Bob, Carol, etc.) to create their own OAuth applications for integrations (Notion, GitHub, Slack, etc.) and provides two approaches for credential management: API (production) and config file (dev/testing).

---

## Documentation Files

### 1. Architecture Document (START HERE)

**File:** `MULTI_TENANT_OAUTH_ARCHITECTURE.md`

**Size:** 1,199 lines (~43 KB)

**Contents:**
- 📋 Executive summary and objectives
- 🏗️ Complete architecture overview with system diagrams
- 💾 Data model and storage structure
- 🗃️ Vault storage paths and policies
- 🔌 REST API endpoint specifications
- 📄 Config file schema (with JSON Schema)
- 🔄 Flow diagrams (OAuth registration, authorization flow, token refresh)
- 🔒 Security model and threat analysis
- 📈 Migration strategy

**Read this first to understand:**
- How the system works end-to-end
- Storage architecture in Vault
- API vs. config file approaches
- Security considerations

---

### 2. Type Definitions

**File:** `MULTI_TENANT_OAUTH_TYPES.ts`

**Size:** 634 lines

**Contents:**
- TypeScript interfaces for all new types
- OAuth app configuration types
- Config file schema types
- API request/response types
- Manager interface types
- Validation types
- Error types
- Type guards

**Use this to:**
- Understand the data structures
- Copy types into `gateway/src/auth/types.ts`
- Implement TypeScript interfaces

---

### 3. Refactoring Plan

**File:** `OAUTH_REFACTORING_PLAN.md`

**Size:** 1,440 lines (~36 KB)

**Contents:**
- 🔍 Current state analysis (all files)
- 🔁 Code duplication audit
- 🏷️ Notion-specific code identification
- 📝 File-by-file change specifications
- 🗓️ 5-phase implementation plan (4 weeks, 104 hours)
- 🧪 Testing strategy (unit, integration, e2e)
- ↩️ Rollback procedures
- ⚠️ Risk assessment

**Use this to:**
- Understand what needs to change
- Plan implementation sprints
- Assign tasks to developers
- Track progress

---

### 4. Implementation Summary

**File:** `MULTI_TENANT_OAUTH_SUMMARY.md`

**Size:** 651 lines (~18 KB)

**Contents:**
- 📊 Quick overview of all deliverables
- ✅ Current implementation status
- 📂 Key files to modify
- 🔄 Code duplication analysis
- 🎯 Notion-specific code to generalize
- 🔌 API design summary
- 📄 Config file design summary
- 🛤️ Migration path
- 🧪 Testing strategy summary
- ✅ Success metrics

**Use this to:**
- Get a high-level overview quickly
- Understand what's implemented vs. what's needed
- See the migration path at a glance

---

## Quick Start Guide

### For Architects/Tech Leads

**Read in this order:**
1. `MULTI_TENANT_OAUTH_SUMMARY.md` - Get the big picture (15 min)
2. `MULTI_TENANT_OAUTH_ARCHITECTURE.md` - Understand the design (45 min)
3. `OAUTH_REFACTORING_PLAN.md` - Review implementation plan (30 min)

**Total time:** ~90 minutes

### For Developers

**Read in this order:**
1. `MULTI_TENANT_OAUTH_SUMMARY.md` - Understand the goal (15 min)
2. `MULTI_TENANT_OAUTH_TYPES.ts` - Review types (10 min)
3. `OAUTH_REFACTORING_PLAN.md` - Find your phase (20 min)
4. `MULTI_TENANT_OAUTH_ARCHITECTURE.md` - Deep dive on your component (30 min)

**Total time:** ~75 minutes

### For Product Managers

**Read in this order:**
1. `MULTI_TENANT_OAUTH_SUMMARY.md` - Understand features and timeline (15 min)
2. `MULTI_TENANT_OAUTH_ARCHITECTURE.md` - Review use cases and flows (20 min)

**Total time:** ~35 minutes

---

## Implementation Phases

### Phase 1: Foundation (Week 1) - 20 hours

**Goal:** Add OAuth app storage to Vault (no breaking changes)

**Tasks:**
- Update `types.ts` with new interfaces
- Extend `VaultClient` with OAuth app methods
- Create `OAuthConfigManager` class
- Update `oauth-policy.hcl`
- Write unit tests

**Deliverables:**
- OAuth apps can be stored in Vault
- Config file support working
- All tests passing

---

### Phase 2: API Layer (Week 2) - 24 hours

**Goal:** REST API for OAuth app management

**Tasks:**
- Create `OAuthAppsController`
- Add API routes
- Implement authentication middleware
- Write integration tests
- API documentation

**Deliverables:**
- Functional REST API
- API tests passing
- Documentation complete

---

### Phase 3: Refactor OAuthProxy (Week 3) - 16 hours

**Goal:** Use `OAuthConfigManager` instead of in-memory configs

**Tasks:**
- Update `OAuthProxy` to use `OAuthConfigManager`
- Add migration helper
- Update initialization code
- Update existing tests
- End-to-end testing

**Deliverables:**
- OAuthProxy refactored
- All tests passing
- No regressions

---

### Phase 4: Generalize Scripts (Week 3-4) - 20 hours

**Goal:** Generic init script and multi-tenant config examples

**Tasks:**
- Create `init-oauth.sh` (generic)
- Create `oauth-apps.example.json`
- Update Notion integration to use new flow
- Add deprecation warnings
- Update documentation

**Deliverables:**
- Generic scripts working
- Notion migration complete
- Documentation updated

---

### Phase 5: Testing & Rollout (Week 4) - 24 hours

**Goal:** Production deployment

**Tasks:**
- End-to-end testing
- Performance testing
- Security audit
- Staging deployment
- Production rollout

**Deliverables:**
- Production-ready system
- All tests passing
- Monitoring in place

---

## Key Design Decisions

### 1. Dual Approach (API + Config File)

**Decision:** Support both API-based (production) and config file (dev/testing) credential management

**Rationale:**
- API: Secure, scalable, production-ready
- Config file: Fast local dev, no API calls needed
- Unified via `OAuthConfigManager` abstraction

### 2. Vault Storage Structure

**Decision:** Store OAuth apps at `secret/data/oauth-apps/{tenantId}/{integration}`

**Rationale:**
- Clear separation from user credentials
- Per-tenant isolation
- Easy to list all apps for a tenant
- Consistent with existing pattern

### 3. Per-Tenant Encryption Keys

**Decision:** Use single encryption key per tenant (not per integration)

**Rationale:**
- Simpler key management
- Fewer Vault operations
- Consistent with current VaultClient design
- Adequate security (tenant isolation)

### 4. No Breaking Changes in Phase 1-2

**Decision:** Keep existing code working until Phase 3

**Rationale:**
- Gradual migration reduces risk
- Can test new code alongside old
- Easy rollback if issues arise
- Existing Notion integration continues working

### 5. Generic Over Specific

**Decision:** Create generic scripts/configs instead of per-integration files

**Rationale:**
- Scales to 500+ integrations
- No code duplication
- Easier maintenance
- Integration templates in config file

---

## Current vs. Target State

### Current State (Notion-Specific)

```
┌─────────────────────────────────────┐
│         OAuthProxy                  │
│  _oauthConfigs: Map<string, Config> │ (In-memory)
│                                     │
│  registerOAuthConfig(notion, {...}) │ (Programmatic)
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│           VaultClient               │
│  User tokens only:                  │
│  secret/data/{tenant}/{integration} │
└─────────────────────────────────────┘

Init Script: init-notion-oauth.sh (Notion only)
Config File: notion-oauth-config.json (Notion only)
```

### Target State (Multi-Tenant)

```
┌─────────────────────────────────────┐
│    OAuthConfigManager               │
│  - API approach (Vault)             │
│  - Config file approach             │
│  - Unified interface                │
│  - Caching                          │
└─────────────────────────────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│   Vault     │   │ Config File │
│             │   │             │
│ OAuth Apps  │   │ oauth-apps. │
│ secret/     │   │ json        │
│ oauth-apps/ │   │             │
│ {tenant}/   │   │ All tenants │
│ {integration}│   │ All integrations
└─────────────┘   └─────────────┘

Init Script: init-oauth.sh (Generic, accepts integration)
Config File: oauth-apps.json (Multi-tenant, all integrations)
API: /api/v1/oauth-apps (Full CRUD)
```

---

## Files Created

### Documentation

- ✅ `MULTI_TENANT_OAUTH_ARCHITECTURE.md` (1,199 lines)
- ✅ `MULTI_TENANT_OAUTH_TYPES.ts` (634 lines)
- ✅ `OAUTH_REFACTORING_PLAN.md` (1,440 lines)
- ✅ `MULTI_TENANT_OAUTH_SUMMARY.md` (651 lines)
- ✅ `MULTI_TENANT_OAUTH_README.md` (this file)

**Total:** 3,924+ lines of comprehensive documentation

---

## Files to Create (Implementation)

### Phase 1

- `gateway/src/auth/oauth-config-manager.ts` (new)
- Update: `gateway/src/auth/types.ts`
- Update: `gateway/src/auth/vault-client.ts`
- Update: `gateway/src/errors/oauth-errors.ts`
- Update: `vault/policies/oauth-policy.hcl`

### Phase 2

- `gateway/src/api/oauth-apps-controller.ts` (new)
- `gateway/src/middleware/auth.ts` (new)
- Update: `gateway/src/api/routes.ts`

### Phase 3

- Update: `gateway/src/auth/oauth-proxy.ts`

### Phase 4

- `vault/scripts/init-oauth.sh` (new)
- `gateway/config/oauth-apps.example.json` (new)
- `gateway/config/integration-defaults.json` (new)

### Phase 5

- `docs/MULTI_TENANT_OAUTH_GUIDE.md` (user guide)
- `docs/OAUTH_API_REFERENCE.md` (API docs)

---

## Success Criteria

### Functional

- ✅ Multiple tenants can register OAuth apps
- ✅ API registration works (production)
- ✅ Config file works (dev/testing)
- ✅ Existing Notion integration continues to work
- ✅ Token refresh works with dynamic configs
- ✅ Per-tenant isolation enforced

### Performance

- ✅ OAuth app lookup: <50ms
- ✅ API response time: <200ms
- ✅ Cache hit rate: >90%
- ✅ Token refresh: <500ms

### Quality

- ✅ Code coverage: >85%
- ✅ No code duplication
- ✅ All secrets encrypted
- ✅ Comprehensive documentation
- ✅ All tests passing

---

## Testing Strategy

### Unit Tests (85%+ coverage)

**New test files:**
- `gateway/tests/auth/oauth-config-manager.test.ts`
- `gateway/tests/api/oauth-apps-controller.test.ts`

**Updated test files:**
- `gateway/tests/auth/vault-client.test.ts`
- `gateway/tests/auth/oauth-proxy.test.ts`

### Integration Tests

**New test files:**
- `gateway/tests/integration/multi-tenant-oauth.integration.test.ts`

**Updated test files:**
- `gateway/tests/integration/oauth-flow.integration.test.ts`

### End-to-End Tests

**Scenarios:**
1. Alice registers Notion OAuth app via API
2. Alice completes OAuth flow
3. Alice uses Notion integration
4. Bob registers GitHub OAuth app via config file
5. Bob completes OAuth flow
6. Both tenants' tokens auto-refresh
7. Cross-tenant isolation verified

---

## Security Highlights

### Encryption

- ✅ All OAuth app secrets encrypted with Transit engine
- ✅ All user tokens encrypted with Transit engine
- ✅ Per-tenant encryption keys
- ✅ AES-256-GCM algorithm

### Access Control

- ✅ Per-tenant Vault policies
- ✅ API authentication required
- ✅ Secrets masked in API responses
- ✅ Secrets masked in logs
- ✅ Audit logging enabled

### Threats Mitigated

- ✅ Unauthorized access to OAuth apps
- ✅ Cross-tenant data access
- ✅ Credential leakage via logs
- ✅ Config file secrets in git
- ✅ MITM attacks (state parameter, HTTPS)
- ✅ Token replay attacks

---

## Next Steps

### Immediate (This Week)

1. **Review Documentation**
   - Read `MULTI_TENANT_OAUTH_SUMMARY.md` (15 min)
   - Read `MULTI_TENANT_OAUTH_ARCHITECTURE.md` (45 min)
   - Read `OAUTH_REFACTORING_PLAN.md` (30 min)

2. **Get Stakeholder Approval**
   - Architecture review meeting
   - Approve design decisions
   - Approve 4-week timeline

3. **Set Up Project**
   - Create GitHub issues for each phase
   - Create feature branch
   - Set up CI/CD pipeline

### Week 1: Phase 1

- Begin implementation
- Daily standups
- Code reviews
- Merge to main

### Weeks 2-4: Phases 2-5

- Continue implementation
- Staging deployment (Week 3)
- Production rollout (Week 4)
- Monitor metrics

---

## Contact & Support

For questions or clarifications about this architecture:

1. **Architecture questions:** Review `MULTI_TENANT_OAUTH_ARCHITECTURE.md`
2. **Implementation questions:** Review `OAUTH_REFACTORING_PLAN.md`
3. **Type definitions:** Review `MULTI_TENANT_OAUTH_TYPES.ts`
4. **Quick reference:** Review `MULTI_TENANT_OAUTH_SUMMARY.md`

---

## Changelog

### 2025-11-12 (Initial Release)

- ✅ Created comprehensive architecture document
- ✅ Created detailed refactoring plan
- ✅ Defined TypeScript types
- ✅ Created implementation summary
- ✅ Created this README

**Status:** Design complete, ready for implementation

---

## Appendix: File Sizes

```
MULTI_TENANT_OAUTH_ARCHITECTURE.md  : 1,199 lines (43 KB)
OAUTH_REFACTORING_PLAN.md           : 1,440 lines (36 KB)
MULTI_TENANT_OAUTH_TYPES.ts         :   634 lines
MULTI_TENANT_OAUTH_SUMMARY.md       :   651 lines (18 KB)
MULTI_TENANT_OAUTH_README.md        :   This file

Total documentation                 : 3,924+ lines
```

---

**END OF DOCUMENTATION INDEX**
