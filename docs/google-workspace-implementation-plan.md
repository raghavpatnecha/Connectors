# Google Workspace MCP Integration - Implementation Plan

## 📋 Executive Summary

Implement 10 Google Workspace MCP servers with multi-tenant OAuth 2.0, following the Connectors Platform architecture:
- Gmail, Calendar, Drive, Docs, Sheets, Slides, Forms, Tasks, Chat, Custom Search
- Multi-tenant OAuth with HashiCorp Vault credential storage
- Unified gateway integration with semantic routing
- TypeScript implementation following existing patterns

**Estimated Timeline**: 25-30 hours total
**Priority Order**: Gmail → Drive → Calendar → Sheets → Docs → Tasks → Slides → Forms → Chat → Search

---

## 🎯 Goals & Success Criteria

### Primary Goals
1. ✅ Implement 10 production-ready Google Workspace MCP servers
2. ✅ Multi-tenant OAuth 2.0 with Vault-based credential storage
3. ✅ Gateway integration with semantic routing
4. ✅ 80+ tools across all services
5. ✅ Proper folder organization for UI display

### Success Criteria
- All services pass OAuth flow test
- Tools invocable via gateway API
- Health checks passing
- Docker Compose deployment working
- Documentation complete

---

## 📊 Repository Analysis Summary

### Reference Repository 1: taylorwilsdon/google_workspace_mcp
**Tech Stack**: Python, FastMCP
**Services**: Gmail, Drive, Calendar, Docs, Sheets, Slides, Forms, Chat, Tasks, PSE
**Key Features**:
- Three-tier tool architecture (core/extended/complete)
- Desktop OAuth 2.0 (no redirect URIs)
- Service-specific modules
- Progressive tool loading

**Learnings**:
- Tier-based tool organization reduces complexity
- Single OAuth config for all Google services
- googleapis library best for API integration

### Reference Repository 2: muammar-yacoob/GMail-Manager-MCP
**Tech Stack**: TypeScript, Node.js
**Services**: Gmail only (11+ tools)
**Key Features**:
- OAuth 2.0 browser flow
- Batch operations (labels, deletion)
- Inbox analytics
- Smart reply drafts

**Learnings**:
- TypeScript provides type safety
- Batch operations crucial for performance
- Label management highly requested feature
- Analytics adds value beyond basic CRUD

### Reference Repository 3: shinzo-labs/gmail-mcp
**Tech Stack**: TypeScript, Node.js, MCP SDK
**Services**: Gmail (comprehensive)
**Key Features**:
- Push notifications (watch_mailbox)
- S/MIME certificate management
- Multi-transport (stdio + HTTP)
- Delegate access support

**Learnings**:
- MCP SDK best for protocol compliance
- Push notifications enable real-time updates
- Multi-user auth requires refresh token storage
- Settings management often overlooked but important

---

## 🏗️ Architecture Design

### Folder Structure

