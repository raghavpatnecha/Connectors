# Security Setup Guide

**Version:** 1.0  
**Last Updated:** 2025-11-21  
**Status:** Required for all deployments

---

## 🔒 Overview

This guide covers the security setup process for the Connectors Platform. **All security fixes implemented as of 2025-11-21 must be configured before deployment.**

---

## ⚠️ Critical Security Fixes Applied

### Phase 1: Critical & High Priority (COMPLETED)

1. ✅ **Command Injection Fix** - Prevents RCE via malicious filenames
2. ✅ **OAuth Token Type Injection Fix** - Prevents auth bypass attacks  
3. ✅ **Rate Limiter Bypass Fix** - Prevents DDoS via tenantId omission
4. ✅ **Hardcoded Credentials Removal** - Uses environment variables

---

## 🚀 Initial Setup

### Step 1: Create Environment File

```bash
# Navigate to project root
cd /path/to/Connectors

# Copy environment template
cp .env.example .env
```

### Step 2: Generate Secure Credentials

**IMPORTANT:** Never use the example values in production!

```bash
# Generate Vault root token (32 characters)
echo "VAULT_DEV_ROOT_TOKEN_ID=$(openssl rand -hex 16)" >> .env

# Generate Neo4j password (24+ characters)
echo "NEO4J_PASSWORD=$(openssl rand -base64 24)" >> .env
```

### Step 3: Configure Optional Services

Edit `.env` and add any required OAuth credentials:

```bash
# GitHub Integration (if needed)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Google Workspace Integrations (if needed)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 4: Verify Security

```bash
# Ensure .env is not tracked by git
git status | grep -q ".env" && echo "WARNING: .env is tracked!" || echo "✓ .env is ignored"

# Verify environment variables are set
docker-compose config | grep -E "(VAULT_DEV_ROOT_TOKEN_ID|NEO4J_PASSWORD)" | grep -q "your-secure" && echo "✗ Using example credentials!" || echo "✓ Custom credentials configured"
```

---

## 🔐 Security Enhancements

### 1. Command Injection Prevention

**Location:** `gateway/src/config/tenant-oauth-parser.ts`

**What Changed:**
- Replaced `execSync` with `spawnSync`
- Disabled shell execution
- Uses array arguments instead of string interpolation

**Impact:**
- Prevents RCE via malicious YAML filenames
- Shell metacharacters no longer executed

**Testing:**
```bash
# These should fail safely (not execute commands)
node -e "const parser = require('./dist/config/tenant-oauth-parser'); parser.parse('$(whoami).yaml')"
```

### 2. OAuth Token Type Validation

**Location:** `gateway/src/auth/oauth-proxy.ts`

**What Changed:**
- Added whitelist of valid token types: `Bearer`, `MAC`
- Validates and normalizes token types before injection
- Rejects invalid types with error logging

**Impact:**
- Prevents injection of malicious auth schemes (e.g., `Basic admin:password`)
- Defaults to `Bearer` if not specified

**Testing:**
```bash
# Test with valid token type
curl -H "Authorization: Bearer test" http://localhost:3000/api/tools

# Test with invalid token type (should be rejected)
curl -H "Authorization: Malicious-Type test" http://localhost:3000/api/tools
```

### 3. Rate Limiter Hardening

**Location:** `gateway/src/middleware/rate-limiter.ts`

**What Changed:**
- Anonymous requests (no tenantId) now rate-limited by IP
- Lower limits for anonymous requests (10 req/min vs 100 req/min)
- Prevents bypass through tenantId omission

**Impact:**
- DDoS protection even for requests without tenant IDs
- IP-based fallback rate limiting

**Configuration:**
```bash
# In .env file
RATE_LIMIT_TENANT_RPS=100       # Authenticated requests
RATE_LIMIT_ANONYMOUS_RPS=10     # Anonymous requests
RATE_LIMIT_GLOBAL_RPS=1000      # Global per-IP limit
```

### 4. Environment Variable Security

**Location:** `docker-compose.yml`, `.env.example`

**What Changed:**
- All hardcoded credentials removed from docker-compose.yml
- Uses environment variable substitution
- Template file (`.env.example`) provided
- `.gitignore` updated to exclude `.env` files

**Impact:**
- Credentials never committed to version control
- Each deployment uses unique credentials
- Development and production can have different credentials

**Best Practices:**
- ✅ Use different credentials for dev/staging/prod
- ✅ Rotate credentials regularly (every 90 days)
- ✅ Use secret management tools in production (Vault, AWS Secrets Manager)
- ❌ Never commit `.env` files
- ❌ Never share credentials via email/chat

---

## 🧪 Validation & Testing

### Security Checklist

Before deploying, verify all security measures:

- [ ] `.env` file created with secure credentials
- [ ] `.env` file NOT tracked in git (`git status` shows ignored)
- [ ] Vault token is 32+ characters (not example value)
- [ ] Neo4j password is 24+ characters (not example value)
- [ ] Docker compose starts successfully with new credentials
- [ ] Rate limiting works for requests without tenantId
- [ ] OAuth token type validation tested
- [ ] Command injection tests pass

### Testing Commands

```bash
# 1. Verify services start
docker-compose up -d
docker-compose ps  # All should show "healthy"

