# Google Workspace Shared Authentication

Unified OAuth 2.0 authentication module for all Google Workspace MCP servers.

## Overview

This module provides:
- **OAuth 2.0 Flow**: Complete Google authentication with refresh token support
- **Vault Integration**: Secure credential storage with HashiCorp Vault
- **Multi-Tenant Support**: Isolated credentials per tenant
- **Auto-Refresh**: Automatic token refresh 5 minutes before expiry
- **Service Clients**: Factory for all Google Workspace API clients

## Architecture

```
┌─────────────────────────────────────┐
│   Google Workspace MCP Server       │
│   (Gmail, Drive, Calendar, etc.)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   GoogleClientFactory               │
│   - getGmailClient(tenantId)        │
│   - getDriveClient(tenantId)        │
│   - getCalendarClient(tenantId)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   OAuthManager                      │
│   - generateAuthUrl()               │
│   - handleCallback()                │
│   - getAuthenticatedClient()        │
│   - refreshToken()                  │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌────────────┐  ┌──────────────┐
│OAuth2Client│  │ VaultClient  │
│  (Google)  │  │ (Credentials)│
└────────────┘  └──────────────┘
```

## Usage

### Initialize OAuth Manager

```typescript
import {
  OAuthManager,
  VaultClient,
  GOOGLE_OAUTH_CONFIG,
  GoogleClientFactory,
} from '@connectors/google-auth';

// Initialize Vault client
const vaultClient = new VaultClient(
  process.env.VAULT_ADDR!,
  process.env.VAULT_TOKEN!,
  'google-workspace-mcp'
);

// Initialize OAuth manager
const oauthManager = new OAuthManager(GOOGLE_OAUTH_CONFIG, vaultClient);

// Initialize client factory
const clientFactory = new GoogleClientFactory(oauthManager);
```

### OAuth Flow

```typescript
// 1. Generate authorization URL
const authUrl = oauthManager.generateAuthUrl('tenant-123');
console.log('Visit:', authUrl);

// 2. Handle callback (after user authorizes)
await oauthManager.handleCallback(authorizationCode, 'tenant-123');

// 3. Credentials are now stored in Vault!
```

### Use Google API Clients

```typescript
// Get Gmail client (auto-refreshes token if needed)
const gmail = await clientFactory.getGmailClient('tenant-123');

// Use Gmail API
const messages = await gmail.users.messages.list({
  userId: 'me',
  maxResults: 10,
});

// Get Drive client
const drive = await clientFactory.getDriveClient('tenant-123');

// Use Drive API
const files = await drive.files.list({
  pageSize: 10,
  fields: 'files(id, name, mimeType)',
});

// Get multiple clients at once
const { gmail, calendar, drive } = await clientFactory.getClients(
  'tenant-123',
  ['gmail', 'calendar', 'drive']
);
```

### Manual Token Management

```typescript
// Check if credentials are valid
const isValid = await oauthManager.validateCredentials('tenant-123');

// Manually refresh token
await oauthManager.refreshToken('tenant-123');

// Get access token only
const accessToken = await oauthManager.getValidToken('tenant-123');

// Revoke credentials
await oauthManager.revokeCredentials('tenant-123');
```

## Configuration

### Environment Variables

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/google/callback

# HashiCorp Vault
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=your-vault-token
```

### Custom Scopes

```typescript
import { GOOGLE_SCOPES, SCOPE_SETS } from '@connectors/google-auth';

// Use predefined scope sets
const config = {
  ...GOOGLE_OAUTH_CONFIG,
  scopes: SCOPE_SETS.PHASE1_FULL, // Gmail, Drive, Calendar
};

