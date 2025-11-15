# Google Workspace MCP - Folder Structure

## 📁 Complete Directory Organization

```
Connectors/
├── integrations/
│   │
│   ├── shared/                              # Shared components for all Google services
│   │   ├── google-auth/                     # OAuth 2.0 authentication
│   │   │   ├── oauth-manager.ts             # Google OAuth flow handler
│   │   │   ├── vault-client.ts              # HashiCorp Vault integration
│   │   │   ├── google-client-factory.ts     # googleapis client factory
│   │   │   ├── oauth-config.ts              # Shared OAuth configuration
│   │   │   └── index.ts                     # Public exports
│   │   │
│   │   └── google-utils/                    # Shared utilities
│   │       ├── error-mapper.ts              # Google API error → Gateway error
│   │       ├── batch-helper.ts              # Batch operation utilities
│   │       ├── rate-limiter.ts              # Token bucket rate limiting
│   │       ├── types.ts                     # Shared TypeScript interfaces
│   │       ├── logger.ts                    # Winston logger configuration
│   │       └── index.ts                     # Public exports
│   │
│   ├── communication/                       # Communication services
│   │   │
│   │   ├── gmail-unified/                   # Gmail MCP Server (Port 3130)
│   │   │   ├── src/
│   │   │   │   ├── index.ts                 # Main entry (stdio + HTTP servers)
│   │   │   │   │
│   │   │   │   ├── tools/                   # 45+ Gmail tools
│   │   │   │   │   ├── messages.ts          # 15 message tools (list, get, send, delete, etc.)
│   │   │   │   │   ├── labels.ts            # 8 label tools (create, update, apply, etc.)
│   │   │   │   │   ├── threads.ts           # 6 thread tools (list, get, modify, etc.)
│   │   │   │   │   ├── drafts.ts            # 5 draft tools (create, update, send, etc.)
│   │   │   │   │   ├── settings.ts          # 11 settings tools (forwarding, IMAP, vacation, etc.)
│   │   │   │   │   └── index.ts             # Tool registration exports
│   │   │   │   │
│   │   │   │   ├── clients/
│   │   │   │   │   └── gmail-client.ts      # Gmail API wrapper (uses GoogleClientFactory)
│   │   │   │   │
│   │   │   │   └── utils/
│   │   │   │       ├── tool-registry-helper.ts
│   │   │   │       ├── logger.ts
│   │   │   │       └── error-handler.ts
│   │   │   │
│   │   │   ├── package.json                 # Dependencies: @modelcontextprotocol/sdk, googleapis, express
│   │   │   ├── tsconfig.json
│   │   │   ├── Dockerfile                   # Multi-stage build
│   │   │   └── README.md
│   │   │
│   │   └── chat-unified/                    # Google Chat MCP Server (Port 3138)
│   │       ├── src/
│   │       │   ├── index.ts
│   │       │   │
│   │       │   ├── tools/                   # 23+ Chat tools
│   │       │   │   ├── spaces.ts            # 8 space tools (list, create, update, delete, etc.)
│   │       │   │   ├── messages.ts          # 10 message tools (send, edit, delete, reactions, etc.)
│   │       │   │   ├── members.ts           # 5 member tools (list, add, update, remove, etc.)
│   │       │   │   └── index.ts
│   │       │   │
│   │       │   ├── clients/
│   │       │   │   └── chat-client.ts
│   │       │   │
│   │       │   └── utils/
│   │       │
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── Dockerfile
│   │       └── README.md
│   │
│   ├── productivity/                        # Productivity services
│   │   │
│   │   ├── calendar-unified/                # Google Calendar MCP Server (Port 3131)
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   │
│   │   │   │   ├── tools/                   # 26+ Calendar tools
│   │   │   │   │   ├── events.ts            # 12 event tools (list, create, update, quick-add, etc.)
│   │   │   │   │   ├── calendars.ts         # 8 calendar tools (list, create, update, freebusy, etc.)
│   │   │   │   │   ├── acl.ts               # 6 ACL tools (list, insert, update, delete, etc.)
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── clients/
│   │   │   │   │   └── calendar-client.ts
│   │   │   │   │
│   │   │   │   └── utils/
│   │   │   │
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── Dockerfile
│   │   │   └── README.md
│   │   │
│   │   ├── tasks-unified/                   # Google Tasks MCP Server (Port 3137)
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   │
│   │   │   │   ├── tools/                   # 16+ Tasks tools
│   │   │   │   │   ├── tasklists.ts         # 6 task list tools (list, create, update, delete, etc.)
│   │   │   │   │   ├── tasks.ts             # 10 task tools (list, create, update, move, complete, etc.)
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── clients/
│   │   │   │   │   └── tasks-client.ts
│   │   │   │   │
│   │   │   │   └── utils/
│   │   │   │
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── Dockerfile
│   │   │   └── README.md
│   │   │
│   │   └── forms-unified/                   # Google Forms MCP Server (Port 3136)
│   │       ├── src/
│   │       │   ├── index.ts
│   │       │   │
│   │       │   ├── tools/                   # 14+ Forms tools
│   │       │   │   ├── forms.ts             # 8 form tools (create, get, update, add/delete items, etc.)
│   │       │   │   ├── responses.ts         # 6 response tools (list, get, delete, watch, etc.)
│   │       │   │   └── index.ts
│   │       │   │
│   │       │   ├── clients/
│   │       │   │   └── forms-client.ts
│   │       │   │
│   │       │   └── utils/
│   │       │
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── Dockerfile
│   │       └── README.md
│   │
│   ├── storage/                             # Storage services
│   │   │
│   │   └── drive-unified/                   # Google Drive MCP Server (Port 3132)
│   │       ├── src/
│   │       │   ├── index.ts
│   │       │   │
│   │       │   ├── tools/                   # 40+ Drive tools
│   │       │   │   ├── files.ts             # 15 file tools (list, get, create, upload, download, etc.)
│   │       │   │   ├── folders.ts           # 8 folder tools (create, list, move, tree, etc.)
│   │       │   │   ├── permissions.ts       # 10 permission tools (share, revoke, transfer, etc.)
│   │       │   │   ├── comments.ts          # 7 comment tools (list, create, update, reply, etc.)
│   │       │   │   └── index.ts
│   │       │   │
│   │       │   ├── clients/
│   │       │   │   └── drive-client.ts
│   │       │   │
│   │       │   └── utils/
│   │       │
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── Dockerfile
│   │       └── README.md
│   │
│   ├── documents/                           # Document editing services
│   │   │
│   │   ├── docs-unified/                    # Google Docs MCP Server (Port 3133)
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   │
│   │   │   │   ├── tools/                   # 22+ Docs tools
│   │   │   │   │   ├── documents.ts         # 10 document tools (create, get, insert, delete, etc.)
│   │   │   │   │   ├── content.ts           # 12 content tools (format, tables, images, lists, etc.)
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── clients/
│   │   │   │   │   └── docs-client.ts
│   │   │   │   │
│   │   │   │   └── utils/
│   │   │   │
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── Dockerfile
│   │   │   └── README.md
│   │   │
│   │   ├── sheets-unified/                  # Google Sheets MCP Server (Port 3134)
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   │
│   │   │   │   ├── tools/                   # 33+ Sheets tools
│   │   │   │   │   ├── spreadsheets.ts      # 10 spreadsheet tools (create, get, update, values, etc.)
│   │   │   │   │   ├── cells.ts             # 15 cell tools (insert, delete, merge, format, sort, etc.)
│   │   │   │   │   ├── charts.ts            # 8 chart tools (add, update, delete, protect, etc.)
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── clients/
│   │   │   │   │   └── sheets-client.ts
│   │   │   │   │
│   │   │   │   └── utils/
│   │   │   │
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── Dockerfile
│   │   │   └── README.md
│   │   │
│   │   └── slides-unified/                  # Google Slides MCP Server (Port 3135)
│   │       ├── src/
│   │       │   ├── index.ts
│   │       │   │
│   │       │   ├── tools/                   # 25+ Slides tools
│   │       │   │   ├── presentations.ts     # 10 presentation tools (create, get, update, slides, etc.)
│   │       │   │   ├── elements.ts          # 15 element tools (text, images, shapes, tables, etc.)
│   │       │   │   └── index.ts
│   │       │   │
│   │       │   ├── clients/
│   │       │   │   └── slides-client.ts
│   │       │   │
│   │       │   └── utils/
│   │       │
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── Dockerfile
│   │       └── README.md
│   │
│   └── search/                              # Search services
│       │
│       └── custom-search-unified/           # Custom Search MCP Server (Port 3139)
│           ├── src/
│           │   ├── index.ts
│           │   │
│           │   ├── tools/                   # 6+ Search tools
│           │   │   ├── search.ts            # Search engine tools (create, query, configure, etc.)
│           │   │   └── index.ts
│           │   │
│           │   ├── clients/
│           │   │   └── search-client.ts
│           │   │
│           │   └── utils/
│           │
│           ├── package.json
│           ├── tsconfig.json
│           ├── Dockerfile
│           └── README.md
│
├── gateway/
│   ├── src/
│   │   ├── integrations/                    # Gateway integration modules
│   │   │   ├── gmail-integration.ts         # Gmail gateway integration
│   │   │   ├── calendar-integration.ts      # Calendar gateway integration
│   │   │   ├── drive-integration.ts         # Drive gateway integration
│   │   │   ├── docs-integration.ts          # Docs gateway integration
│   │   │   ├── sheets-integration.ts        # Sheets gateway integration
│   │   │   ├── slides-integration.ts        # Slides gateway integration
│   │   │   ├── forms-integration.ts         # Forms gateway integration
│   │   │   ├── tasks-integration.ts         # Tasks gateway integration
│   │   │   ├── chat-integration.ts          # Chat gateway integration
│   │   │   └── search-integration.ts        # Search gateway integration
│   │   │
│   │   └── config/
│   │       └── integrations.ts              # Updated with all Google services
│   │
│   └── ...
│
├── docs/
│   ├── google-workspace-implementation-plan.md
│   ├── google-workspace-folder-structure.md
│   ├── google-oauth-setup-guide.md          # To be created
│   └── google-workspace-tools-reference.md  # To be created
│
└── docker-compose.yml                       # Updated with all 10 Google services

```

