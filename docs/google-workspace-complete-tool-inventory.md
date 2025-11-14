# Google Workspace MCP - COMPLETE Tool Inventory (Updated)

## 🔍 Analysis Summary

After cloning and thoroughly analyzing all 3 reference repositories, here is the **complete and accurate** tool inventory.

### Reference Repositories Analyzed:
1. **taylorwilsdon/google_workspace_mcp** - Python/FastMCP (10 services)
2. **shinzo-labs/gmail-mcp** - TypeScript/MCP SDK (Gmail only - most comprehensive)
3. **muammar-yacoob/GMail-Manager-MCP** - TypeScript (Gmail only - practical focus)

---

## 📊 Exact Tool Counts by Repository

| Repository | Service Coverage | Total Tools | Notes |
|-----------|-----------------|-------------|-------|
| **taylorwilsdon** | 10 services (Gmail, Calendar, Drive, Docs, Sheets, Slides, Forms, Tasks, Chat, Search) | **73 tools** | Best multi-service coverage |
| **shinzo-labs** | Gmail only | **65 tools** | Most comprehensive Gmail implementation |
| **muammar-yacoob** | Gmail only | **12 tools** | Practical inbox management focus |

---

## 🎯 Recommended Implementation Strategy

For our implementation, we should:
1. **Gmail**: Use shinzo-labs as primary reference (65 tools - most complete)
2. **All other services**: Use taylorwilsdon as reference (only multi-service implementation)
3. **Add missing tools**: Extend based on Google API documentation

---

## 📝 COMPLETE Tool Inventory by Service

### 1. Gmail (65 tools) - Based on shinzo-labs/gmail-mcp

#### User Management (3 tools)
1. `get_profile` - Get current user's Gmail profile
2. `watch_mailbox` - Enable push notifications for mailbox changes
3. `stop_mail_watch` - Stop receiving push notifications

#### Messages (11 tools)
4. `list_messages` - List messages with optional filtering
5. `get_message` - Get specific message with full details
6. `send_message` - Send email to recipients
7. `delete_message` - Permanently delete a message
8. `trash_message` - Move message to trash
9. `untrash_message` - Restore message from trash
10. `modify_message` - Modify message labels
11. `batch_modify_messages` - Modify multiple messages at once
12. `batch_delete_messages` - Delete multiple messages at once
13. `get_attachment` - Get message attachment content
14. `import_message` - Import message with internal dates (missing - to add)

#### Labels (6 tools)
15. `list_labels` - List all labels
16. `get_label` - Get specific label
17. `create_label` - Create new label with colors
18. `update_label` - Update label properties (full update)
19. `patch_label` - Partial update of label
20. `delete_label` - Delete a label

#### Threads (6 tools)
21. `list_threads` - List email threads/conversations
22. `get_thread` - Get specific thread with all messages
23. `modify_thread` - Modify thread labels
24. `trash_thread` - Move thread to trash
25. `untrash_thread` - Restore thread from trash
26. `delete_thread` - Permanently delete thread

#### Drafts (5 tools)
27. `list_drafts` - List drafts with filtering
28. `get_draft` - Get specific draft
29. `create_draft` - Create new draft email
30. `update_draft` - Update existing draft content
31. `send_draft` - Send existing draft
32. `delete_draft` - Delete draft (tool 32 in list)

#### Settings - Auto-Forwarding (2 tools)
33. `get_auto_forwarding` - Get auto-forwarding settings
34. `update_auto_forwarding` - Update auto-forwarding settings

#### Settings - IMAP (2 tools)
35. `get_imap` - Get IMAP settings
36. `update_imap` - Update IMAP settings

#### Settings - POP (2 tools)
37. `get_pop` - Get POP settings
38. `update_pop` - Update POP settings

#### Settings - Vacation Responder (2 tools)
39. `get_vacation` - Get vacation responder settings
40. `update_vacation` - Update vacation responder

#### Settings - Language (2 tools)
41. `get_language` - Get language settings
42. `update_language` - Update language settings

#### Settings - Delegates (4 tools)
43. `list_delegates` - List account delegates
44. `get_delegate` - Get specific delegate
45. `add_delegate` - Add new delegate
46. `remove_delegate` - Remove delegate

#### Settings - Filters (4 tools)
47. `list_filters` - List email filters
48. `get_filter` - Get specific filter
49. `create_filter` - Create new filter
50. `delete_filter` - Delete filter