// Or use individual scopes
const customScopes = [
  GOOGLE_SCOPES.GMAIL_READONLY,
  GOOGLE_SCOPES.DRIVE_FILE,
  GOOGLE_SCOPES.CALENDAR_EVENTS,
];
```

## OAuth Scopes

### Available Scope Sets

- **PHASE1_FULL**: Gmail, Drive, Calendar (full access)
- **PHASE1_READONLY**: Gmail, Drive, Calendar (read-only)
- **PHASE2_FULL**: Sheets, Docs, Slides (full access)
- **PHASE2_READONLY**: Sheets, Docs, Slides (read-only)
- **PHASE3_FULL**: Forms, Tasks, Chat (full access)
- **ADMIN**: Admin Directory APIs
- **ALL_WORKSPACE**: All services (302 tools)

### Individual Scopes

See `oauth-config.ts` for complete list of 40+ individual scopes.

## Vault Storage

Credentials are stored in Vault at:
```
{namespace}/data/{tenantId}/google
```

Default namespace: `google-workspace-mcp`

### Stored Data

```json
{
  "access_token": "ya29.a0...",
  "refresh_token": "1//0e...",
  "expires_at": 1699999999,
  "token_type": "Bearer",
  "scope": "https://www.googleapis.com/auth/gmail.modify ..."
}
```

## Auto-Refresh

Tokens are automatically refreshed when:
- Token expires within 5 minutes
- Any API call is made with expired token
- `getAuthenticatedClient()` detects expiry

## Multi-Tenant Support

Each tenant has isolated credentials:

```typescript
// Tenant 1
const gmail1 = await clientFactory.getGmailClient('tenant-1');

// Tenant 2
const gmail2 = await clientFactory.getGmailClient('tenant-2');

// Completely isolated - different credentials
```

## Error Handling

```typescript
import { OAuthError } from '@connectors/google-auth';

try {
  const client = await clientFactory.getGmailClient('tenant-123');
} catch (error) {
  if (error instanceof OAuthError) {
    console.error('OAuth error:', error.message);
    // Redirect user to re-authenticate
    const authUrl = clientFactory.getAuthUrl('tenant-123');
  }
}
```

## API Reference

### OAuthManager

- `generateAuthUrl(tenantId, additionalScopes?)`: Generate OAuth URL
- `handleCallback(code, tenantId)`: Exchange code for tokens
- `getAuthenticatedClient(tenantId)`: Get OAuth2Client with valid token
- `getValidToken(tenantId)`: Get access token string
- `refreshToken(tenantId)`: Manually refresh token
- `revokeCredentials(tenantId)`: Revoke and delete credentials
- `validateCredentials(tenantId)`: Check if credentials are valid

### GoogleClientFactory

- `getGmailClient(tenantId)`: Get Gmail API client
- `getDriveClient(tenantId)`: Get Drive API client
- `getCalendarClient(tenantId)`: Get Calendar API client
- `getSheetsClient(tenantId)`: Get Sheets API client
- `getDocsClient(tenantId)`: Get Docs API client
- `getSlidesClient(tenantId)`: Get Slides API client
- `getTasksClient(tenantId)`: Get Tasks API client
- `getFormsClient(tenantId)`: Get Forms API client
- `getChatClient(tenantId)`: Get Chat API client
- `getPeopleClient(tenantId)`: Get People API client
- `getAdminDirectoryClient(tenantId)`: Get Admin API client
- `getClients(tenantId, services)`: Get multiple clients

### VaultClient

- `storeCredentials(tenantId, credentials)`: Store OAuth credentials
- `getCredentials(tenantId)`: Retrieve OAuth credentials
- `deleteCredentials(tenantId)`: Delete OAuth credentials
- `hasCredentials(tenantId)`: Check if credentials exist
- `isTokenExpired(credentials)`: Check if token is expired
- `getTimeUntilExpiry(credentials)`: Get seconds until expiry

## Dependencies

```json
{
  "googleapis": "^128.0.0",
  "google-auth-library": "^9.0.0",
  "node-vault": "^0.10.2",
  "winston": "^3.11.0"
}
```

## License

MIT
