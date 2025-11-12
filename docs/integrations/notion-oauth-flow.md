# Notion OAuth 2.0 Flow Documentation

**Integration:** Notion
**OAuth Version:** 2.0 (Authorization Code Grant)
**Token Expiry:** No expiration (revocable by user)
**Last Updated:** 2025-11-12

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Flow Diagram](#flow-diagram)
3. [Step-by-Step Process](#step-by-step-process)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Scenarios](#error-scenarios)
6. [Token Management](#token-management)
7. [Security Considerations](#security-considerations)

---

## Overview

Notion uses the **OAuth 2.0 Authorization Code** flow to grant third-party applications access to user workspaces. Unlike most OAuth providers, **Notion access tokens do not expire** but can be revoked by users at any time.

**Key Characteristics:**
- ✅ **No token refresh required** (tokens don't expire)
- ✅ **Workspace-level permissions** (user selects workspace during auth)
- ✅ **Granular capabilities** (read, update, insert content)
- ✅ **Bot user created** (integration gets dedicated bot identity)
- ⚠️ **Manual revocation only** (users revoke in Notion settings)

---

## Flow Diagram

### High-Level Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │         │              │         │              │
│   AI Agent   │────────▶│   Gateway    │────────▶│    Notion    │
│   (Claude)   │         │   (Port      │         │     API      │
│              │         │    3000)     │         │              │
└──────────────┘         └──────┬───────┘         └──────────────┘
                                │
                                │ Stores tokens
                                ▼
                         ┌──────────────┐
                         │   Vault      │
                         │  (Port 8200) │
                         │              │
                         └──────────────┘
```

### Detailed OAuth Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐                ┌─────────┐
│  User   │                │ Gateway │                │ Notion  │                │  Vault  │
│ Browser │                │         │                │  OAuth  │                │         │
└────┬────┘                └────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │                          │
     │  1. Request Auth URL     │                          │                          │
     ├─────────────────────────▶│                          │                          │
     │   GET /oauth/authorize   │                          │                          │
     │   ?tenant_id=user123     │                          │                          │
     │                          │                          │                          │
     │                          │  2. Get OAuth Config     │                          │
     │                          ├─────────────────────────────────────────────────────▶│
     │                          │     (client_id, secret)  │                          │
     │                          │                          │                          │
     │                          │◀─────────────────────────────────────────────────────┤
     │                          │     Return credentials   │                          │
     │                          │                          │                          │
     │  3. Authorization URL    │                          │                          │
     │◀─────────────────────────┤                          │                          │
     │  + state token (CSRF)    │                          │                          │
     │                          │                          │                          │
     │  4. Redirect to Notion   │                          │                          │
     ├──────────────────────────────────────────────────────▶                          │
     │  https://api.notion.com/ │                          │                          │
     │  v1/oauth/authorize?...  │                          │                          │
     │                          │                          │                          │
     │                          │  5. User Reviews Permissions                        │
     │                          │     - Select workspace   │                          │
     │                          │     - Review capabilities│                          │
     │◀─────────────────────────────────────────────────────┤                          │
     │   Consent Screen         │                          │                          │
     │                          │                          │                          │
     │  6. User Clicks "Allow"  │                          │                          │
     ├──────────────────────────────────────────────────────▶                          │
     │                          │                          │                          │
     │  7. Redirect to Callback │                          │                          │
     │◀─────────────────────────────────────────────────────┤                          │
     │  /oauth/callback/notion? │                          │                          │
     │  code=AUTH_CODE&         │                          │                          │
     │  state=STATE_TOKEN       │                          │                          │
     │                          │                          │                          │
     │  8. Forward callback     │                          │                          │
     ├─────────────────────────▶│                          │                          │
     │                          │                          │                          │
     │                          │  9. Validate state token │                          │
     │                          │     (CSRF protection)    │                          │
     │                          │                          │                          │
     │                          │ 10. Exchange code for    │                          │
     │                          │     access token         │                          │
     │                          ├─────────────────────────▶│                          │
     │                          │  POST /v1/oauth/token    │                          │
     │                          │  {                       │                          │
     │                          │    grant_type: "...",    │                          │
     │                          │    code: "AUTH_CODE",    │                          │
     │                          │    redirect_uri: "..."   │                          │
     │                          │  }                       │                          │
     │                          │                          │                          │
     │                          │ 11. Return access token  │                          │
     │                          │◀─────────────────────────┤                          │
     │                          │  {                       │                          │
     │                          │    access_token: "...",  │                          │
     │                          │    workspace_id: "...",  │                          │
     │                          │    bot_id: "..."         │                          │
     │                          │  }                       │                          │
     │                          │                          │                          │
     │                          │ 12. Store token in Vault │                          │
     │                          │     (per-tenant)         │                          │
     │                          ├─────────────────────────────────────────────────────▶│
     │                          │  PUT secret/tenants/     │                          │
     │                          │      user123/notion      │                          │
     │                          │                          │                          │
     │                          │◀─────────────────────────────────────────────────────┤
     │                          │  Success                 │                          │
     │                          │                          │                          │
     │ 13. Show success page    │                          │                          │
     │◀─────────────────────────┤                          │                          │
     │  "Authorization complete"│                          │                          │
     │                          │                          │                          │
```

### Using the Access Token

```
┌─────────┐                ┌─────────┐                ┌─────────┐                ┌─────────┐
│ AI Agent│                │ Gateway │                │ Notion  │                │  Vault  │
│         │                │         │                │   API   │                │         │
└────┬────┘                └────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │                          │
     │  1. Tool invocation      │                          │                          │
     ├─────────────────────────▶│                          │                          │
     │  POST /tools/invoke      │                          │                          │
     │  {                       │                          │                          │
     │    toolId: "notion.      │                          │                          │
     │            createPage",  │                          │                          │
     │    tenantId: "user123",  │                          │                          │
     │    parameters: {...}     │                          │                          │
     │  }                       │                          │                          │
     │                          │                          │                          │
     │                          │  2. Get access token     │                          │
     │                          ├─────────────────────────────────────────────────────▶│
     │                          │  GET secret/tenants/     │                          │
     │                          │      user123/notion      │                          │
     │                          │                          │                          │
     │                          │◀─────────────────────────────────────────────────────┤
     │                          │  {                       │                          │
     │                          │    access_token: "...",  │                          │
     │                          │    workspace_id: "..."   │                          │
     │                          │  }                       │                          │
     │                          │                          │                          │
     │                          │  3. Call Notion API      │                          │
     │                          │     with Bearer token    │                          │
     │                          ├─────────────────────────▶│                          │
     │                          │  POST /v1/pages          │                          │
     │                          │  Authorization: Bearer   │                          │
     │                          │    secret_xxxxxxxxxx     │                          │
     │                          │  Notion-Version:         │                          │
     │                          │    2022-06-28            │                          │
     │                          │                          │                          │
     │                          │  4. API Response         │                          │
     │                          │◀─────────────────────────┤                          │
     │                          │  {                       │                          │
     │                          │    id: "page-id",        │                          │
     │                          │    created_time: "...",  │                          │
     │                          │    url: "..."            │                          │
     │                          │  }                       │                          │
     │                          │                          │                          │
     │  5. Return result        │                          │                          │
     │◀─────────────────────────┤                          │                          │
     │  {                       │                          │                          │
     │    success: true,        │                          │                          │
     │    result: {...}         │                          │                          │
     │  }                       │                          │                          │
     │                          │                          │                          │
```

---

## Step-by-Step Process

### Phase 1: Authorization Request

**1.1. Gateway generates authorization URL**

When a user needs to authorize Notion access, the gateway constructs the OAuth URL:

```http
GET /oauth/authorize/notion?tenant_id=user123 HTTP/1.1
Host: localhost:3000
```

**Gateway Actions:**
1. Generate random `state` token (CSRF protection)
2. Store state token with tenant ID (Redis, 10 min TTL)
3. Retrieve OAuth config from Vault (`secret/oauth/notion`)
4. Build authorization URL

**Response:**
```json
{
  "authorizationUrl": "https://api.notion.com/v1/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&owner=user&redirect_uri=http://localhost:3000/oauth/callback/notion&state=RANDOM_STATE_TOKEN",
  "state": "RANDOM_STATE_TOKEN",
  "expiresIn": 600
}
```

**1.2. User visits authorization URL**

Browser redirects to Notion's consent screen where user:
- Selects workspace to grant access
- Reviews requested permissions (read, update, insert content)
- Clicks "Allow Access" or "Cancel"

---

### Phase 2: User Authorization

**2.1. Notion consent screen**

```
┌─────────────────────────────────────────────────────────────┐
│                      Notion                                 │
│                                                             │
│  [Integration Name] wants to access your Notion workspace   │
│                                                             │
│  This integration will be able to:                          │
│    ✓ Read content                                           │
│    ✓ Update content                                         │
│    ✓ Insert content                                         │
│    ✓ Read user information                                  │
│                                                             │
│  Select workspace:                                          │
│  ┌───────────────────────────────────────────┐             │
│  │  My Personal Workspace              [▼]   │             │
│  └───────────────────────────────────────────┘             │
│                                                             │
│  [ Cancel ]              [ Allow Access ]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**2.2. User clicks "Allow Access"**

Notion redirects browser to configured callback URL:

```http
GET /oauth/callback/notion?code=AUTH_CODE_HERE&state=STATE_TOKEN HTTP/1.1
Host: localhost:3000
```

Parameters:
- `code`: One-time authorization code (valid 10 minutes)
- `state`: CSRF protection token (must match original)

---

### Phase 3: Token Exchange

**3.1. Gateway validates callback**

```typescript
// Validate state token
const storedState = await redis.get(`oauth:state:${state}`);
if (!storedState || storedState !== state) {
  throw new Error('Invalid state token - possible CSRF attack');
}

// Get tenant ID from stored state
const tenantId = storedState.tenantId;
```

**3.2. Exchange authorization code for access token**

```http
POST /v1/oauth/token HTTP/1.1
Host: api.notion.com
Authorization: Basic BASE64(client_id:client_secret)
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "AUTH_CODE_HERE",
  "redirect_uri": "http://localhost:3000/oauth/callback/notion"
}
```

**Response:**
```json
{
  "access_token": "secret_abcdefghijklmnopqrstuvwxyz123456",
  "token_type": "bearer",
  "bot_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "workspace_name": "My Personal Workspace",
  "workspace_icon": "https://...",
  "workspace_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "owner": {
    "type": "user",
    "user": {
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "name": "John Doe",
      "avatar_url": "https://...",
      "type": "person",
      "person": {
        "email": "john@example.com"
      }
    }
  }
}
```

---

### Phase 4: Token Storage

**4.1. Encrypt and store in Vault**

```bash
vault kv put secret/tenants/user123/notion \
  access_token="secret_abcdefghijklmnopqrstuvwxyz123456" \
  token_type="bearer" \
  bot_id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  workspace_id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  workspace_name="My Personal Workspace" \
  owner_id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  owner_email="john@example.com" \
  created_at="2025-11-12T10:30:00Z"
```

**4.2. Additional encryption (optional)**

Gateway can use Vault's transit engine for additional encryption:

```bash
# Encrypt token with tenant-specific key
vault write transit/encrypt/tenant-user123 \
  plaintext=$(echo -n "secret_abc..." | base64)

# Store encrypted token
vault kv put secret/tenants/user123/notion \
  encrypted_token="vault:v1:encrypted_data_here"
```

**4.3. Gateway responds to user**

```http
HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
<head>
  <title>Authorization Complete</title>
</head>
<body>
  <h1>✅ Notion Authorization Successful</h1>
  <p>You can now close this window and return to the application.</p>
  <p><strong>Workspace:</strong> My Personal Workspace</p>
  <p><strong>Status:</strong> Connected</p>
</body>
</html>
```

---

### Phase 5: Using Access Token

**5.1. AI agent invokes Notion tool**

```http
POST /api/v1/tools/invoke HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "toolId": "notion.createPage",
  "integration": "notion",
  "tenantId": "user123",
  "parameters": {
    "parent": {
      "page_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    },
    "properties": {
      "title": [
        {
          "text": {
            "content": "My New Page"
          }
        }
      ]
    }
  }
}
```

**5.2. Gateway fetches token from Vault**

```typescript
// Retrieve token
const credentials = await vault.read(
  `secret/tenants/${tenantId}/notion`
);

const accessToken = credentials.data.access_token;
```

**5.3. Gateway calls Notion API**

```http
POST /v1/pages HTTP/1.1
Host: api.notion.com
Authorization: Bearer secret_abcdefghijklmnopqrstuvwxyz123456
Notion-Version: 2022-06-28
Content-Type: application/json

{
  "parent": {
    "page_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  "properties": {
    "title": [
      {
        "text": {
          "content": "My New Page"
        }
      }
    ]
  }
}
```

**5.4. Gateway returns result**

```json
{
  "success": true,
  "result": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "created_time": "2025-11-12T10:35:00.000Z",
    "last_edited_time": "2025-11-12T10:35:00.000Z",
    "url": "https://www.notion.so/My-New-Page-xxxxxxxxxxxx",
    "properties": {
      "title": {
        "type": "title",
        "title": [
          {
            "type": "text",
            "text": {
              "content": "My New Page"
            }
          }
        ]
      }
    }
  },
  "metadata": {
    "latency": 234,
    "serverUsed": "notion-mcp",
    "tokenCost": 200
  }
}
```

---

## Request/Response Examples

### Example 1: Authorization URL Generation

**Request:**
```bash
curl http://localhost:3000/oauth/authorize/notion?tenant_id=eng-team
```

**Response:**
```json
{
  "authorizationUrl": "https://api.notion.com/v1/oauth/authorize?client_id=a1b2c3d4-e5f6-7890-abcd-ef1234567890&response_type=code&owner=user&redirect_uri=http://localhost:3000/oauth/callback/notion&state=c7f8a3b2e1d4f6a5c9b8e7d6",
  "state": "c7f8a3b2e1d4f6a5c9b8e7d6",
  "expiresIn": 600,
  "instructions": "Visit the authorizationUrl to grant access"
}
```

---

### Example 2: Token Exchange (Internal)

**Request:**
```http
POST /v1/oauth/token HTTP/1.1
Host: api.notion.com
Authorization: Basic YTFiMmMzZDRlNWY2Nzg5MDphYmNkZWYxMjM0NTY3ODkw
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "a1b2c3d4e5f6g7h8i9j0",
  "redirect_uri": "http://localhost:3000/oauth/callback/notion"
}
```

**Response:**
```json
{
  "access_token": "secret_abcdefghijklmnopqrstuvwxyz123456789012345678901234567890",
  "token_type": "bearer",
  "bot_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "workspace_name": "Engineering Team",
  "workspace_icon": "https://s3-us-west-2.amazonaws.com/public.notion-static.com/...",
  "workspace_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "owner": {
    "type": "user",
    "user": {
      "object": "user",
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "name": "Jane Engineer",
      "avatar_url": "https://lh3.googleusercontent.com/...",
      "type": "person",
      "person": {
        "email": "jane@company.com"
      }
    }
  }
}
```

---

### Example 3: API Call with Bearer Token

**Request:**
```http
POST /v1/pages HTTP/1.1
Host: api.notion.com
Authorization: Bearer secret_abcdefghijklmnopqrstuvwxyz123456789012345678901234567890
Notion-Version: 2022-06-28
Content-Type: application/json