#### Settings - Forwarding Addresses (4 tools)
51. `list_forwarding_addresses` - List forwarding addresses
52. `get_forwarding_address` - Get specific forwarding address
53. `create_forwarding_address` - Create forwarding address
54. `delete_forwarding_address` - Delete forwarding address

#### Settings - Send-As Aliases (7 tools)
55. `list_send_as` - List send-as aliases
56. `get_send_as` - Get specific send-as alias
57. `create_send_as` - Create send-as alias
58. `update_send_as` - Update send-as alias
59. `patch_send_as` - Partial update of send-as alias
60. `delete_send_as` - Delete send-as alias
61. `verify_send_as` - Send verification email

#### Settings - S/MIME (5 tools)
62. `list_smime_info` - List S/MIME configurations
63. `get_smime_info` - Get specific S/MIME config
64. `insert_smime_info` - Upload new S/MIME config
65. `set_default_smime_info` - Set default S/MIME config
66. `delete_smime_info` - Delete S/MIME config

**Gmail Total: 65 tools** (66 if we add `import_message`)

---

### 2. Google Calendar (5 tools) - Based on taylorwilsdon/google_workspace_mcp

1. `list_calendars` - List accessible calendars
2. `get_events` - Retrieve events with time range filtering
3. `create_event` - Create events with attachments & reminders
4. `modify_event` - Update existing events
5. `delete_event` - Remove events

**Additional tools to implement** (from Google Calendar API):
6. `patch_event` - Partial event update
7. `import_event` - Import iCalendar event
8. `move_event` - Move event to different calendar
9. `quick_add_event` - Create event from natural language
10. `get_instances` - List recurring event instances
11. `list_calendar_list` - List calendar list entries
12. `insert_calendar_list` - Add calendar to list
13. `update_calendar_list` - Update calendar list entry
14. `delete_calendar_list` - Remove from calendar list
15. `clear_calendar` - Clear all events from calendar
16. `get_calendar` - Get calendar metadata
17. `insert_calendar` - Create new calendar
18. `update_calendar` - Update calendar properties
19. `patch_calendar` - Partial calendar update
20. `delete_calendar` - Delete calendar
21. `list_acl` - List access control rules
22. `get_acl` - Get specific ACL rule
23. `insert_acl` - Create ACL rule
24. `update_acl` - Update ACL rule
25. `patch_acl` - Partial ACL update
26. `delete_acl` - Delete ACL rule
27. `watch_events` - Set up push notifications
28. `stop_channel` - Stop push notifications
29. `freebusy_query` - Check availability

**Calendar Total: 29 tools** (5 implemented + 24 to add)

---

### 3. Google Drive (7 tools) - Based on taylorwilsdon/google_workspace_mcp

#### Files (currently 7 tools)
1. `search_drive_files` - Search files with query syntax
2. `get_drive_file_content` - Read file content (Office formats)
3. `create_drive_file` - Create files or fetch from URLs
4. `list_drive_items` - List folder contents
5. `update_drive_file` - Update file metadata, move between folders
6. `get_drive_file_permissions` - Get file permissions
7. `check_drive_file_public_access` - Check if file is public

**Additional file tools to implement** (from Google Drive API):
8. `copy_file` - Duplicate file
9. `delete_file` - Move to trash
10. `permanently_delete_file` - Permanent delete
11. `export_file` - Export to different format
12. `generate_ids` - Pre-generate file IDs
13. `watch_file` - Subscribe to file changes
14. `stop_channel` - Unsubscribe from changes
15. `empty_trash` - Clear all trashed items
16. `get_file_revisions` - List file revisions
17. `update_revision` - Update revision metadata
18. `delete_revision` - Delete revision

#### Folders (to implement)
19. `create_folder` - Create directory
20. `move_file` - Move to folder
21. `add_parent` - Add file to folder
22. `remove_parent` - Remove from folder

#### Permissions (to implement)
23. `list_permissions` - Get all permissions
24. `get_permission` - Get permission details
25. `create_permission` - Share file/folder
26. `update_permission` - Modify permissions
27. `delete_permission` - Revoke access

#### Comments (to implement)
28. `list_comments` - List all comments
29. `get_comment` - Get comment details
30. `create_comment` - Add comment
31. `update_comment` - Edit comment
32. `delete_comment` - Remove comment
33. `list_replies` - List comment replies
34. `create_reply` - Reply to comment
35. `update_reply` - Edit reply
36. `delete_reply` - Delete reply

