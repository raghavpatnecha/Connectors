# Gmail Unified MCP Server

Complete Gmail API implementation with 66 tools for comprehensive email management.

## Features

- **66 Gmail Tools** organized by category:
  - User Management (3 tools)
  - Messages (11 tools)
  - Labels (6 tools)
  - Threads (6 tools)
  - Drafts (6 tools)
  - Settings (34 tools across multiple subcategories)

- **Multi-tenant OAuth** support via HashiCorp Vault
- **Dual server pattern**: stdio for MCP + HTTP for OAuth
- **Type-safe** with Zod validation
- **Production-ready** with Winston logging

## Tool Categories

### User Management (3 tools)
- `get_profile` - Get user's Gmail profile
- `watch_mailbox` - Set up push notifications
- `stop_mail_watch` - Stop push notifications

### Messages (11 tools)
- `list_messages`, `get_message`, `send_message`
- `delete_message`, `trash_message`, `untrash_message`
- `modify_message`, `batch_modify_messages`, `batch_delete_messages`
- `get_attachment`, `import_message`

### Labels (6 tools)
- `list_labels`, `get_label`, `create_label`
- `update_label`, `patch_label`, `delete_label`

### Threads (6 tools)
- `list_threads`, `get_thread`, `modify_thread`
- `trash_thread`, `untrash_thread`, `delete_thread`

### Drafts (6 tools)
- `list_drafts`, `get_draft`, `create_draft`
- `update_draft`, `send_draft`, `delete_draft`

### Settings (34 tools)

#### Auto-forwarding (2)
- `get_auto_forwarding`, `update_auto_forwarding`

#### IMAP (2)
- `get_imap`, `update_imap`

#### Language (2)
- `get_language`, `update_language`

#### POP (2)
- `get_pop`, `update_pop`

#### Vacation Responder (2)
- `get_vacation`, `update_vacation`

#### Delegates (4)
- `list_delegates`, `get_delegate`, `add_delegate`, `remove_delegate`

#### Filters (4)
- `list_filters`, `get_filter`, `create_filter`, `delete_filter`

#### Forwarding Addresses (4)
- `list_forwarding_addresses`, `get_forwarding_address`
- `create_forwarding_address`, `delete_forwarding_address`

#### Send-as Aliases (7)
- `list_send_as`, `get_send_as`, `create_send_as`
- `update_send_as`, `patch_send_as`, `delete_send_as`, `verify_send_as`

#### S/MIME (5)
- `list_smime_info`, `get_smime_info`, `insert_smime_info`
- `delete_smime_info`, `set_default_smime_info`

## Installation

```bash
npm install
npm run build
```

## Usage

### Stdio Mode (MCP)

```bash
node dist/index.js
```

### HTTP Mode (OAuth)

The server automatically starts an HTTP server on port 3130 for OAuth callbacks.

```bash
PORT=3130 node dist/index.js
```

## Configuration

Set environment variables for access tokens (temporary, will be replaced with Vault):

```bash
export GMAIL_ACCESS_TOKEN_tenant1=<token>
export GMAIL_ACCESS_TOKEN_tenant2=<token>
```

## Development

```bash
npm run dev  # Watch mode
npm run build  # Production build
```

## Docker

```bash
docker build -t gmail-unified-mcp .
docker run -p 3130:3130 gmail-unified-mcp
```

## Integration

This server integrates with:
- **Shared OAuth**: `../../shared/google-auth/` (Vault, OAuth Manager)
- **Gateway**: MCP Gateway for tool selection
- **Monitoring**: Winston logging with JSON format

## Tool Count Verification

Total tools: **66**
- User: 3
- Messages: 11
- Labels: 6
- Threads: 6
- Drafts: 6
- Settings: 34

## Reference

Based on [shinzo-labs/gmail-mcp](https://github.com/shinzolabs/gmail-mcp) with enhancements:
- Multi-tenant support
- Vault integration
- Dual server architecture
- Enhanced error handling