{
  "parent": {
    "database_id": "d4e5f6a7-b8c9-0123-def4-567890123456"
  },
  "properties": {
    "Name": {
      "title": [
        {
          "text": {
            "content": "Bug: Login button not responsive"
          }
        }
      ]
    },
    "Status": {
      "select": {
        "name": "Open"
      }
    },
    "Priority": {
      "select": {
        "name": "High"
      }
    }
  }
}
```

**Response:**
```json
{
  "object": "page",
  "id": "e5f6a7b8-c9d0-1234-efgh-567890abcdef",
  "created_time": "2025-11-12T10:40:00.000Z",
  "last_edited_time": "2025-11-12T10:40:00.000Z",
  "created_by": {
    "object": "user",
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "last_edited_by": {
    "object": "user",
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "cover": null,
  "icon": null,
  "parent": {
    "type": "database_id",
    "database_id": "d4e5f6a7-b8c9-0123-def4-567890123456"
  },
  "archived": false,
  "properties": {
    "Name": {
      "id": "title",
      "type": "title",
      "title": [
        {
          "type": "text",
          "text": {
            "content": "Bug: Login button not responsive",
            "link": null
          },
          "annotations": {
            "bold": false,
            "italic": false,
            "strikethrough": false,
            "underline": false,
            "code": false,
            "color": "default"
          },
          "plain_text": "Bug: Login button not responsive",
          "href": null
        }
      ]
    },
    "Status": {
      "id": "ZGhW",
      "type": "select",
      "select": {
        "id": "1",
        "name": "Open",
        "color": "red"
      }
    },
    "Priority": {
      "id": "pLWv",
      "type": "select",
      "select": {
        "id": "2",
        "name": "High",
        "color": "orange"
      }
    }
  },
  "url": "https://www.notion.so/Bug-Login-button-not-responsive-e5f6a7b8c9d01234efgh567890abcdef"
}
```

---

## Error Scenarios

### Error 1: Invalid State Token (CSRF Attack)

**Scenario:** State token doesn't match stored value

**Request:**
```http
GET /oauth/callback/notion?code=VALID_CODE&state=INVALID_STATE HTTP/1.1
Host: localhost:3000
```

**Response:**
```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{
  "error": "invalid_state",
  "error_description": "State token mismatch - possible CSRF attack",
  "details": {
    "receivedState": "INVALID_STATE",
    "expectedState": "VALID_STATE"
  }
}
```

**Gateway Action:** Rejects request, logs security event

---

### Error 2: Expired Authorization Code

**Scenario:** Code used after 10 minute expiry

**Token Exchange Request:**
```http
POST /v1/oauth/token HTTP/1.1
Host: api.notion.com
...

{
  "grant_type": "authorization_code",
  "code": "EXPIRED_CODE",
  "redirect_uri": "..."
}
```

**Notion Response:**
```json
{
  "error": "invalid_grant",
  "error_description": "The provided authorization code is invalid or has expired"
}
```

**Gateway Action:**
- Returns error to user
- Prompts to restart authorization flow
- Cleans up stored state tokens

---

### Error 3: Invalid Client Credentials

**Scenario:** Wrong client_id or client_secret

**Token Exchange Request:**
```http
POST /v1/oauth/token HTTP/1.1
Host: api.notion.com
Authorization: Basic INVALID_BASE64_CREDENTIALS
...
```

**Notion Response:**
```json
{
  "error": "invalid_client",
  "error_description": "Client authentication failed"
}
```

**Gateway Action:**
- Logs critical error (credentials may be compromised/wrong)
- Alerts administrator
- Does not expose to end user (security)

---

### Error 4: User Denies Access

**Scenario:** User clicks "Cancel" on consent screen

**Callback:**
```http
GET /oauth/callback/notion?error=access_denied&state=VALID_STATE HTTP/1.1
Host: localhost:3000
```

**Gateway Response:**
```http
HTTP/1.1 200 OK
Content-Type: text/html

<!DOCTYPE html>
<html>
<body>
  <h1>❌ Authorization Cancelled</h1>
  <p>You denied access to Notion. The integration will not have access to your workspace.</p>
  <p>If this was a mistake, you can try again.</p>
  <button onclick="window.close()">Close Window</button>
</body>
</html>
```

---

### Error 5: Revoked Token

**Scenario:** User revokes integration in Notion settings

**API Call:**
```http
POST /v1/pages HTTP/1.1
Host: api.notion.com
Authorization: Bearer REVOKED_TOKEN
...
```

**Notion Response:**
```json
{
  "object": "error",
  "status": 401,
  "code": "unauthorized",
  "message": "The integration access token is no longer valid. The integration may have been removed from the workspace."
}
```

**Gateway Action:**
1. Detects 401 unauthorized
2. Removes stored token from Vault
3. Returns error to agent with reauthorization link
4. Notifies tenant admin

**Agent Response:**
```json
{
  "success": false,
  "error": {
    "code": "oauth_expired",
    "message": "Notion authorization has been revoked. Please reauthorize.",
    "reauthorizeUrl": "http://localhost:3000/oauth/authorize/notion?tenant_id=user123"
  }
}
```

---

### Error 6: Rate Limit Exceeded

**Scenario:** Too many API calls

**API Call:**
```http
POST /v1/pages HTTP/1.1
Host: api.notion.com
Authorization: Bearer VALID_TOKEN
...
```

**Notion Response:**
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 3

{
  "object": "error",
  "status": 429,
  "code": "rate_limited",
  "message": "Rate limit exceeded. Please retry after 3 seconds."
}
```

**Gateway Action:**
1. Implements exponential backoff
2. Waits specified time
3. Retries automatically (max 3 attempts)
4. Returns to agent if all retries fail

---

## Token Management

### Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Notion Token Lifecycle                   │
└─────────────────────────────────────────────────────────────┘

1. Creation
   └─> OAuth flow completes
       └─> Token stored in Vault
           └─> Status: ACTIVE

2. Usage
   └─> Gateway fetches from Vault (cached 5 min)
       └─> Injected into every API call
           └─> Notion validates token

3. Revocation (by user)
   └─> User removes integration in Notion
       └─> Token becomes invalid
           └─> Next API call returns 401
               └─> Gateway detects and removes from Vault
                   └─> Status: REVOKED

4. Manual Removal
   └─> Admin/user removes via gateway
       └─> Token deleted from Vault
           └─> Status: REMOVED
```

### Storage Schema

**Vault Path:** `secret/tenants/{tenant_id}/notion`

**Data Structure:**
```json
{
  "access_token": "secret_abcdefghijk...",
  "token_type": "bearer",
  "bot_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "workspace_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "workspace_name": "Engineering Team",
  "workspace_icon": "https://...",
  "owner": {
    "type": "user",
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "name": "Jane Engineer",
    "email": "jane@company.com"
  },
  "metadata": {
    "created_at": "2025-11-12T10:30:00Z",
    "created_by": "gateway",
    "last_used_at": "2025-11-12T15:45:00Z",
    "usage_count": 1234,
    "status": "active"
  }
}
```

### Token Caching

To avoid Vault lookups on every request:

```typescript
// Gateway implements Redis cache
const CACHE_TTL = 300; // 5 minutes

async function getNotionToken(tenantId: string): Promise<string> {
  // Check cache first
  const cached = await redis.get(`token:notion:${tenantId}`);
  if (cached) {
    return cached;
  }

  // Fetch from Vault
  const token = await vault.read(`secret/tenants/${tenantId}/notion`);

  // Cache for 5 minutes
  await redis.setex(`token:notion:${tenantId}`, CACHE_TTL, token.access_token);

  return token.access_token;
}
```

### Token Validation

Gateway validates token health:

```typescript
async function validateNotionToken(tenantId: string): Promise<boolean> {
  const token = await getNotionToken(tenantId);

  try {
    // Test token with lightweight API call
    const response = await axios.get('https://api.notion.com/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28'
      }
    });

    // Update last used time
    await updateTokenMetadata(tenantId, { last_used_at: new Date() });

    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token invalid - remove from cache and Vault
      await redis.del(`token:notion:${tenantId}`);
      await vault.delete(`secret/tenants/${tenantId}/notion`);
      return false;
    }
    throw error;
  }
}
```

---

## Security Considerations

### 1. State Token (CSRF Protection)

**Purpose:** Prevent cross-site request forgery attacks

**Implementation:**
```typescript
// Generate cryptographically secure random state
const state = crypto.randomBytes(32).toString('hex');