#### Shared Drives (to implement)
37. `list_drives` - List shared drives
38. `get_drive` - Get drive details
39. `create_drive` - Create shared drive
40. `update_drive` - Update drive settings
41. `delete_drive` - Delete shared drive

**Drive Total: 41 tools** (7 implemented + 34 to add)

---

### 4. Google Docs (14 tools) - Based on taylorwilsdon/google_workspace_mcp

#### Document Operations (currently 14 tools)
1. `search_docs` - Find documents by name
2. `get_doc_content` - Extract document text
3. `list_docs_in_folder` - List docs in folder
4. `create_doc` - Create new documents
5. `modify_doc_text` - Modify document text
6. `find_and_replace_doc` - Find and replace text
7. `insert_doc_elements` - Add tables, lists, page breaks
8. `insert_doc_image` - Insert images from Drive/URLs
9. `update_doc_headers_footers` - Modify headers and footers
10. `batch_update_doc` - Execute multiple operations
11. `inspect_doc_structure` - Analyze document structure
12. `create_table_with_data` - Create data tables
13. `debug_table_structure` - Debug table issues
14. `export_doc_to_pdf` - Export document to PDF

#### Comment Tools (dynamically generated)
15. `read_doc_comments` - Read document comments
16. `create_doc_comment` - Create new comment
17. `reply_to_doc_comment` - Reply to comment
18. `resolve_doc_comment` - Resolve comment

**Additional tools to implement**:
19. `delete_doc_content` - Delete content range
20. `insert_inline_image` - Insert inline image
21. `insert_page_break` - Insert page break
22. `create_named_range` - Create bookmark
23. `delete_named_range` - Delete bookmark
24. `update_text_style` - Format text (bold, italic, color, etc.)
25. `update_paragraph_style` - Format paragraphs
26. `create_header` - Add header
27. `create_footer` - Add footer
28. `insert_table_row` - Add table row
29. `insert_table_column` - Add table column
30. `delete_table_row` - Remove row
31. `delete_table_column` - Remove column
32. `merge_table_cells` - Merge cells

**Docs Total: 32 tools** (18 implemented + 14 to add)

---

### 5. Google Sheets (6 tools) - Based on taylorwilsdon/google_workspace_mcp

#### Spreadsheet Operations (currently 6 tools)
1. `list_spreadsheets` - List accessible spreadsheets
2. `get_spreadsheet_info` - Get spreadsheet metadata
3. `read_sheet_values` - Read cell ranges
4. `modify_sheet_values` - Write/update/clear cells
5. `create_spreadsheet` - Create new spreadsheets
6. `create_sheet` - Add sheets to existing files

#### Comment Tools (dynamically generated)
7. `read_sheet_comments` - Read comments
8. `create_sheet_comment` - Create comment
9. `reply_to_sheet_comment` - Reply to comment
10. `resolve_sheet_comment` - Resolve comment

**Additional tools to implement** (from Google Sheets API):
11. `batch_update_spreadsheet` - Batch operations
12. `get_values` - Get cell values
13. `batch_get_values` - Get multiple ranges
14. `update_values` - Update cell values
15. `batch_update_values` - Update multiple ranges
16. `append_values` - Append rows
17. `clear_values` - Clear range
18. `batch_clear_values` - Clear multiple ranges
19. `copy_to` - Copy sheet data
20. `insert_dimension` - Insert rows/columns
21. `delete_dimension` - Delete rows/columns
22. `move_dimension` - Move rows/columns
23. `update_dimension_properties` - Resize/hide
24. `merge_cells` - Merge cell range
25. `unmerge_cells` - Unmerge cells
26. `set_data_validation` - Add validation
27. `set_number_format` - Format numbers
28. `auto_resize_dimensions` - Auto-fit columns
29. `copy_paste` - Copy/paste cells
30. `cut_paste` - Cut/paste cells
31. `find_replace` - Find and replace
32. `text_to_columns` - Split data
33. `sort_range` - Sort data
34. `auto_fill` - Auto-fill series
35. `add_chart` - Create chart
36. `update_chart` - Update chart
37. `delete_chart` - Remove chart
38. `add_protected_range` - Protect cells
39. `update_protected_range` - Update protection
40. `delete_protected_range` - Remove protection

**Sheets Total: 40 tools** (10 implemented + 30 to add)

---

### 6. Google Slides (5 tools) - Based on taylorwilsdon/google_workspace_mcp