## 🎯 Service Organization by Category

### Communication (2 services, 2 ports)
- **Gmail** (Port 3130) - 45 tools
- **Google Chat** (Port 3138) - 23 tools

### Productivity (3 services, 3 ports)
- **Calendar** (Port 3131) - 26 tools
- **Tasks** (Port 3137) - 16 tools
- **Forms** (Port 3136) - 14 tools

### Storage (1 service, 1 port)
- **Drive** (Port 3132) - 40 tools

### Documents (3 services, 3 ports)
- **Docs** (Port 3133) - 22 tools
- **Sheets** (Port 3134) - 33 tools
- **Slides** (Port 3135) - 25 tools

### Search (1 service, 1 port)
- **Custom Search** (Port 3139) - 6 tools

## 📊 Statistics

- **Total Services**: 10
- **Total Tools**: 280+
- **Total Ports**: 3130-3139 (10 ports)
- **Categories**: 5 (communication, productivity, storage, documents, search)
- **Shared Components**: 2 (google-auth, google-utils)

## 🚀 Benefits of This Structure

1. **UI Organization**: Each service in separate folder → easy to display as separate service cards in UI
2. **Shared Components**: OAuth and utilities reused across all services → DRY principle
3. **Category Grouping**: Services grouped by function → intuitive navigation
4. **Scalability**: Easy to add new Google services (Photos, Keep, etc.) in the future
5. **Consistent Pattern**: Every service follows same structure → easier maintenance
6. **Port Range**: Sequential ports (3130-3139) → easy to remember and configure

## 🔧 Next Steps

1. Create `integrations/shared/google-auth/` with OAuth manager
2. Create `integrations/shared/google-utils/` with shared utilities
3. Implement each service following this exact structure
4. Update gateway with integration modules
5. Configure Docker Compose with all 10 services