// Store with tenant ID and expiry
await redis.setex(
  `oauth:state:${state}`,
  600, // 10 minutes
  JSON.stringify({ tenantId, timestamp: Date.now() })
);

// Validate on callback
const stored = await redis.get(`oauth:state:${receivedState}`);
if (!stored || JSON.parse(stored).tenantId !== tenantId) {
  throw new Error('Invalid state token');
}

// Delete after use (single-use token)
await redis.del(`oauth:state:${receivedState}`);
```

---

### 2. Token Storage Encryption

**Vault Transit Engine:**
```bash
# Enable transit engine
vault secrets enable transit

# Create encryption key per tenant
vault write -f transit/keys/tenant-user123

# Encrypt token before storage
vault write transit/encrypt/tenant-user123 \
  plaintext=$(echo -n "secret_abc..." | base64)

# Decrypt when needed
vault write transit/decrypt/tenant-user123 \
  ciphertext="vault:v1:encrypted_data"
```

**Additional Layer:** Use Vault's built-in encryption at rest.

---

### 3. Secure Communication

**TLS/HTTPS:**
- All OAuth flows must use HTTPS in production
- Redirect URIs must be HTTPS (except localhost)
- Token exchange uses TLS 1.2+

**Production Configuration:**
```bash
# Gateway .env
NOTION_REDIRECT_URI=https://app.yourcompany.com/oauth/callback/notion
FORCE_HTTPS=true
ALLOWED_ORIGINS=https://app.yourcompany.com,https://www.yourcompany.com
```

---

### 4. Token Access Logging

Audit all token access:

```typescript
async function getNotionToken(tenantId: string, context: RequestContext) {
  // Log access
  await auditLog.log({
    event: 'TOKEN_ACCESS',
    integration: 'notion',
    tenantId,
    userId: context.userId,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    timestamp: new Date()
  });

  const token = await vault.read(`secret/tenants/${tenantId}/notion`);
  return token.access_token;
}
```

---

### 5. Scope Validation

Ensure token has required permissions:

```typescript
async function validateScopes(tenantId: string, requiredScopes: string[]) {
  const tokenData = await vault.read(`secret/tenants/${tenantId}/notion`);

  // Notion doesn't use traditional scopes, but check capabilities
  const capabilities = tokenData.capabilities || [];

  // Verify integration has required capabilities
  for (const scope of requiredScopes) {
    if (!capabilities.includes(scope)) {
      throw new Error(`Missing required capability: ${scope}`);
    }
  }
}
```

---

### 6. Rate Limit Protection

Protect against abuse:

```typescript
// Per-tenant rate limiting
const rateLimiter = new RateLimiter({
  integration: 'notion',
  requestsPerSecond: 3,
  burstLimit: 30
});