#### Presentation Operations (currently 5 tools)
1. `create_presentation` - Create new presentation
2. `get_presentation` - Retrieve presentation details
3. `batch_update_presentation` - Apply multiple updates
4. `get_page` - Get specific slide information
5. `get_page_thumbnail` - Generate slide thumbnails

#### Comment Tools (dynamically generated)
6. `read_presentation_comments` - Read comments
7. `create_presentation_comment` - Create comment
8. `reply_to_presentation_comment` - Reply to comment
9. `resolve_presentation_comment` - Resolve comment

**Additional tools to implement** (from Google Slides API):
10. `create_slide` - Add new slide
11. `delete_slide` - Remove slide
12. `duplicate_slide` - Copy slide
13. `move_slide` - Reorder slides
14. `replace_all_text` - Find and replace text
15. `replace_all_shapes_with_image` - Replace placeholders
16. `insert_text` - Add text box
17. `delete_text` - Remove text
18. `create_shape` - Add shape
19. `delete_shape` - Remove shape
20. `insert_table` - Add table
21. `insert_table_rows` - Add rows
22. `insert_table_columns` - Add columns
23. `delete_table_row` - Remove row
24. `delete_table_column` - Remove column
25. `insert_image` - Add image
26. `create_video` - Embed video
27. `create_line` - Draw line
28. `update_shape_properties` - Format shape
29. `update_text_style` - Format text
30. `update_paragraph_style` - Format paragraph
31. `group_objects` - Group elements
32. `ungroup_objects` - Ungroup elements

**Slides Total: 32 tools** (9 implemented + 23 to add)

---

### 7. Google Forms (5 tools) - Based on taylorwilsdon/google_workspace_mcp

#### Form Operations (currently 5 tools)
1. `create_form` - Create new form
2. `get_form` - Retrieve form details & URLs
3. `set_publish_settings` - Configure form settings
4. `get_form_response` - Get individual responses
5. `list_form_responses` - List all responses with pagination

**Additional tools to implement** (from Google Forms API):
6. `batch_update_form` - Apply multiple updates
7. `add_item` - Add question/item
8. `update_item` - Update question
9. `delete_item` - Remove question
10. `move_item` - Reorder questions
11. `create_watch` - Subscribe to responses
12. `delete_watch` - Unsubscribe
13. `renew_watch` - Renew subscription
14. `create_question` - Add specific question type
15. `update_question` - Modify question
16. `delete_question` - Remove question

**Forms Total: 16 tools** (5 implemented + 11 to add)

---

### 8. Google Tasks (12 tools) - Based on taylorwilsdon/google_workspace_mcp

#### Task Lists (5 tools)
1. `list_task_lists` - List all task lists
2. `get_task_list` - Get task list details
3. `create_task_list` - Create new task list
4. `update_task_list` - Update task list
5. `delete_task_list` - Delete task list

#### Tasks (7 tools)
6. `list_tasks` - List tasks with filtering
7. `get_task` - Get task details
8. `create_task` - Create new task
9. `update_task` - Modify task properties
10. `delete_task` - Remove task
11. `move_task` - Reposition/reparent task
12. `clear_completed_tasks` - Hide completed tasks

**Additional tools to implement**:
13. `patch_task` - Partial task update
14. `patch_task_list` - Partial task list update
15. `mark_completed` - Mark task as done
16. `mark_incomplete` - Mark as not done

**Tasks Total: 16 tools** (12 implemented + 4 to add)

---

### 9. Google Chat (4 tools) - Based on taylorwilsdon/google_workspace_mcp

#### Chat Operations (currently 4 tools)
1. `list_spaces` - List Google Chat spaces/rooms
2. `get_messages` - Retrieve space messages
3. `send_message` - Send messages to spaces
4. `search_messages` - Search across chat history

**Additional tools to implement** (from Google Chat API):
5. `get_space` - Get space details
6. `create_space` - Create new space
7. `update_space` - Update space settings
8. `delete_space` - Delete space
9. `find_direct_message` - Get DM space
10. `get_message` - Get message details
11. `update_message` - Edit message
12. `delete_message` - Delete message
13. `get_attachment` - Download attachment
14. `upload_attachment` - Upload file
15. `list_members` - List space members
16. `get_member` - Get member details
17. `create_membership` - Add member
18. `update_membership` - Update member role
19. `delete_membership` - Remove member
20. `list_reactions` - Get message reactions
21. `create_reaction` - Add reaction
22. `delete_reaction` - Remove reaction
23. `complete_import_space` - Finalize import
24. `setup_space` - Initialize space