```
integrations/
├── shared/
│   ├── google-auth/                  # Shared OAuth components
│   │   ├── oauth-manager.ts          # OAuth 2.0 flow handler
│   │   ├── vault-client.ts           # Vault integration
│   │   └── google-client-factory.ts  # googleapis client factory
│   └── google-utils/                 # Shared utilities
│       ├── error-mapper.ts           # Google API error mapping
│       ├── batch-helper.ts           # Batch operation utilities
│       └── types.ts                  # Shared TypeScript types
│
├── communication/
│   ├── gmail-unified/                # Gmail MCP Server
│   │   ├── src/
│   │   │   ├── index.ts              # Main entry (stdio + HTTP)
│   │   │   ├── tools/
│   │   │   │   ├── messages.ts       # 15+ message tools
│   │   │   │   ├── labels.ts         # 8+ label tools
│   │   │   │   ├── threads.ts        # 6+ thread tools
│   │   │   │   ├── drafts.ts         # 5+ draft tools
│   │   │   │   ├── settings.ts       # 10+ settings tools
│   │   │   │   └── index.ts
│   │   │   ├── clients/
│   │   │   │   └── gmail-client.ts   # gmail.users.messages.* wrapper
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── chat-unified/                 # Google Chat MCP Server
│       ├── src/
│       │   ├── index.ts
│       │   ├── tools/
│       │   │   ├── spaces.ts         # 8+ space tools
│       │   │   ├── messages.ts       # 10+ message tools
│       │   │   └── members.ts        # 5+ member tools
│       │   └── clients/
│       │       └── chat-client.ts
│       └── package.json
│
├── productivity/
│   ├── calendar-unified/             # Google Calendar MCP Server
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── tools/
│   │   │   │   ├── events.ts         # 12+ event tools
│   │   │   │   ├── calendars.ts      # 8+ calendar tools
│   │   │   │   └── acl.ts            # 6+ ACL tools
│   │   │   └── clients/
│   │   │       └── calendar-client.ts
│   │   └── package.json
│   │
│   ├── tasks-unified/                # Google Tasks MCP Server
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── tools/
│   │   │   │   ├── tasklists.ts      # 6+ tasklist tools
│   │   │   │   └── tasks.ts          # 10+ task tools
│   │   │   └── clients/
│   │   │       └── tasks-client.ts
│   │   └── package.json
│   │
│   └── forms-unified/                # Google Forms MCP Server
│       ├── src/
│       │   ├── index.ts
│       │   ├── tools/
│       │   │   ├── forms.ts          # 8+ form tools
│       │   │   └── responses.ts      # 6+ response tools
│       │   └── clients/
│       │       └── forms-client.ts
│       └── package.json
│
├── storage/
│   └── drive-unified/                # Google Drive MCP Server
│       ├── src/
│       │   ├── index.ts
│       │   ├── tools/
│       │   │   ├── files.ts          # 15+ file tools
│       │   │   ├── folders.ts        # 8+ folder tools
│       │   │   ├── permissions.ts    # 10+ permission tools
│       │   │   └── comments.ts       # 6+ comment tools
│       │   └── clients/
│       │       └── drive-client.ts
│       └── package.json
│
└── documents/
    ├── docs-unified/                 # Google Docs MCP Server
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── tools/
    │   │   │   ├── documents.ts      # 10+ document tools
    │   │   │   └── content.ts        # 12+ content editing tools
    │   │   └── clients/
    │   │       └── docs-client.ts
    │   └── package.json
    │
    ├── sheets-unified/               # Google Sheets MCP Server
    │   ├── src/
    │   │   ├── index.ts
    │   │   ├── tools/
    │   │   │   ├── spreadsheets.ts   # 10+ spreadsheet tools
    │   │   │   ├── cells.ts          # 15+ cell manipulation tools
    │   │   │   └── charts.ts         # 8+ chart tools
    │   │   └── clients/
    │   │       └── sheets-client.ts
    │   └── package.json
    │
    └── slides-unified/               # Google Slides MCP Server
        ├── src/
        │   ├── index.ts
        │   ├── tools/
        │   │   ├── presentations.ts  # 10+ presentation tools
        │   │   └── elements.ts       # 15+ element tools
        │   └── clients/
        │       └── slides-client.ts
        └── package.json
```

### Port Allocation

```
3130 - Gmail MCP Server
3131 - Calendar MCP Server
3132 - Drive MCP Server
3133 - Docs MCP Server
3134 - Sheets MCP Server
3135 - Slides MCP Server
3136 - Forms MCP Server
3137 - Tasks MCP Server
3138 - Chat MCP Server
3139 - Custom Search MCP Server
```

---

## 🔐 Shared OAuth Configuration

### Google OAuth 2.0 Setup

**Single OAuth Client for All Services** (best practice):

```typescript
// integrations/shared/google-auth/oauth-config.ts

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth/callback/google',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  scopes: [
    // Gmail scopes
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.labels',
    'https://www.googleapis.com/auth/gmail.settings.basic',

    // Calendar scopes
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',

    // Drive scopes
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata',

    // Docs/Sheets/Slides scopes
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/presentations',

    // Forms scopes
    'https://www.googleapis.com/auth/forms',
    'https://www.googleapis.com/auth/forms.responses.readonly',

    // Tasks scopes
    'https://www.googleapis.com/auth/tasks',

    // Chat scopes
    'https://www.googleapis.com/auth/chat.spaces',
    'https://www.googleapis.com/auth/chat.messages'
  ]
};
```

### Vault Credential Storage

**Path Convention**: `secret/data/{tenantId}/google`

**Stored Data**:
```json
{
  "access_token": "ya29.a0AfH6SMBx...",
  "refresh_token": "1//0gKFQoMr...",
  "expires_at": 1703980800000,
  "scope": "https://www.googleapis.com/auth/gmail.modify ...",
  "token_type": "Bearer"
}
```

