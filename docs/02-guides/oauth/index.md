# OAuth Documentation

Complete guides for OAuth credential management in the Connectors Platform.

---

## Getting Started

### [Setup Guide](./setup.md) ⚡

**Quick start for single-tenant OAuth setup (5 minutes)**

Topics covered:
- Quick start (Vault setup, basic usage)
- Environment configuration
- Single integration setup
- Testing OAuth flow
- API endpoints reference
- Troubleshooting
- Production deployment

**Start here if you:**
- Want to get OAuth working quickly
- Are setting up a development environment
- Need to test a single integration
- Want API endpoint reference

**Estimated time:** 15 minutes

---

### [Multi-Tenant Guide](./multi-tenant.md) 🏢

**Complete multi-tenant OAuth architecture and configuration**

Topics covered:
- Architecture overview with diagrams
- Multi-tenant configuration (API + config file)
- Vault integration (per-tenant encryption)
- Tenant onboarding and management
- Migration from single-tenant
- Security model and best practices
- Advanced features (auto-refresh, monitoring)

**Read this if you:**
- Need to support multiple tenants
- Want to understand the architecture
- Are migrating from single-tenant
- Need production-ready multi-tenancy

**Estimated time:** 30 minutes

---

## Additional Resources

### Complete Documentation

- **[API Reference](../../API_TENANT_OAUTH.md)** - Complete REST API documentation with examples
- **[Architecture Design](../../MULTI_TENANT_OAUTH_ARCHITECTURE.md)** - Detailed architecture specification
- **[Implementation Guide](../../oauth-implementation-guide.md)** - Full implementation details
- **[Setup Guide](../../MULTI_TENANT_SETUP.md)** - Original multi-tenant setup documentation

### Quick Reference

**Common Tasks:**

| Task | Guide | Section |
|------|-------|---------|
| Start Vault | [setup.md](./setup.md) | Quick Start |
| Store credentials | [setup.md](./setup.md) | Single Integration Setup |
| OAuth flow | [setup.md](./setup.md) | Testing OAuth Flow |
| Add tenant | [multi-tenant.md](./multi-tenant.md) | Tenant Onboarding |
| Configure multi-tenant | [multi-tenant.md](./multi-tenant.md) | Multi-Tenant Configuration |
| Security setup | [multi-tenant.md](./multi-tenant.md) | Security Model |

---

## Architecture At a Glance

```
Client Request
     ↓
OAuth Proxy (gets credentials from Vault)
     ↓
Vault (per-tenant encrypted storage)
     ↓
MCP Server (with OAuth header injected)
```

**Key Features:**
- ✅ Per-tenant encryption - Each tenant has unique encryption key
- ✅ Auto-refresh - Tokens refresh 5 minutes before expiry
- ✅ Versioning - KV v2 keeps credential history
- ✅ Audit logging - All access logged
- ✅ Two approaches - API (production) + Config file (dev)

---

## Quick Examples

### Store Credentials

```bash
curl -X POST http://localhost:3000/tenants/tenant-123/integrations/notion/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "secret_abc123...",
    "tokenType": "bearer",
    "expiresIn": 0
  }'
```

### Initiate OAuth Flow

```bash
curl -X POST "http://localhost:3000/oauth/authorize/github?tenant_id=tenant-123"
```

### Check Integration Status

```bash
curl http://localhost:3000/tenants/tenant-123/integrations/notion
```

### List All Integrations

```bash
curl http://localhost:3000/tenants/tenant-123/integrations
```

---

## Support

**Questions?**
1. Check [setup.md](./setup.md) for quick start issues
2. Check [multi-tenant.md](./multi-tenant.md) for architecture questions
3. See [API_TENANT_OAUTH.md](../../API_TENANT_OAUTH.md) for API details
4. See troubleshooting sections in each guide

**Common Issues:**
- Vault connection failed → [setup.md - Troubleshooting](./setup.md#troubleshooting)
- Credentials not found → [setup.md - Troubleshooting](./setup.md#troubleshooting)
- Token refresh failing → [setup.md - Troubleshooting](./setup.md#troubleshooting)
- Multi-tenant setup → [multi-tenant.md - Migration](./multi-tenant.md#migration-from-single-tenant)