# 2. Test rate limiting
for i in {1..15}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/tools
done
# Should see 429 (rate limit exceeded) after 10 requests

# 3. Test Vault connection
docker-compose exec gateway wget -qO- http://vault:8200/v1/sys/health
# Should return 200 OK

# 4. Test Neo4j connection  
docker-compose exec gateway wget -qO- http://neo4j:7474
# Should return HTTP 200
```

---

## 🔄 Credential Rotation

### When to Rotate

- Every 90 days (scheduled)
- After suspected compromise
- When team member with access leaves
- After security incident

### Rotation Process

1. **Generate New Credentials:**
   ```bash
   # New Vault token
   NEW_VAULT_TOKEN=$(openssl rand -hex 16)
   
   # New Neo4j password
   NEW_NEO4J_PASSWORD=$(openssl rand -base64 24)
   ```

2. **Update Environment:**
   ```bash
   # Update .env file
   sed -i "s/VAULT_DEV_ROOT_TOKEN_ID=.*/VAULT_DEV_ROOT_TOKEN_ID=$NEW_VAULT_TOKEN/" .env
   sed -i "s/NEO4J_PASSWORD=.*/NEO4J_PASSWORD=$NEW_NEO4J_PASSWORD/" .env
   ```

3. **Restart Services:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

4. **Verify:**
   ```bash
   docker-compose ps  # All should be healthy
   docker-compose logs gateway | grep -i "error"  # Should be empty
   ```

---

## 📊 Security Monitoring

### Recommended Monitoring

1. **Rate Limit Events:**
   - Monitor for excessive 429 responses
   - Alert on sustained high rates from single IP
   
2. **Authentication Failures:**
   - Track invalid token type attempts
   - Alert on repeated OAuth errors

3. **Service Health:**
   - Monitor Vault availability
   - Track Neo4j connection errors

### Log Locations

```bash
# Gateway logs
docker-compose logs -f gateway

# Vault logs
docker-compose logs -f vault

# Neo4j logs
docker-compose logs -f neo4j
```

---

## 🚨 Incident Response

### If Credentials Are Compromised:

1. **Immediate Actions:**
   ```bash
   # Stop all services
   docker-compose down
   
   # Rotate all credentials immediately
   ./scripts/rotate-credentials.sh  # (Create this script)
   
   # Clear any cached credentials
   docker-compose down -v  # Remove volumes
   ```

2. **Investigation:**
   - Review access logs
   - Identify compromised systems
   - Determine scope of access

3. **Recovery:**
   - Restore from backup if needed
   - Deploy with new credentials
   - Audit all access

---

## 📚 Additional Resources

- [Security Audit Report](./.claude/docs/security-fixes-implementation-plan.md)
- [Environment Variables Reference](./.env.example)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Vault Security Model](https://developer.hashicorp.com/vault/docs/internals/security)

---

## ✅ Production Deployment Checklist

Before deploying to production:

- [ ] All critical security fixes applied
- [ ] Unique production credentials generated
- [ ] `.env` file created and secured (chmod 600)
- [ ] `.env` excluded from version control
- [ ] Rate limiting configured appropriately
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Team trained on security procedures
- [ ] Security audit completed
- [ ] Penetration testing performed
- [ ] Backup and recovery tested

---

**Last Updated:** 2025-11-21  
**Next Security Review:** 2026-02-21 (90 days)