async function callNotionAPI(tenantId: string, endpoint: string, data: any) {
  // Check rate limit
  await rateLimiter.checkLimit(tenantId);

  // Make API call
  const response = await axios.post(`https://api.notion.com${endpoint}`, data, {
    headers: {
      'Authorization': `Bearer ${await getNotionToken(tenantId)}`,
      'Notion-Version': '2022-06-28'
    }
  });

  return response.data;
}
```

---

## Summary

✅ **Notion OAuth Implementation Complete**

**Key Points:**
1. **Authorization Code flow** - Standard OAuth 2.0
2. **No token expiry** - Tokens valid until revoked
3. **Workspace-level permissions** - User selects workspace
4. **Secure storage** - Vault with encryption
5. **CSRF protection** - State token validation
6. **Auto-injection** - Gateway handles transparently
7. **Error handling** - Graceful degradation and reauthorization

**Security Features:**
- ✅ State token (CSRF protection)
- ✅ Vault encryption at rest
- ✅ TLS/HTTPS for all OAuth flows
- ✅ Token access audit logging
- ✅ Rate limiting per tenant
- ✅ Automatic token validation

**Performance:**
- OAuth flow: ~2-5 seconds (user interaction)
- Token fetch: <10ms (Vault + cache)
- API call: 100-500ms (Notion latency)
- Cache hit rate: >95% after warmup

**Related Documentation:**
- [Notion Setup Guide](./NOTION_SETUP.md)
- [Notion API Documentation](https://developers.notion.com/)
- [OAuth 2.0 Specification](https://oauth.net/2/)

---

**Last Updated:** 2025-11-12
**Version:** 1.0.0
**Maintained By:** Connectors Platform Team