---

## 🛠️ Tool Inventory by Service

### 1. Gmail (45+ tools) - Priority 1

**Messages (15 tools)**:
- `gmail_list_messages` - List messages with filters
- `gmail_get_message` - Get full message with headers
- `gmail_send_message` - Send email with attachments
- `gmail_send_reply` - Reply to thread
- `gmail_forward_message` - Forward email
- `gmail_delete_message` - Move to trash
- `gmail_permanently_delete_message` - Permanent delete
- `gmail_modify_message` - Add/remove labels
- `gmail_batch_modify_messages` - Bulk label operations
- `gmail_batch_delete_messages` - Bulk delete
- `gmail_get_attachment` - Download attachment
- `gmail_import_message` - Import raw RFC822 email
- `gmail_insert_message` - Insert with internal dates
- `gmail_trash_message` - Move to trash
- `gmail_untrash_message` - Restore from trash

**Labels (8 tools)**:
- `gmail_list_labels` - Get all labels
- `gmail_get_label` - Get label details
- `gmail_create_label` - Create new label
- `gmail_update_label` - Update label properties
- `gmail_patch_label` - Partial label update
- `gmail_delete_label` - Delete label
- `gmail_apply_label` - Apply to message
- `gmail_remove_label` - Remove from message

**Threads (6 tools)**:
- `gmail_list_threads` - List conversations
- `gmail_get_thread` - Get full thread
- `gmail_modify_thread` - Modify all messages in thread
- `gmail_trash_thread` - Trash conversation
- `gmail_untrash_thread` - Restore conversation
- `gmail_delete_thread` - Permanently delete conversation

**Drafts (5 tools)**:
- `gmail_list_drafts` - List all drafts
- `gmail_get_draft` - Get draft content
- `gmail_create_draft` - Create new draft
- `gmail_update_draft` - Update draft
- `gmail_send_draft` - Send existing draft

**Settings (11 tools)**:
- `gmail_get_auto_forwarding` - Get forwarding settings
- `gmail_update_auto_forwarding` - Update forwarding
- `gmail_get_imap_settings` - Get IMAP config
- `gmail_update_imap_settings` - Update IMAP
- `gmail_get_pop_settings` - Get POP config
- `gmail_update_pop_settings` - Update POP
- `gmail_get_vacation_settings` - Get auto-reply
- `gmail_update_vacation_settings` - Update auto-reply
- `gmail_list_filters` - List email filters
- `gmail_create_filter` - Create filter
- `gmail_delete_filter` - Delete filter

### 2. Google Drive (40+ tools) - Priority 2

**Files (15 tools)**:
- `drive_list_files` - List with query filters
- `drive_get_file` - Get file metadata
- `drive_get_file_content` - Download content
- `drive_create_file` - Upload new file
- `drive_update_file` - Update existing file
- `drive_copy_file` - Duplicate file
- `drive_delete_file` - Move to trash
- `drive_permanently_delete_file` - Permanent delete
- `drive_export_file` - Export to different format
- `drive_watch_file` - Subscribe to changes
- `drive_empty_trash` - Clear trash
- `drive_generate_ids` - Pre-generate file IDs
- `drive_search_files` - Advanced search
- `drive_get_file_revisions` - List revisions
- `drive_restore_revision` - Rollback to version

**Folders (8 tools)**:
- `drive_create_folder` - Create directory
- `drive_list_folder_contents` - List children
- `drive_move_file` - Move to folder
- `drive_add_parent` - Add to multiple folders
- `drive_remove_parent` - Remove from folder
- `drive_get_folder_tree` - Recursive structure
- `drive_create_shortcut` - Create shortcut
- `drive_rename_folder` - Update folder name

**Permissions (10 tools)**:
- `drive_list_permissions` - Get all permissions
- `drive_get_permission` - Get permission details
- `drive_create_permission` - Share file/folder
- `drive_update_permission` - Modify permissions
- `drive_delete_permission` - Revoke access
- `drive_batch_permissions` - Bulk permission changes
- `drive_transfer_ownership` - Change owner
- `drive_get_shared_with_me` - Files shared to user
- `drive_create_shared_drive` - Create team drive
- `drive_list_shared_drives` - List team drives

