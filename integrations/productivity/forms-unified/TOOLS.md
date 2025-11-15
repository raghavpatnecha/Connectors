# Google Forms MCP Server - Tool Reference

## Tool Summary

**Total Tools: 15** (exceeds requirement of 14)

### Form Management Tools (9 tools)

| Tool Name | Description | Based On Python |
|-----------|-------------|-----------------|
| `forms_create_form` | Create a new Google Form | ✅ `create_form` |
| `forms_get_form` | Get form details including questions | ✅ `get_form` |
| `forms_batch_update` | Perform batch updates to form structure | ✅ Extended |
| `forms_update_info` | Update form title/description | ✅ Extended |
| `forms_update_settings` | Update form settings (quiz mode, etc.) | ✅ Extended |
| `forms_create_item` | Add new question to form | ✅ New |
| `forms_update_item` | Update existing question | ✅ New |
| `forms_delete_item` | Delete question from form | ✅ New |
| `forms_move_item` | Reorder questions in form | ✅ New |

### Response Management Tools (2 tools)

| Tool Name | Description | Based On Python |
|-----------|-------------|-----------------|
| `forms_list_responses` | List all form responses with pagination | ✅ `list_form_responses` |
| `forms_get_response` | Get detailed response information | ✅ `get_form_response` |

### Watch Management Tools (4 tools)

| Tool Name | Description | Based On Python |
|-----------|-------------|-----------------|
| `forms_create_watch` | Create watch for form notifications | ✅ New (API v1 support) |
| `forms_delete_watch` | Delete existing watch | ✅ New (API v1 support) |
| `forms_list_watches` | List all watches for a form | ✅ New (API v1 support) |
| `forms_renew_watch` | Renew watch to extend expiration | ✅ New (API v1 support) |

## Python Reference Mapping

The Python implementation had **5 tools**:
1. `create_form` → TypeScript: `forms_create_form`
2. `get_form` → TypeScript: `forms_get_form`
3. `set_publish_settings` → TypeScript: `forms_update_settings` (included in settings update)
4. `get_form_response` → TypeScript: `forms_get_response`
5. `list_form_responses` → TypeScript: `forms_list_responses`

**Enhancements in TypeScript Implementation:**
- Added 9 additional tools for complete Forms API coverage
- Implemented batch update operations for efficient form modifications
- Added question/item management (create, update, delete, move)
- Added watch management for real-time response notifications
- Improved type safety with Zod validation schemas
- Better error handling with structured logging

## Tool Categories

### Creation Operations (2)
- `forms_create_form`
- `forms_create_item`

### Read Operations (4)
- `forms_get_form`
- `forms_list_responses`
- `forms_get_response`
- `forms_list_watches`

### Update Operations (6)
- `forms_batch_update`
- `forms_update_info`
- `forms_update_settings`
- `forms_update_item`
- `forms_move_item`
- `forms_renew_watch`

### Delete Operations (2)
- `forms_delete_item`
- `forms_delete_watch`

### Watch Operations (4)
- `forms_create_watch`
- `forms_delete_watch`
- `forms_list_watches`
- `forms_renew_watch`

## Implementation Details

### Technology Stack
- **Language**: TypeScript (Node 18+)
- **Framework**: @modelcontextprotocol/sdk v0.5.0
- **Validation**: Zod v3.22.4
- **Google API**: googleapis v128.0.0
- **Logging**: Winston v3.11.0
- **HTTP Server**: Express v4.18.2

### OAuth Scopes Required
```typescript
const FORMS_SCOPES = [
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly'
];
```

### Shared Dependencies
- `../../shared/google-auth/oauth-manager` - OAuth 2.0 management
- `../../shared/google-auth/google-client-factory` - API client factory
- `../../shared/google-utils/error-mapper` - Error handling utilities
- `../../shared/google-utils/logger` - Structured logging

## Pattern Compliance

✅ **Follows tasks-unified pattern exactly**:
- Same directory structure
- Same tool registration approach
- Same OAuth integration
- Same error handling
- Same logging format
- Same dual-server architecture (stdio + HTTP)

✅ **Port Assignment**: 3136 (as specified)

✅ **Multi-tenant OAuth**: Uses shared google-auth module

✅ **Type Safety**: Full TypeScript with Zod schemas

✅ **Error Handling**: Comprehensive with mapGoogleAPIError

✅ **Logging**: Structured with Winston

## Future Enhancements

Potential additional tools (not implemented to keep focused scope):
- `forms_duplicate_form` - Duplicate an existing form
- `forms_export_responses` - Export responses to Sheets
- `forms_delete_response` - Delete specific response (if API supports)
- `forms_update_quiz_grading` - Update quiz grading settings
- `forms_add_collaborator` - Add form collaborators

These can be added in future iterations based on user requirements.