**Chat Total: 24 tools** (4 implemented + 20 to add)

---

### 10. Custom Search (3 tools) - Based on taylorwilsdon/google_workspace_mcp

1. `search_custom` - Perform web searches with Programmable Search Engine
2. `search_custom_siterestrict` - Search within specific domains
3. `get_search_engine_info` - Retrieve search engine metadata

**Additional tools to implement**:
4. `create_search_engine` - Create search engine (if API supports)
5. `update_search_engine` - Update search engine settings
6. `delete_search_engine` - Delete search engine

**Search Total: 6 tools** (3 implemented + 3 to add)

---

## 📈 FINAL COMPREHENSIVE TOOL COUNT

| Service | Currently Implemented (Reference Repos) | To Implement (From Google APIs) | **Total Tools** |
|---------|----------------------------------------|---------------------------------|-----------------|
| **Gmail** | 65 | 1 | **66** |
| **Calendar** | 5 | 24 | **29** |
| **Drive** | 7 | 34 | **41** |
| **Docs** | 18 | 14 | **32** |
| **Sheets** | 10 | 30 | **40** |
| **Slides** | 9 | 23 | **32** |
| **Forms** | 5 | 11 | **16** |
| **Tasks** | 12 | 4 | **16** |
| **Chat** | 4 | 20 | **24** |
| **Search** | 3 | 3 | **6** |
| **TOTAL** | **138** | **164** | **302** |

---

## 🎯 Revised Implementation Phases

### Phase 1: Core Services (Priority 1-3) - Week 1
- **Gmail**: 66 tools (use shinzo-labs as reference)
- **Drive**: 41 tools (extend taylorwilsdon implementation)
- **Calendar**: 29 tools (extend taylorwilsdon implementation)

**Subtotal: 136 tools**

### Phase 2: Document Services (Priority 4-6) - Week 2
- **Sheets**: 40 tools
- **Docs**: 32 tools
- **Tasks**: 16 tools

**Subtotal: 88 tools**

### Phase 3: Presentation & Forms (Priority 7-8) - Week 3
- **Slides**: 32 tools
- **Forms**: 16 tools

**Subtotal: 48 tools**

### Phase 4: Communication & Search (Priority 9-10) - Week 3
- **Chat**: 24 tools
- **Search**: 6 tools

**Subtotal: 30 tools**

---

## 🚀 Key Findings & Recommendations

### What Changed from Initial Plan:

**Initial Estimate**: 280 tools
**Actual Complete Implementation**: 302 tools (+22 tools)

### Major Discoveries:

1. **Gmail is more comprehensive than expected** - 66 tools vs initial 45 tools
   - shinzo-labs implementation is production-ready with all settings APIs
   - Includes advanced features: delegates, S/MIME, send-as aliases, filters

2. **Calendar needs more tools** - 29 tools vs initial 26 tools
   - Need ACL management, freebusy queries, push notifications

3. **Drive needs significant expansion** - 41 tools vs initial 40 tools
   - Shared drives support
   - Revision management
   - Comment threading

4. **Sheets needs 40 tools** - vs initial 33 tools
   - Advanced cell operations
   - Chart management
   - Protected ranges

5. **Chat needs expansion** - 24 tools vs initial 23 tools
   - Full membership management
   - Attachment handling
   - Reactions support

### Implementation Priorities:

1. ✅ **Use shinzo-labs/gmail-mcp as Gmail reference** - Most complete (65 tools)
2. ✅ **Use taylorwilsdon for all other services** - Only multi-service implementation
3. ✅ **Extend each service with missing Google API endpoints**
4. ✅ **Maintain multi-tenant OAuth pattern** from our existing MCPs

---

## 📋 Next Steps

1. **Approve this updated plan** with 302 total tools
2. **Decide on implementation approach**:
   - Option A: Implement all 302 tools (comprehensive)
   - Option B: Implement only currently available 138 tools (faster)
   - Option C: Phased approach (136 tools first, then expand)

3. **Begin implementation** using parallel Claude Flow swarms

**Estimated Timeline**:
- Option A (302 tools): 3-4 weeks
- Option B (138 tools): 1.5-2 weeks
- Option C (phased): 1 week for Phase 1, then continue

---

**Repository Clones Available At**:
- `/tmp/google_workspace_mcp` (taylorwilsdon)
- `/tmp/gmail-mcp` (shinzo-labs)
- `/tmp/GMail-Manager-MCP` (muammar-yacoob)

Ready to proceed with implementation! 🚀