**Comments (7 tools)**:
- `drive_list_comments` - List all comments
- `drive_get_comment` - Get comment details
- `drive_create_comment` - Add comment
- `drive_update_comment` - Edit comment
- `drive_delete_comment` - Remove comment
- `drive_list_replies` - List comment replies
- `drive_create_reply` - Reply to comment

### 3. Google Calendar (26+ tools) - Priority 3

**Events (12 tools)**:
- `calendar_list_events` - List with filters
- `calendar_get_event` - Get event details
- `calendar_create_event` - Create new event
- `calendar_quick_add_event` - Natural language creation
- `calendar_update_event` - Update event
- `calendar_patch_event` - Partial update
- `calendar_delete_event` - Delete event
- `calendar_import_event` - Import iCalendar
- `calendar_move_event` - Move to different calendar
- `calendar_watch_events` - Subscribe to changes
- `calendar_get_instances` - List recurring instances
- `calendar_stop_watch` - Unsubscribe from changes

**Calendars (8 tools)**:
- `calendar_list_calendars` - List all calendars
- `calendar_get_calendar` - Get calendar details
- `calendar_create_calendar` - Create new calendar
- `calendar_update_calendar` - Update calendar
- `calendar_patch_calendar` - Partial calendar update
- `calendar_delete_calendar` - Delete calendar
- `calendar_clear_calendar` - Remove all events
- `calendar_get_freebusy` - Check availability

**ACL (6 tools)**:
- `calendar_list_acl` - List access rules
- `calendar_get_acl_rule` - Get rule details
- `calendar_insert_acl` - Grant access
- `calendar_update_acl` - Update permissions
- `calendar_patch_acl` - Partial ACL update
- `calendar_delete_acl` - Revoke access

### 4. Google Sheets (33+ tools) - Priority 4

**Spreadsheets (10 tools)**:
- `sheets_create_spreadsheet` - Create new sheet
- `sheets_get_spreadsheet` - Get metadata
- `sheets_batch_update` - Batch operations
- `sheets_get_values` - Read cell values
- `sheets_batch_get_values` - Read multiple ranges
- `sheets_update_values` - Write to cells
- `sheets_batch_update_values` - Write multiple ranges
- `sheets_append_values` - Append rows
- `sheets_clear_values` - Clear range
- `sheets_batch_clear_values` - Clear multiple ranges

**Cell Operations (15 tools)**:
- `sheets_insert_dimension` - Insert rows/columns
- `sheets_delete_dimension` - Delete rows/columns
- `sheets_move_dimension` - Move rows/columns
- `sheets_update_dimension_properties` - Resize/hide
- `sheets_merge_cells` - Merge range
- `sheets_unmerge_cells` - Unmerge
- `sheets_set_data_validation` - Add validation
- `sheets_set_number_format` - Format numbers
- `sheets_auto_resize_dimensions` - Auto-fit
- `sheets_copy_paste` - Copy/paste cells
- `sheets_cut_paste` - Cut/paste cells
- `sheets_find_replace` - Find and replace
- `sheets_text_to_columns` - Split data
- `sheets_sort_range` - Sort data
- `sheets_auto_fill` - Auto-fill series

**Charts (8 tools)**:
- `sheets_add_chart` - Create chart
- `sheets_update_chart` - Update chart
- `sheets_delete_chart` - Remove chart
- `sheets_move_chart` - Reposition chart
- `sheets_update_chart_spec` - Update chart type
- `sheets_add_protected_range` - Protect cells
- `sheets_update_protected_range` - Update protection
- `sheets_delete_protected_range` - Remove protection

### 5. Google Docs (22+ tools) - Priority 5

**Documents (10 tools)**:
- `docs_create_document` - Create new doc
- `docs_get_document` - Get content
- `docs_batch_update` - Apply multiple updates
- `docs_insert_text` - Add text
- `docs_delete_content_range` - Remove text
- `docs_replace_all_text` - Find and replace
- `docs_insert_page_break` - Add page break
- `docs_insert_table` - Add table
- `docs_insert_inline_image` - Add image
- `docs_create_named_range` - Create bookmark

