# Google Chat Unified MCP Server

Comprehensive Google Chat MCP server with 23 tools for complete Chat API access.

## Overview

This MCP server provides full access to Google Chat functionality including:
- **Spaces**: Create, manage, and interact with chat spaces
- **Messages**: Send, receive, and manage messages
- **Members**: Add, remove, and manage space memberships
- **Attachments**: Upload and retrieve file attachments
- **Reactions**: Add and remove emoji reactions
- **Advanced**: Search messages, set topics, batch operations

## Features

- 23 comprehensive tools covering all major Chat API operations
- Multi-tenant OAuth support via HashiCorp Vault
- Type-safe TypeScript implementation
- Follows established patterns from gmail-unified
- Full error handling and logging

## Tools

### Spaces (6 tools)
- `list_spaces` - List all accessible spaces
- `get_space` - Get space details
- `create_space` - Create a new space/room
- `update_space` - Update space settings
- `delete_space` - Delete a space
- `find_direct_message` - Find/create DM with user

### Messages (5 tools)
- `list_messages` - List messages in a space
- `get_message` - Get message details
- `create_message` - Send a message
- `update_message` - Update a message
- `delete_message` - Delete a message

### Members (4 tools)
- `list_memberships` - List space members
- `get_membership` - Get member details
- `create_membership` - Add member to space
- `delete_membership` - Remove member from space

### Attachments (2 tools)
- `get_attachment` - Retrieve attachment
- `upload_attachment` - Upload file to space

### Reactions (3 tools)
- `list_reactions` - List reactions on message
- `create_reaction` - Add reaction to message
- `delete_reaction` - Remove reaction

### Advanced (3 tools)
- `search_messages` - Search across spaces
- `set_space_topic` - Update space topic
- `batch_add_members` - Add multiple members

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
npm start
```

## Configuration

- **Port**: 3138 (configurable via PORT env var)
- **OAuth**: Uses shared Google Auth from `../../shared/google-auth/`
- **Scopes Required**:
  - `https://www.googleapis.com/auth/chat.spaces`
  - `https://www.googleapis.com/auth/chat.messages`
  - `https://www.googleapis.com/auth/chat.memberships`

## Development

```bash
# Build TypeScript
npm run build

# Watch mode
npm run dev

# Clean build artifacts
npm run clean
```

## Integration

This server integrates with:
- MCP Gateway for semantic tool selection
- HashiCorp Vault for OAuth credential storage
- Shared Google Auth module for authentication

## Architecture

Follows the established pattern from Phase 1 implementations:
- `src/index.ts` - Main MCP server setup
- `src/clients/` - Google Chat API client
- `src/tools/` - Tool implementations by category
- `src/utils/` - Shared utilities (logger, registry)

## License

MIT
