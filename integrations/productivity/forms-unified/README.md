# Google Forms MCP Server

Unified MCP server for Google Forms API with OAuth 2.0 authentication.

## Overview

This MCP server provides 15 comprehensive tools for managing Google Forms, form questions, responses, and watches. It uses shared Google OAuth authentication and supports multi-tenant deployments.

## Features

- **15 MCP Tools** for complete Forms management
- **Multi-tenant OAuth 2.0** via shared authentication module
- **Dual Server Architecture**: stdio (MCP) + HTTP (OAuth callbacks)
- **Type-safe** implementation with TypeScript and Zod validation
- **Comprehensive error handling** with structured logging

## Tools

### Form Management (9 tools)

1. **forms_create_form** - Create a new Google Form
2. **forms_get_form** - Get form details including questions
3. **forms_batch_update** - Perform batch updates to form structure
4. **forms_update_info** - Update form title/description
5. **forms_update_settings** - Update form settings (quiz mode, etc.)
6. **forms_create_item** - Add new question to form
7. **forms_update_item** - Update existing question
8. **forms_delete_item** - Delete question from form
9. **forms_move_item** - Reorder questions in form

### Response Management (2 tools)

10. **forms_list_responses** - List all form responses with pagination
11. **forms_get_response** - Get detailed response information

### Watch Management (4 tools)

12. **forms_create_watch** - Create watch for form notifications
13. **forms_delete_watch** - Delete existing watch
14. **forms_list_watches** - List all watches for a form
15. **forms_renew_watch** - Renew watch to extend expiration

## OAuth Scopes

The server requires the following Google OAuth scopes:

- `https://www.googleapis.com/auth/forms.body` - Full form management
- `https://www.googleapis.com/auth/forms.body.readonly` - Read-only form access
- `https://www.googleapis.com/auth/forms.responses.readonly` - Read form responses

## Installation

```bash
cd integrations/productivity/forms-unified
npm install
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Type check
npm run typecheck
```

## Production

```bash
# Build and start
npm run build
npm start
```

## Docker

```bash
# Build Docker image
docker build -t forms-mcp:latest .

# Run container
docker run -p 3136:3136 \
  -e GOOGLE_CLIENT_ID=your_client_id \
  -e GOOGLE_CLIENT_SECRET=your_client_secret \
  -e GOOGLE_REDIRECT_URI=http://localhost:3136/oauth/callback \
  forms-mcp:latest
```

## OAuth Flow

1. **Generate Auth URL**:
   ```bash
   curl http://localhost:3136/oauth/authorize?tenantId=tenant123
   ```

2. **User Authorization**: User visits the returned `authUrl` and authorizes

3. **Callback Handling**: OAuth callback automatically stores credentials

4. **Use Tools**: All tools now work with stored credentials for that tenant

## HTTP Endpoints

- `GET /` - Service information and tool list
- `GET /health` - Health check endpoint
- `GET /oauth/authorize?tenantId=<id>` - Generate OAuth URL
- `GET /oauth/callback` - OAuth callback handler

## Example Usage

### Create a Form

```json
{
  "tool": "forms_create_form",
  "arguments": {
    "tenantId": "tenant123",
    "title": "Customer Feedback Survey",
    "description": "We value your feedback!"
  }
}
```

### Add Question

```json
{
  "tool": "forms_create_item",
  "arguments": {
    "tenantId": "tenant123",
    "formId": "1FAIpQLSe...",
    "title": "How satisfied are you with our service?",
    "questionType": "LINEAR_SCALE",
    "required": true
  }
}
```

### List Responses

```json
{
  "tool": "forms_list_responses",
  "arguments": {
    "tenantId": "tenant123",
    "formId": "1FAIpQLSe...",
    "pageSize": 50
  }
}
```

## Architecture

```
forms-unified/
├── src/
│   ├── index.ts              # Main server setup
│   ├── tools/
│   │   ├── forms.ts          # Form management tools (9)
│   │   ├── responses.ts      # Response tools (2)
│   │   ├── watches.ts        # Watch tools (4)
│   │   └── index.ts          # Tool exports
│   └── utils/
│       ├── logger.ts         # Winston logger
│       ├── error-handler.ts  # Error handling
│       └── tool-registry-helper.ts  # Tool registration
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Integration with Gateway

This MCP server integrates with the Connectors Platform gateway for:

- **Semantic routing** to relevant Forms tools
- **Token optimization** via progressive loading
- **Multi-tenant isolation** with per-tenant OAuth
- **Centralized monitoring** and logging

## Phase 3 Implementation

Part of Phase 3 Google Workspace implementation:
- ✅ **Forms** (15 tools) - This server
- Tasks (16 tools)
- Chat (12+ tools)

Total Phase 3: 40+ tools

## License

MIT