**Content Editing (12 tools)**:
- `docs_update_text_style` - Format text (bold, italic, etc.)
- `docs_update_paragraph_style` - Format paragraphs
- `docs_create_header` - Add header
- `docs_create_footer` - Add footer
- `docs_update_document_style` - Update margins/size
- `docs_create_bullet_list` - Add bullets
- `docs_create_numbered_list` - Add numbering
- `docs_insert_table_row` - Add table row
- `docs_insert_table_column` - Add table column
- `docs_delete_table_row` - Remove row
- `docs_delete_table_column` - Remove column
- `docs_merge_table_cells` - Merge cells

### 6. Google Tasks (16+ tools) - Priority 6

**Task Lists (6 tools)**:
- `tasks_list_task_lists` - List all task lists
- `tasks_get_task_list` - Get list details
- `tasks_insert_task_list` - Create list
- `tasks_update_task_list` - Update list
- `tasks_patch_task_list` - Partial update
- `tasks_delete_task_list` - Delete list

**Tasks (10 tools)**:
- `tasks_list_tasks` - List tasks in list
- `tasks_get_task` - Get task details
- `tasks_insert_task` - Create new task
- `tasks_update_task` - Update task
- `tasks_patch_task` - Partial task update
- `tasks_delete_task` - Delete task
- `tasks_move_task` - Reorder/reparent task
- `tasks_clear_completed_tasks` - Clear completed
- `tasks_mark_completed` - Mark as done
- `tasks_mark_incomplete` - Mark as not done

### 7. Google Slides (25+ tools) - Priority 7

**Presentations (10 tools)**:
- `slides_create_presentation` - Create new presentation
- `slides_get_presentation` - Get content
- `slides_batch_update` - Apply multiple updates
- `slides_create_slide` - Add new slide
- `slides_delete_slide` - Remove slide
- `slides_duplicate_slide` - Copy slide
- `slides_move_slide` - Reorder slides
- `slides_replace_all_text` - Find and replace
- `slides_replace_all_shapes_with_image` - Replace placeholders
- `slides_create_shape` - Add shape

**Elements (15 tools)**:
- `slides_insert_text` - Add text box
- `slides_delete_text` - Remove text
- `slides_insert_table` - Add table
- `slides_insert_table_rows` - Add rows
- `slides_insert_table_columns` - Add columns
- `slides_delete_table_row` - Remove row
- `slides_delete_table_column` - Remove column
- `slides_insert_image` - Add image
- `slides_create_video` - Embed video
- `slides_create_line` - Draw line
- `slides_update_shape_properties` - Format shape
- `slides_update_text_style` - Format text
- `slides_update_paragraph_style` - Format paragraph
- `slides_group_objects` - Group elements
- `slides_ungroup_objects` - Ungroup elements

### 8. Google Forms (14+ tools) - Priority 8

**Forms (8 tools)**:
- `forms_create_form` - Create new form
- `forms_get_form` - Get form structure
- `forms_batch_update_form` - Update form
- `forms_delete_form` - Delete form
- `forms_add_item` - Add question
- `forms_update_item` - Update question
- `forms_delete_item` - Remove question
- `forms_move_item` - Reorder questions

**Responses (6 tools)**:
- `forms_list_responses` - Get all responses
- `forms_get_response` - Get single response
- `forms_delete_response` - Delete response
- `forms_get_form_watches` - List watchers
- `forms_create_watch` - Subscribe to responses
- `forms_delete_watch` - Unsubscribe

### 9. Google Chat (23+ tools) - Priority 9

**Spaces (8 tools)**:
- `chat_list_spaces` - List all spaces
- `chat_get_space` - Get space details
- `chat_create_space` - Create new space
- `chat_update_space` - Update space settings
- `chat_delete_space` - Delete space
- `chat_find_direct_message` - Get DM space
- `chat_complete_import_space` - Finalize import
- `chat_setup_space` - Initialize space

**Messages (10 tools)**:
- `chat_list_messages` - List messages in space
- `chat_get_message` - Get message details
- `chat_create_message` - Send message
- `chat_update_message` - Edit message
- `chat_delete_message` - Delete message
- `chat_get_attachment` - Download attachment
- `chat_upload_attachment` - Upload file
- `chat_list_reactions` - Get reactions
- `chat_create_reaction` - Add reaction
- `chat_delete_reaction` - Remove reaction

**Members (5 tools)**:
- `chat_list_members` - List space members
- `chat_get_member` - Get member details
- `chat_create_membership` - Add member
- `chat_update_membership` - Update role
- `chat_delete_membership` - Remove member

### 10. Custom Search (6 tools) - Priority 10

