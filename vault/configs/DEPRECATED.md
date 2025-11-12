# Deprecated Configuration Files

⚠️ **NOTICE:** The files in this directory are deprecated and maintained only for backward compatibility.

## Migration Path

### Old: `notion-oauth-config.json`
**Status:** Deprecated
**Replaced By:** `config/tenants/example-notion.yaml`

**Old location:**
```
vault/configs/notion-oauth-config.json
```

**New location:**
```
config/tenants/example-notion.yaml
```

### How to Migrate

1. **Old approach** (integration-specific scripts):
   ```bash
   ./vault/scripts/init-notion-oauth.sh --tenant-id test-tenant-001
   ```

2. **New approach** (unified multi-tenant):
   ```bash
   # Create tenant config
   cp config/tenants/example-notion.yaml config/tenants/my-tenant.yaml

   # Edit config with your credentials (use environment variables!)

   # Set environment variables
   export NOTION_CLIENT_ID="..."
   export NOTION_CLIENT_SECRET="..."

   # Run unified init script
   ./vault/scripts/init-tenant-oauth.sh \
     --tenant my-tenant-001 \
     --config config/tenants/my-tenant.yaml
   ```

### Benefits of New Approach

1. **Multi-Integration Support:** One config file for Notion, GitHub, Slack, etc.
2. **Environment Variables:** Secure credential management with `${VAR}` syntax
3. **Schema Validation:** JSON Schema validation for all configs
4. **Batch Processing:** Initialize all tenants with `--all` flag
5. **Better Organization:** Configs in `config/tenants/`, not scattered
6. **Type Safety:** TypeScript parser with full type checking
7. **Validation Tools:** Dedicated validation script for health checks

## Deprecated Files

- `vault/configs/notion-oauth-config.json` → Use `config/tenants/example-notion.yaml`
- `vault/scripts/init-notion-oauth.sh` → Use `vault/scripts/init-tenant-oauth.sh`

## New Structure

```
config/
├── schemas/
│   └── tenant-oauth-config.schema.json   # JSON Schema validation
└── tenants/
    ├── example-tenant.yaml               # Multi-integration example
    ├── example-notion.yaml               # Single-integration example
    └── README.md                         # Full documentation

vault/scripts/
├── init-tenant-oauth.sh                  # ✅ New unified script
├── validate-tenant-oauth.sh              # ✅ New validation script
└── init-notion-oauth.sh                  # ⚠️  Deprecated

gateway/src/config/
└── tenant-oauth-parser.ts                # ✅ TypeScript parser
```

## Support

For migration assistance, see:
- **Documentation:** `config/tenants/README.md`
- **Schema:** `config/schemas/tenant-oauth-config.schema.json`
- **Examples:** `config/tenants/example-*.yaml`
