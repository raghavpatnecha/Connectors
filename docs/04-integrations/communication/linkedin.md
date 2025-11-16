# LinkedIn Integration

**Status:** ✅ Complete | **Category:** Communication | **OAuth:** Required | **Architecture:** Browser Automation

---

## Overview

LinkedIn Unified MCP Server provides AI agent access to LinkedIn through a hybrid approach combining official API (3 endpoints) and browser automation (Playwright) for full feature coverage.

**⚠️ Critical Reality:** LinkedIn's public API is extremely limited. Only 3 endpoints work without LinkedIn Partnership approval. Most features require browser automation (web scraping).

### What Works

| Feature | Method | Status |
|---------|--------|--------|
| Get My Profile (lite) | OAuth API | ✅ Working |
| Get My Email | OAuth API | ✅ Working |
| Share Post | OAuth API | ✅ Working |
| Search People | Browser Automation | ✅ Working |
| View Profiles | Browser Automation | ✅ Working |
| Browse Feed | Browser Automation | ✅ Working |
| Like/Comment | Browser Automation | ✅ Working |
| Company Info | Browser Automation | ✅ Working |
| Apply to Jobs | Browser Automation | ✅ Working |

**Note:** Browser automation may violate LinkedIn's Terms of Service. Use only for personal/educational purposes.

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Chromium/Chrome (for Playwright)
- LinkedIn account

### 1. Create LinkedIn OAuth App (Optional - for 3 API endpoints)

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create new app
3. Add redirect URI: `http://localhost:3001/oauth/callback`
4. Request scopes: `r_liteprofile`, `r_emailaddress`, `w_member_social`
5. Copy Client ID and Client Secret

### 2. Configure Environment

```bash
# LinkedIn OAuth (limited - only 3 API endpoints)
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3001/oauth/callback

# HashiCorp Vault
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-root-token

# Playwright (for browser automation)
HEADLESS=true  # Set to false to see browser
```

### 3. Install & Build

```bash
cd integrations/communication/linkedin-unified
npm install
npx playwright install chromium
npm run build
npm start
```

Server starts on http://localhost:3001

---

## Available Tools (13)

### OAuth API Tools (3)
- `get-my-profile` - Get YOUR lite profile (limited fields)
- `get-my-email` - Get YOUR email address
- `share-post` - Share post to YOUR feed

### Browser Automation Tools (10)
- `search-people` - Search LinkedIn profiles by keywords/location
- `get-profile-basic` - View another user's profile
- `get-profile-comprehensive` - Detailed profile with experience/education
- `browse-feed` - Browse LinkedIn feed
- `like-post` - Like a post
- `comment-on-post` - Comment on a post
- `create-post` - Create new post
- `get-company-profile` - View company information
- `follow-company` - Follow/unfollow company
- `apply-to-job` - Apply to job posting

---

## Configuration Details

### Authentication Flow

**Browser Automation (Primary - 95% of features):**
```
OAuth 2.0 → Access Token → Generate Cookies → Encrypt & Store in Vault
```

1. User completes OAuth flow
2. Server generates `li_at` and `JSESSIONID` cookies from OAuth token
3. Cookies encrypted with AES-256
4. Stored in `.sessions/{tenantId}.enc`
5. Auto-refreshed on expiry

**Zero Manual Cookie Extraction:** No need to manually extract cookies from DevTools!

### Multi-Tenant Architecture

```
Tenant A                    Tenant B
   ↓                           ↓
OAuth Credentials         OAuth Credentials
   ↓                           ↓
Vault Transit Key A       Vault Transit Key B
   ↓                           ↓
Encrypted Storage         Encrypted Storage
```

Each tenant has:
- Unique encryption key in Vault Transit engine
- Isolated credentials (no cross-tenant access)
- Automatic credential rotation

### Session Persistence

- Cookies encrypted and saved to disk
- Reused across server restarts
- Auto-regenerated if expired
- Reduces authentication requests

---

## Known Limitations

### API Limitations
1. **Only 3 working endpoints** without LinkedIn Partnership
2. No public API for: search, messaging, connections, jobs
3. Partnership program extremely difficult to get approved

### Browser Automation Risks
1. **Violates LinkedIn ToS** - web scraping prohibited
2. **Account suspension risk** - automated access may trigger bans
3. **Rate limiting** - LinkedIn throttles suspicious activity
4. **CAPTCHAs** - may appear during automation
5. **UI changes** - automation breaks if LinkedIn updates HTML

### Recommended Usage
- ✅ Personal/educational use only
- ✅ Test accounts (not primary LinkedIn account)
- ✅ Low-volume operations
- ❌ Commercial applications
- ❌ High-volume data collection
- ❌ Automated marketing

---

## Architecture Notes

### Dual-Mode Client

```
User Request
   ↓
UnifiedClient
   ↓
   ├─→ API Client (OAuth - 3 endpoints)
   │   • getMyProfile (lite)
   │   • getMyEmail
   │   • sharePost
   │
   └─→ Browser Client (Playwright - everything else)
       • Search, profiles, feed, jobs, companies
```

**Smart Routing:**
- Try API first (faster, more reliable)
- Fall back to browser automation if API unavailable
- Return error if both fail

### Error Handling

**Rate Limiting:**
```typescript
if (error.status === 429) {
  const resetTime = error.headers['x-ratelimit-reset'];
  throw new RateLimitError(`Rate limit exceeded. Resets at ${resetTime}`);
}
```

**Authentication:**
```typescript
if (error.status === 401 || error.status === 403) {
  throw new OAuthError('LinkedIn authentication failed - token may be expired');
}
```

---

## Project Statistics

| Metric | Value |
|--------|-------|
| Production Code | 6,026 lines |
| Test Code | 2,189 lines (148 tests) |
| Documentation | 8 files |
| Test Coverage | 89.47% |
| TypeScript Errors | 0 |

---

## Security

- OAuth 2.0 tokens encrypted at rest (Vault)
- Per-tenant encryption keys (Transit engine)
- Cookies encrypted with AES-256
- Automatic key rotation
- Audit logging enabled
- No credential logging

---

## Support

- **Architecture:** See `/integrations/communication/linkedin-unified/ARCHITECTURE.md`
- **API Reality:** See `CRITICAL_ISSUE_API_REALITY.md`
- **Implementation Status:** See `IMPLEMENTATION_STATUS.md`
- **LinkedIn API Docs:** [LinkedIn Developer Documentation](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api)

---

## Legal Disclaimer

**This software is provided for educational purposes only.**

- Using web scraping violates LinkedIn's Terms of Service
- Automated access may result in account suspension
- No warranty or guarantee of functionality
- Use at your own risk
- Authors not responsible for ToS violations
- Not affiliated with LinkedIn Corporation

**Recommended:** Only use with test accounts, not your primary LinkedIn account.