**Search (6 tools)**:
- `search_create_engine` - Create search engine
- `search_get_engine` - Get engine config
- `search_update_engine` - Update settings
- `search_delete_engine` - Delete engine
- `search_query` - Execute search
- `search_get_siterestrict` - Get site restrictions

---

## 📅 Implementation Timeline

### Week 1 (Days 1-5): Foundation + High Priority Services

**Day 1 (6 hours)**: Shared Components
- ✅ Create `integrations/shared/google-auth/`
- ✅ Implement `oauth-manager.ts` (Google OAuth 2.0 flow)
- ✅ Implement `vault-client.ts` (reuse from GitHub MCP)
- ✅ Implement `google-client-factory.ts` (googleapis wrapper)
- ✅ Create `integrations/shared/google-utils/`
- ✅ Implement error mapping utilities

**Day 2-3 (12 hours)**: Gmail MCP Server
- ✅ Create `integrations/communication/gmail-unified/`
- ✅ Implement 45+ Gmail tools (messages, labels, threads, drafts, settings)
- ✅ Create Gmail client wrapper
- ✅ Implement batch operations
- ✅ Add push notification support
- ✅ Write Dockerfile and tests

**Day 4 (6 hours)**: Drive MCP Server
- ✅ Create `integrations/storage/drive-unified/`
- ✅ Implement 40+ Drive tools (files, folders, permissions, comments)
- ✅ Handle file uploads/downloads
- ✅ Implement sharing workflows
- ✅ Write Dockerfile

**Day 5 (6 hours)**: Calendar MCP Server
- ✅ Create `integrations/productivity/calendar-unified/`
- ✅ Implement 26+ Calendar tools (events, calendars, ACL)
- ✅ Support recurring events
- ✅ Implement freebusy queries
- ✅ Write Dockerfile

### Week 2 (Days 6-10): Medium Priority Services

**Day 6 (5 hours)**: Sheets MCP Server
- ✅ Create `integrations/documents/sheets-unified/`
- ✅ Implement 33+ Sheets tools (spreadsheets, cells, charts)
- ✅ Support batch operations
- ✅ Implement formulas and formatting
- ✅ Write Dockerfile

**Day 7 (4 hours)**: Docs MCP Server
- ✅ Create `integrations/documents/docs-unified/`
- ✅ Implement 22+ Docs tools (documents, content editing)
- ✅ Support rich text formatting
- ✅ Implement table operations
- ✅ Write Dockerfile

**Day 8 (3 hours)**: Tasks MCP Server
- ✅ Create `integrations/productivity/tasks-unified/`
- ✅ Implement 16+ Tasks tools (task lists, tasks)
- ✅ Support task hierarchies
- ✅ Write Dockerfile

**Day 9 (4 hours)**: Slides MCP Server
- ✅ Create `integrations/documents/slides-unified/`
- ✅ Implement 25+ Slides tools (presentations, elements)
- ✅ Support shapes and images
- ✅ Write Dockerfile

**Day 10 (3 hours)**: Forms MCP Server
- ✅ Create `integrations/productivity/forms-unified/`
- ✅ Implement 14+ Forms tools (forms, responses)
- ✅ Support question types
- ✅ Write Dockerfile

### Week 3 (Days 11-12): Low Priority + Integration

**Day 11 (4 hours)**: Chat + Search MCP Servers
- ✅ Create `integrations/communication/chat-unified/`
- ✅ Implement 23+ Chat tools (spaces, messages, members)
- ✅ Create `integrations/search/custom-search-unified/`
- ✅ Implement 6+ Search tools
- ✅ Write Dockerfiles

**Day 12 (6 hours)**: Gateway Integration
- ✅ Create 10 gateway integration modules
- ✅ Register OAuth configs
- ✅ Index tools in semantic router
- ✅ Implement rate limiters
- ✅ Add health checks
- ✅ Update `integrations.ts` registry

**Day 13 (4 hours)**: Docker Compose + Testing
- ✅ Add all services to `docker-compose.yml`
- ✅ Configure environment variables
- ✅ Test OAuth flows for all services
- ✅ Test tool invocations
- ✅ Verify health checks

**Day 14 (2 hours)**: Documentation
- ✅ Update README.md
- ✅ Create service-specific docs
- ✅ Document OAuth setup
- ✅ Create example requests

---

## 🔧 Implementation Details

### Shared OAuth Manager

```typescript
// integrations/shared/google-auth/oauth-manager.ts

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { VaultClient } from './vault-client.js';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class GoogleOAuthManager {
  private readonly _oauth2Client: OAuth2Client;
  private readonly _vaultClient: VaultClient;

  constructor(config: GoogleOAuthConfig, vaultClient: VaultClient) {
    this._oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
    this._vaultClient = vaultClient;
  }

  generateAuthUrl(tenantId: string, scopes: string[]): string {
    const state = `${tenantId}:${Date.now().toString(36)}:${Math.random().toString(36)}`;

    return this._oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state,
      prompt: 'consent' // Force refresh token generation
    });
  }

  async handleCallback(code: string, tenantId: string): Promise<void> {
    const { tokens } = await this._oauth2Client.getToken(code);

    await this._vaultClient.write(`secret/data/${tenantId}/google`, {
      data: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date,
        scope: tokens.scope,
        token_type: tokens.token_type
      }
    });
  }

  async getCredentials(tenantId: string): Promise<OAuth2Client> {
    const result = await this._vaultClient.read(`secret/data/${tenantId}/google`);
    const tokens = result.data.data;

    this._oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expires_at
    });

    // Auto-refresh if expired
    if (Date.now() >= tokens.expires_at) {
      const { credentials } = await this._oauth2Client.refreshAccessToken();
      await this.handleCallback(credentials.access_token!, tenantId);
    }

    return this._oauth2Client;
  }
}
```

### Google Client Factory

```typescript
// integrations/shared/google-auth/google-client-factory.ts

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GoogleOAuthManager } from './oauth-manager.js';

export class GoogleClientFactory {
  constructor(private oauthManager: GoogleOAuthManager) {}

  async getGmailClient(tenantId: string) {
    const auth = await this.oauthManager.getCredentials(tenantId);
    return google.gmail({ version: 'v1', auth });
  }

  async getCalendarClient(tenantId: string) {
    const auth = await this.oauthManager.getCredentials(tenantId);
    return google.calendar({ version: 'v3', auth });
  }

  async getDriveClient(tenantId: string) {
    const auth = await this.oauthManager.getCredentials(tenantId);
    return google.drive({ version: 'v3', auth });
  }

  async getDocsClient(tenantId: string) {
    const auth = await this.oauthManager.getCredentials(tenantId);
    return google.docs({ version: 'v1', auth });
  }

  async getSheetsClient(tenantId: string) {
    const auth = await this.oauthManager.getCredentials(tenantId);
    return google.sheets({ version: 'v4', auth });
  }

  async getSlidesClient(tenantId: string) {
    const auth = await this.oauthManager.getCredentials(tenantId);
    return google.slides({ version: 'v1', auth });
  }

  async getFormsClient(tenantId: string) {
    const auth = await this.oauthManager.getCredentials(tenantId);
    return google.forms({ version: 'v1', auth });
  }

  async getTasksClient(tenantId: string) {
    const auth = await this.oauthManager.getCredentials(tenantId);
    return google.tasks({ version: 'v1', auth });
  }

  async getChatClient(tenantId: string) {
    const auth = await this.oauthManager.getCredentials(tenantId);
    return google.chat({ version: 'v1', auth });
  }

  async getCustomSearchClient(tenantId: string) {
    const auth = await this.oauthManager.getCredentials(tenantId);
    return google.customsearch({ version: 'v1', auth });
  }
}
```

---

## 🚀 Next Steps

1. **Approve Plan**: Review and approve this implementation plan
2. **Setup Google OAuth**: Create OAuth client credentials in Google Cloud Console
3. **Execute Implementation**: Follow day-by-day timeline
4. **Test & Validate**: Ensure all services work end-to-end
5. **Deploy**: Update production Docker Compose configuration

---

## 📚 References

- [Google Workspace APIs](https://developers.google.com/workspace)
- [googleapis Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- Reference Repositories:
  - taylorwilsdon/google_workspace_mcp
  - muammar-yacoob/GMail-Manager-MCP
  - shinzo-labs/gmail-mcp

---

**Total Estimated Effort**: 70+ hours (2 developers @ 35 hours each or 1 developer @ 2 weeks)
**Priority Services**: Gmail → Drive → Calendar (cover 80% of use cases)
**Tool Count**: 280+ tools across 10 services
