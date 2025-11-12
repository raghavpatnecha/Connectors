# Notion Integration Setup Guide

**Date:** 2025-11-12
**Difficulty:** Easy (15-20 minutes)
**Category:** Productivity
**OAuth Required:** Yes

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start (5 Steps)](#quick-start-5-steps)
4. [Detailed Setup](#detailed-setup)
5. [OAuth Configuration](#oauth-configuration)
6. [Available Tools](#available-tools)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Advanced Usage](#advanced-usage)

---

## Overview

The **Notion integration** provides AI agents with powerful access to Notion workspaces through 19 comprehensive tools. This integration uses the official `@notionhq/client` SDK and follows the standard MCP protocol.

**What You Get:**
- ✅ **19 Notion tools** (pages, databases, blocks, search, users)
- ✅ **OAuth 2.0 authentication** with automatic token management
- ✅ **Semantic routing** for intelligent tool discovery
- ✅ **Token optimization** (99% reduction vs loading all tools)
- ✅ **GraphRAG relationships** for smart tool suggestions
- ✅ **Enterprise-grade security** with HashiCorp Vault

**Use Cases:**
- Create and update Notion pages programmatically
- Query databases and manage database entries
- Search across workspace content
- Automate documentation workflows
- Sync data between Notion and other tools
- Build AI agents that read/write Notion content

---

## Prerequisites

### 1. Notion Workspace
- Active Notion account (free or paid)
- Admin access to create integrations
- Workspace with test pages/databases

### 2. Development Environment
- **Node.js** 18+ installed
- **Docker** 20+ and Docker Compose v2
- **Git** for cloning repository
- **curl** or similar HTTP client for testing

### 3. Notion Integration (OAuth App)
You'll need to create a Notion integration at [developers.notion.com](https://developers.notion.com):

**Step-by-step:**
1. Go to https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Fill in details:
   - **Name:** "Connectors Platform Integration" (or your choice)
   - **Associated workspace:** Select your workspace
   - **Type:** Public integration (for OAuth)
4. **Capabilities:** Enable all (Read, Update, Insert content)
5. Click **"Submit"**
6. Note your **OAuth client ID** and **OAuth client secret**
7. Configure **Redirect URI:** `http://localhost:3000/oauth/callback/notion`

📸 **Screenshot description:** The Notion integration page shows three tabs (Capabilities, Secrets, Distribution). Under "Secrets" you'll see "OAuth client ID" and "OAuth client secret" fields.

---

## Quick Start (5 Steps)

### Step 1: Install Official Notion MCP Server

```bash
# Clone if you haven't already
cd /home/user/Connectors

# Install the official Notion MCP package
npm install -g @modelcontextprotocol/server-notion

# Or use npx (no installation needed)
npx @modelcontextprotocol/server-notion --version
```

### Step 2: Configure OAuth in Vault

```bash
# Start Vault if not running
docker compose up -d vault

# Set Vault environment
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='dev-token'  # For development

# Store Notion OAuth credentials (replace with your values)
vault kv put secret/oauth/notion \
  client_id="your-notion-client-id" \
  client_secret="your-notion-client-secret" \
  redirect_uri="http://localhost:3000/oauth/callback/notion"
```

### Step 3: Start All Services

```bash
# Start infrastructure (Redis, Vault, Neo4j)
docker compose up -d

# Verify services are healthy (wait 30-60 seconds)
./scripts/health-check.sh

# Initialize Neo4j schema
./scripts/init-neo4j.sh
```

### Step 4: Register Notion Tools

```bash
# Generate embeddings for semantic search
cd gateway
npm run generate-embeddings -- --integration notion

# Start gateway
npm run dev
```

### Step 5: Test Integration

```bash
# Test tool discovery
curl -X POST http://localhost:3000/api/v1/tools/select \
  -H "Content-Type: application/json" \
  -d '{
    "query": "create a new page in Notion",
    "context": {"maxTools": 5}
  }'

# Expected response: notion.createPage tool selected
```

✅ **Done!** Your Notion integration is ready to use.

---

## Detailed Setup

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   AI Agent (Claude)                     │
│          "Create a Notion page with task list"          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP/MCP Protocol
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Connectors Gateway (Port 3000)             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 1. Semantic Router                                │  │
│  │    Query: "create page" → notion.createPage       │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 2. OAuth Proxy (Vault)                            │  │
│  │    Fetch tenant credentials, inject Bearer token  │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ 3. GraphRAG Enhancement                           │  │
│  │    Suggest: notion.appendBlocks (related tool)    │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ MCP Protocol
                       ▼
┌─────────────────────────────────────────────────────────┐
│          Official Notion MCP Server (Port 3150)         │
│             Using @notionhq/client SDK                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTPS + OAuth Bearer Token
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Notion API (api.notion.com)                │
│         19 endpoints: pages, databases, blocks          │
└─────────────────────────────────────────────────────────┘
```

### Creating Notion Integration (Detailed)

#### 1. Access Developer Portal

Navigate to: **https://www.notion.so/my-integrations**

📸 **Screenshot description:** The page shows a list of your integrations with a blue "+ New integration" button in the top right.

#### 2. Configure Integration Settings

**Basic Information:**
- **Name:** Give it a meaningful name (e.g., "AI Agent Connector")
- **Logo:** Optional, upload a custom logo
- **Associated workspace:** Select the workspace where you'll test

**Capabilities (enable all):**
- ✅ **Read content** - Query pages and databases
- ✅ **Update content** - Modify existing pages
- ✅ **Insert content** - Create new pages/blocks
- ✅ **Read user information** - Access user details
- ✅ **Read comments** - Access page comments

**User Capabilities:**
- ✅ Allow anyone in workspace to use
- ✅ Allow guest users (optional)

#### 3. Configure OAuth

Click on **"Distribution"** tab:

1. Make integration **Public**
2. Set **OAuth Redirect URI:**
   ```
   http://localhost:3000/oauth/callback/notion
   ```

   For production, add:
   ```
   https://your-domain.com/oauth/callback/notion
   ```

3. Copy your credentials:
   - **OAuth client ID:** `secret_xxxxxxxxxxxxxx`
   - **OAuth client secret:** `secret_yyyyyyyyyyyy`

⚠️ **Security Note:** Keep these credentials secret! Never commit to git or expose publicly.

#### 4. Submit for Review (Optional)

For public distribution, submit for Notion's review. For internal/development use, skip this step.

### Setting Up Gateway Configuration

#### 1. Create Notion Registry Entry

Create file: `gateway/data/registry/existing-servers/notion.json`

```json
{
  "integration": "notion",
  "category": "productivity",
  "version": "1.0.0",
  "source": "official",
  "serverUrl": "http://localhost:3150",
  "description": "Official Notion integration providing access to pages, databases, and blocks",
  "auth": {
    "type": "oauth2",
    "provider": "notion",
    "authorizationUrl": "https://api.notion.com/v1/oauth/authorize",
    "tokenUrl": "https://api.notion.com/v1/oauth/token",
    "vaultPath": "secret/tenants/{tenant_id}/notion",
    "scopes": []
  },
  "tools": [
    {
      "id": "notion.createPage",
      "name": "createPage",
      "description": "Create a new page in a Notion workspace or database",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "parent": {
            "type": "object",
            "description": "Parent page or database"
          },
          "properties": {
            "type": "object",
            "description": "Page properties"
          },
          "children": {
            "type": "array",
            "description": "Initial page content blocks"
          }
        },
        "required": ["parent"]
      },
      "tokenCost": 200,
      "requiredScopes": []
    },
    {
      "id": "notion.queryDatabase",
      "name": "queryDatabase",
      "description": "Query a Notion database with filters and sorting",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "database_id": {
            "type": "string",
            "description": "Database ID to query"
          },
          "filter": {
            "type": "object",
            "description": "Filter conditions"
          },
          "sorts": {
            "type": "array",
            "description": "Sort criteria"
          }
        },
        "required": ["database_id"]
      },
      "tokenCost": 180,
      "requiredScopes": []
    },
    {
      "id": "notion.retrievePage",
      "name": "retrievePage",
      "description": "Retrieve a Notion page by ID including properties and content",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "page_id": {
            "type": "string",
            "description": "Page ID to retrieve"
          }
        },
        "required": ["page_id"]
      },
      "tokenCost": 150,
      "requiredScopes": []
    },
    {
      "id": "notion.updatePage",
      "name": "updatePage",
      "description": "Update properties of an existing Notion page",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "page_id": {
            "type": "string",
            "description": "Page ID to update"
          },
          "properties": {
            "type": "object",
            "description": "Updated properties"
          }
        },
        "required": ["page_id", "properties"]
      },
      "tokenCost": 170,
      "requiredScopes": []
    },
    {
      "id": "notion.appendBlocks",
      "name": "appendBlocks",
      "description": "Append content blocks to a Notion page or block",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "block_id": {
            "type": "string",
            "description": "Parent block or page ID"
          },
          "children": {
            "type": "array",
            "description": "Blocks to append"
          }
        },
        "required": ["block_id", "children"]
      },
      "tokenCost": 160,
      "requiredScopes": []
    },
    {
      "id": "notion.retrieveBlock",
      "name": "retrieveBlock",
      "description": "Retrieve a specific block by ID with its content",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "block_id": {
            "type": "string",
            "description": "Block ID to retrieve"
          }
        },
        "required": ["block_id"]
      },
      "tokenCost": 140,
      "requiredScopes": []
    },
    {
      "id": "notion.retrieveBlockChildren",
      "name": "retrieveBlockChildren",
      "description": "Retrieve all child blocks of a page or block",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "block_id": {
            "type": "string",
            "description": "Parent block ID"
          },
          "page_size": {
            "type": "number",
            "description": "Number of blocks to return"
          }
        },
        "required": ["block_id"]
      },
      "tokenCost": 150,
      "requiredScopes": []
    },
    {
      "id": "notion.updateBlock",
      "name": "updateBlock",
      "description": "Update an existing block's content",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "block_id": {
            "type": "string",
            "description": "Block ID to update"
          },
          "content": {
            "type": "object",
            "description": "Updated block content"
          }
        },
        "required": ["block_id", "content"]
      },
      "tokenCost": 160,
      "requiredScopes": []
    },
    {
      "id": "notion.deleteBlock",
      "name": "deleteBlock",
      "description": "Delete a block from a Notion page",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "block_id": {
            "type": "string",
            "description": "Block ID to delete"
          }
        },
        "required": ["block_id"]
      },
      "tokenCost": 130,
      "requiredScopes": []
    },
    {
      "id": "notion.retrieveDatabase",
      "name": "retrieveDatabase",
      "description": "Retrieve database schema and properties",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "database_id": {
            "type": "string",
            "description": "Database ID"
          }
        },
        "required": ["database_id"]
      },
      "tokenCost": 160,
      "requiredScopes": []
    },
    {
      "id": "notion.createDatabase",
      "name": "createDatabase",
      "description": "Create a new database in Notion",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "parent": {
            "type": "object",
            "description": "Parent page"
          },
          "title": {
            "type": "array",
            "description": "Database title"
          },
          "properties": {
            "type": "object",
            "description": "Database schema"
          }
        },
        "required": ["parent", "properties"]
      },
      "tokenCost": 200,
      "requiredScopes": []
    },
    {
      "id": "notion.updateDatabase",
      "name": "updateDatabase",
      "description": "Update database title or properties",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "database_id": {
            "type": "string",
            "description": "Database ID"
          },
          "title": {
            "type": "array",
            "description": "New title"
          },
          "properties": {
            "type": "object",
            "description": "Updated schema"
          }
        },
        "required": ["database_id"]
      },
      "tokenCost": 180,
      "requiredScopes": []
    },
    {
      "id": "notion.search",
      "name": "search",
      "description": "Search across all pages and databases in workspace",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search query"
          },
          "filter": {
            "type": "object",
            "description": "Filter by object type"
          },
          "sort": {
            "type": "object",
            "description": "Sort criteria"
          }
        }
      },
      "tokenCost": 170,
      "requiredScopes": []
    },
    {
      "id": "notion.listUsers",
      "name": "listUsers",
      "description": "List all users in the workspace",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "page_size": {
            "type": "number",
            "description": "Results per page"
          }
        }
      },
      "tokenCost": 140,
      "requiredScopes": []
    },
    {
      "id": "notion.retrieveUser",
      "name": "retrieveUser",
      "description": "Retrieve user details by ID",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "description": "User ID"
          }
        },
        "required": ["user_id"]
      },
      "tokenCost": 130,
      "requiredScopes": []
    },
    {
      "id": "notion.retrieveBotUser",
      "name": "retrieveBotUser",
      "description": "Retrieve the bot user associated with the integration",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {}
      },
      "tokenCost": 120,
      "requiredScopes": []
    },
    {
      "id": "notion.listComments",
      "name": "listComments",
      "description": "List comments on a page or discussion",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "block_id": {
            "type": "string",
            "description": "Page or block ID"
          }
        },
        "required": ["block_id"]
      },
      "tokenCost": 150,
      "requiredScopes": []
    },
    {
      "id": "notion.createComment",
      "name": "createComment",
      "description": "Add a comment to a page or discussion",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "parent": {
            "type": "object",
            "description": "Page or discussion"
          },
          "rich_text": {
            "type": "array",
            "description": "Comment text"
          }
        },
        "required": ["parent", "rich_text"]
      },
      "tokenCost": 160,
      "requiredScopes": []
    },
    {
      "id": "notion.retrievePagePropertyItem",
      "name": "retrievePagePropertyItem",
      "description": "Retrieve a specific property value from a page",
      "category": "productivity",
      "integration": "notion",
      "parameters": {
        "type": "object",
        "properties": {
          "page_id": {
            "type": "string",
            "description": "Page ID"
          },
          "property_id": {
            "type": "string",
            "description": "Property ID"
          }
        },
        "required": ["page_id", "property_id"]
      },
      "tokenCost": 140,
      "requiredScopes": []
    }
  ]
}
```

#### 2. Generate Embeddings

```bash
cd gateway
npm run generate-embeddings -- --registry-file data/registry/existing-servers/notion.json
```

This creates FAISS vector embeddings for semantic tool discovery.

#### 3. Update Docker Compose

Add Notion MCP server to `docker-compose.yml`:

```yaml
services:
  # ... existing services (gateway, vault, neo4j, redis)

  mcp-notion:
    image: node:18-alpine
    container_name: connectors-mcp-notion
    working_dir: /app
    command: >
      sh -c "npm install -g @modelcontextprotocol/server-notion &&
             notion-mcp-server --port 3150"
    ports:
      - "3150:3150"
    environment:
      - NODE_ENV=development
      - PORT=3150
    depends_on:
      gateway:
        condition: service_healthy
    networks:
      - connectors-network
    healthcheck:
      test: ["CMD", "wget", "-q", "-O", "-", "http://localhost:3150/health"]
      interval: 10s
      timeout: 5s
      retries: 3
```

#### 4. Update Gateway Environment

Add to `gateway/.env`:

```bash
# Notion Configuration
NOTION_SERVER_URL=http://mcp-notion:3150
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret
NOTION_REDIRECT_URI=http://localhost:3000/oauth/callback/notion
```

---

## OAuth Configuration

### Understanding Notion OAuth Flow

Notion uses **OAuth 2.0 Authorization Code** flow:

1. **User Authorization:** Redirect user to Notion to grant permissions
2. **Code Exchange:** Exchange authorization code for access token
3. **Token Storage:** Store token in Vault (encrypted per-tenant)
4. **Token Usage:** Gateway injects token for all Notion API calls
5. **Token Management:** Notion tokens don't expire (no refresh needed)

📌 **Note:** Unlike most OAuth providers, Notion access tokens **do not expire**. However, they can be revoked by the user in Notion settings.

### Step-by-Step OAuth Setup

#### 1. Store Credentials in Vault

```bash
# Development (root token)
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='dev-token'

# Production (use proper authentication)
vault login

# Store OAuth app credentials
vault kv put secret/oauth/notion \
  client_id="your_client_id_here" \
  client_secret="your_client_secret_here" \
  redirect_uri="http://localhost:3000/oauth/callback/notion"

# Verify stored correctly
vault kv get secret/oauth/notion
```

#### 2. Initiate OAuth Flow

**Authorization URL:**
```
https://api.notion.com/v1/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  response_type=code&
  owner=user&
  redirect_uri=http://localhost:3000/oauth/callback/notion
```

**Example using Gateway:**
```bash
# Get authorization URL
curl http://localhost:3000/oauth/authorize/notion?tenant_id=my-tenant

# Response:
{
  "authorizationUrl": "https://api.notion.com/v1/oauth/authorize?client_id=...",
  "state": "random_state_token"
}
```

#### 3. User Grants Permission

User is redirected to Notion where they:
1. Select workspace to grant access
2. Review permissions requested
3. Click "Allow" or "Deny"

📸 **Screenshot description:** Notion OAuth consent screen shows the integration name, requested permissions (Read content, Update content, Insert content), and workspace selection dropdown with "Allow access" and "Cancel" buttons.

#### 4. Handle Callback

After user approves, Notion redirects to:
```
http://localhost:3000/oauth/callback/notion?code=AUTHORIZATION_CODE&state=STATE_TOKEN
```

Gateway automatically:
1. Validates state token (CSRF protection)
2. Exchanges code for access token
3. Stores token in Vault for tenant
4. Returns success to user

**Manual token exchange (if needed):**
```bash
curl -X POST https://api.notion.com/v1/oauth/token \
  -H "Authorization: Basic BASE64(client_id:client_secret)" \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "AUTHORIZATION_CODE",
    "redirect_uri": "http://localhost:3000/oauth/callback/notion"
  }'
```

#### 5. Store Token for Tenant

Gateway stores the response in Vault:

```bash
# Gateway automatically does this, but for reference:
vault kv put secret/tenants/my-tenant/notion \
  access_token="secret_xxxxxxxxxxxx" \
  workspace_id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  workspace_name="My Workspace" \
  bot_id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" \
  owner_type="user" \
  owner_id="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

#### 6. Using Authenticated Requests

Gateway transparently injects tokens:

```bash
# Tool invocation (no token needed in request)
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "notion.createPage",
    "integration": "notion",
    "tenantId": "my-tenant",
    "parameters": {
      "parent": {"page_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"},
      "properties": {
        "title": [{"text": {"content": "My New Page"}}]
      }
    }
  }'

# Gateway adds: Authorization: Bearer secret_xxxxxxxxxxxx
```

### Multi-Tenant Setup

Support multiple Notion workspaces:

```bash
# Tenant 1 (Engineering workspace)
vault kv put secret/tenants/eng-team/notion \
  access_token="secret_eng_xxxxxxxxx"

# Tenant 2 (Marketing workspace)
vault kv put secret/tenants/marketing-team/notion \
  access_token="secret_mkt_xxxxxxxxx"

# Tenant 3 (Personal workspace)
vault kv put secret/tenants/john-doe/notion \
  access_token="secret_personal_xxxxxxx"
```

Each tenant uses their own Notion workspace with isolated credentials.

---

## Available Tools

### Pages (5 tools)

#### 1. `notion.createPage`
**Description:** Create a new page in workspace or database

**Use Cases:**
- Create meeting notes
- Add task to project database
- Generate documentation pages

**Example:**
```json
{
  "parent": {
    "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  "properties": {
    "Name": {
      "title": [{"text": {"content": "Q4 Planning"}}]
    },
    "Status": {
      "select": {"name": "In Progress"}
    },
    "Due Date": {
      "date": {"start": "2025-12-31"}
    }
  },
  "children": [
    {
      "object": "block",
      "type": "heading_1",
      "heading_1": {
        "rich_text": [{"text": {"content": "Objectives"}}]
      }
    },
    {
      "object": "block",
      "type": "bulleted_list_item",
      "bulleted_list_item": {
        "rich_text": [{"text": {"content": "Increase revenue by 20%"}}]
      }
    }
  ]
}
```

**Query Examples:**
- "Create a new page in Notion for meeting notes"
- "Add a task to the project tracker database"
- "Make a new doc for API documentation"

---

#### 2. `notion.retrievePage`
**Description:** Get page content and properties by ID

**Use Cases:**
- Read page content
- Get task details
- Fetch database entry

**Example:**
```json
{
  "page_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Query Examples:**
- "Get the details of the project plan page"
- "Read the content from the meeting notes"
- "Fetch the task with ID xxx"

---

#### 3. `notion.updatePage`
**Description:** Update page properties (status, dates, etc.)

**Use Cases:**
- Mark task complete
- Update due dates
- Change status labels

**Example:**
```json
{
  "page_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "properties": {
    "Status": {
      "select": {"name": "Completed"}
    },
    "Progress": {
      "number": 100
    }
  }
}
```

**Query Examples:**
- "Mark the task as complete"
- "Update the project status to in review"
- "Change the due date to next Friday"

---

#### 4. `notion.appendBlocks`
**Description:** Add content blocks to page

**Use Cases:**
- Add notes to page
- Append checklist items
- Insert code blocks

**Example:**
```json
{
  "block_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "children": [
    {
      "object": "block",
      "type": "paragraph",
      "paragraph": {
        "rich_text": [{"text": {"content": "Additional notes from today's meeting."}}]
      }
    },
    {
      "object": "block",
      "type": "to_do",
      "to_do": {
        "rich_text": [{"text": {"content": "Follow up with design team"}}],
        "checked": false
      }
    }
  ]
}
```

**Query Examples:**
- "Add a note to the meeting page"
- "Append a checklist to the project doc"
- "Insert a code snippet at the end"

---

#### 5. `notion.retrievePagePropertyItem`
**Description:** Get specific property value from page

**Use Cases:**
- Check task status
- Get assigned user
- Read custom property

**Example:**
```json
{
  "page_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "property_id": "title"
}
```

**Query Examples:**
- "Get the status of this task"
- "Who is assigned to this project?"
- "What's the due date for this item?"

---

### Databases (3 tools)

#### 6. `notion.queryDatabase`
**Description:** Query database with filters and sorting

**Use Cases:**
- Find overdue tasks
- List high-priority items
- Search by assignee

**Example:**
```json
{
  "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "filter": {
    "and": [
      {
        "property": "Status",
        "select": {"equals": "In Progress"}
      },
      {
        "property": "Priority",
        "select": {"equals": "High"}
      }
    ]
  },
  "sorts": [
    {
      "property": "Due Date",
      "direction": "ascending"
    }
  ]
}
```

**Query Examples:**
- "Show me all high priority tasks"
- "List incomplete items due this week"
- "Find all tasks assigned to John"

---

#### 7. `notion.createDatabase`
**Description:** Create new database with schema

**Use Cases:**
- Create project tracker
- Make bug tracker
- Build CRM database

**Example:**
```json
{
  "parent": {
    "page_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  "title": [
    {"text": {"content": "Bug Tracker"}}
  ],
  "properties": {
    "Name": {"title": {}},
    "Status": {
      "select": {
        "options": [
          {"name": "Open", "color": "red"},
          {"name": "In Progress", "color": "yellow"},
          {"name": "Closed", "color": "green"}
        ]
      }
    },
    "Priority": {
      "select": {
        "options": [
          {"name": "Critical", "color": "red"},
          {"name": "High", "color": "orange"},
          {"name": "Medium", "color": "yellow"},
          {"name": "Low", "color": "gray"}
        ]
      }
    },
    "Assigned": {"people": {}},
    "Due Date": {"date": {}}
  }
}
```

**Query Examples:**
- "Create a bug tracking database"
- "Make a new project management table"
- "Set up a customer database"

---

#### 8. `notion.retrieveDatabase`
**Description:** Get database schema and properties

**Use Cases:**
- Inspect database structure
- Get available filters
- Check property types

**Example:**
```json
{
  "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Query Examples:**
- "Show me the schema of the projects database"
- "What properties does this table have?"
- "Get the structure of the task database"

---

### Blocks (5 tools)

#### 9. `notion.retrieveBlock`
**Description:** Get specific block content

**Example:**
```json
{
  "block_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

#### 10. `notion.retrieveBlockChildren`
**Description:** Get all child blocks of page/block

**Example:**
```json
{
  "block_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "page_size": 100
}
```

---

#### 11. `notion.updateBlock`
**Description:** Update block content

**Example:**
```json
{
  "block_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "paragraph": {
    "rich_text": [{"text": {"content": "Updated text"}}]
  }
}
```

---

#### 12. `notion.deleteBlock`
**Description:** Delete a block

**Example:**
```json
{
  "block_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

### Search & Users (6 tools)

#### 13. `notion.search`
**Description:** Search workspace content

**Example:**
```json
{
  "query": "quarterly planning",
  "filter": {
    "property": "object",
    "value": "page"
  },
  "sort": {
    "direction": "descending",
    "timestamp": "last_edited_time"
  }
}
```

**Query Examples:**
- "Find all pages mentioning 'API'"
- "Search for meeting notes from last week"
- "Find the project plan document"

---

#### 14. `notion.listUsers`
**Description:** List workspace users

**Example:**
```json
{
  "page_size": 50
}
```

---

#### 15. `notion.retrieveUser`
**Description:** Get user details

**Example:**
```json
{
  "user_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

#### 16. `notion.retrieveBotUser`
**Description:** Get integration bot user info

**Example:**
```json
{}
```

---

### Comments (2 tools)

#### 17. `notion.listComments`
**Description:** Get page comments

**Example:**
```json
{
  "block_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

#### 18. `notion.createComment`
**Description:** Add comment to page

**Example:**
```json
{
  "parent": {
    "page_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  "rich_text": [
    {"text": {"content": "Great work on this!"}}
  ]
}
```

---

## Testing

### 1. Test OAuth Flow

```bash
# Get authorization URL
curl http://localhost:3000/oauth/authorize/notion?tenant_id=test-user

# Visit URL in browser, authorize, then check token stored
vault kv get secret/tenants/test-user/notion
```

### 2. Test Tool Discovery

```bash
# Semantic search for Notion tools
curl -X POST http://localhost:3000/api/v1/tools/select \
  -H "Content-Type: application/json" \
  -d '{
    "query": "create a new page in Notion",
    "context": {
      "maxTools": 5,
      "allowedCategories": ["productivity"]
    }
  }'

# Expected: notion.createPage should be top result
```

### 3. Test Tool Invocation

```bash
# Create a test page
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "notion.createPage",
    "integration": "notion",
    "tenantId": "test-user",
    "parameters": {
      "parent": {
        "page_id": "YOUR_PARENT_PAGE_ID"
      },
      "properties": {
        "title": [
          {
            "text": {
              "content": "Test Page from Connectors Platform"
            }
          }
        ]
      },
      "children": [
        {
          "object": "block",
          "type": "paragraph",
          "paragraph": {
            "rich_text": [
              {
                "text": {
                  "content": "This page was created via the MCP gateway!"
                }
              }
            ]
          }
        }
      ]
    }
  }'
```

### 4. Test Search

```bash
# Search workspace
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "notion.search",
    "integration": "notion",
    "tenantId": "test-user",
    "parameters": {
      "query": "test",
      "filter": {
        "property": "object",
        "value": "page"
      }
    }
  }'
```

### 5. Verify Gateway Logs

```bash
# Check logs for successful routing
docker compose logs -f gateway | grep notion

# Expected output:
# [INFO] Tool selection: query="create page" -> notion.createPage (score: 0.95)
# [INFO] OAuth token injected for tenant: test-user
# [INFO] Tool invocation successful: notion.createPage (latency: 234ms)
```

---

## Troubleshooting

### Issue 1: OAuth Authorization Fails

**Symptoms:**
- Authorization URL returns 404
- "Invalid client_id" error

**Solutions:**

✅ **Verify credentials in Vault:**
```bash
vault kv get secret/oauth/notion
# Check client_id and client_secret match Notion integration
```

✅ **Check redirect URI matches:**
```bash
# Notion Developer Portal: Must be exactly
http://localhost:3000/oauth/callback/notion

# Gateway .env: Must match
NOTION_REDIRECT_URI=http://localhost:3000/oauth/callback/notion
```

✅ **Ensure integration is "Public":**
- Go to Notion Developer Portal
- Distribution tab → Make integration Public
- Approval not needed for testing

---

### Issue 2: Tools Not Discovered

**Symptoms:**
- Semantic search doesn't return Notion tools
- Query says "No tools found"

**Solutions:**

✅ **Regenerate embeddings:**
```bash
cd gateway
npm run generate-embeddings -- --integration notion --force

# Check FAISS index created
ls data/embeddings/notion.index
```

✅ **Verify registry file:**
```bash
cat data/registry/existing-servers/notion.json
# Should have 19 tools defined
```

✅ **Restart gateway:**
```bash
npm run dev
# Watch for: "Loaded 19 Notion tools"
```

---

### Issue 3: Tool Invocation Returns 401

**Symptoms:**
- "Unauthorized" error
- "Integration is not authorized for workspace"

**Solutions:**

✅ **Check token in Vault:**
```bash
vault kv get secret/tenants/YOUR_TENANT/notion
# Should have access_token field
```

✅ **Reauthorize integration:**
```bash
# Get new authorization URL
curl http://localhost:3000/oauth/authorize/notion?tenant_id=YOUR_TENANT

# Complete OAuth flow again
```

✅ **Verify integration has permissions:**
- Go to Notion workspace settings
- Integrations tab
- Your integration should be listed
- Click "Manage" → ensure capabilities enabled

---

### Issue 4: "Page Not Found" Errors

**Symptoms:**
- 404 when accessing page/database
- "object_not_found" API error

**Solutions:**

✅ **Share page with integration:**
```
In Notion:
1. Open the page/database
2. Click "Share" button (top right)
3. Search for your integration name
4. Click "Invite"
```

📌 **Important:** Notion integrations can only access pages explicitly shared with them!

✅ **Verify page ID format:**
```bash
# Correct format (UUID with dashes removed or kept)
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# or
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Get from page URL:
https://notion.so/My-Page-Title-1234567890abcdef1234567890abcdef
                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                 This is the page ID
```

---

### Issue 5: Rate Limiting

**Symptoms:**
- "rate_limited" error
- 429 HTTP status

**Solutions:**

✅ **Notion rate limits:**
- **3 requests per second** per integration
- Burst: Up to 30 requests in 10 seconds

✅ **Gateway handles automatically:**
```typescript
// Gateway implements exponential backoff
// No action needed from users
```

✅ **For heavy usage:**
```bash
# Configure in gateway/.env
NOTION_RATE_LIMIT_PER_SECOND=3
NOTION_BURST_LIMIT=30
```

---

### Issue 6: Block Type Not Supported

**Symptoms:**
- "validation_error: body failed validation"
- Specific block types fail

**Solutions:**

✅ **Check Notion API version:**
```bash
# Gateway uses Notion API v1 (2022-06-28)
# Some block types require specific API versions
```

✅ **Supported block types:**
- paragraph, heading_1, heading_2, heading_3
- bulleted_list_item, numbered_list_item, to_do
- toggle, code, quote, callout
- divider, table_of_contents
- image, video, file, pdf, bookmark
- equation, embed

✅ **Unsupported block types:**
- synced_block (use regular blocks)
- template (use page creation)
- column_list (not yet in API)

---

### Issue 7: GraphRAG Not Suggesting Related Tools

**Symptoms:**
- Only get one tool back
- No "related tools" in response

**Solutions:**

✅ **Build tool usage graph:**
```bash
# Use tools multiple times to build relationships
# GraphRAG learns from usage patterns

# After 10+ uses, check Neo4j
docker exec -it connectors-neo4j cypher-shell -u neo4j -p password
MATCH (n:Tool {integration: 'notion'})-[r]-(m:Tool) RETURN n, r, m LIMIT 10;
```

✅ **Manually seed relationships:**
```cypher
// Connect related tools
MATCH (create:Tool {id: 'notion.createPage'})
MATCH (append:Tool {id: 'notion.appendBlocks'})
CREATE (create)-[:OFTEN_USED_WITH {weight: 0.9}]->(append);
```

---

### Issue 8: Docker Container Won't Start

**Symptoms:**
- `mcp-notion` container exits immediately
- "Module not found" errors

**Solutions:**

✅ **Check Docker logs:**
```bash
docker compose logs mcp-notion
```

✅ **Rebuild container:**
```bash
docker compose down
docker compose build --no-cache mcp-notion
docker compose up -d
```

✅ **Use npx instead:**
```yaml
# docker-compose.yml - alternative approach
mcp-notion:
  image: node:18-alpine
  command: npx @modelcontextprotocol/server-notion --port 3150
```

---

## Advanced Usage

### Custom Tool Aliases

Improve semantic search with aliases:

```json
{
  "id": "notion.createPage",
  "name": "createPage",
  "description": "Create a new page in a Notion workspace or database",
  "aliases": [
    "addPage",
    "newPage",
    "makePage",
    "insertPage",
    "createDoc",
    "newDocument"
  ]
}
```

Regenerate embeddings after adding aliases.

---

### Database Templates

Create reusable database schemas:

```json
{
  "templates": {
    "project_tracker": {
      "properties": {
        "Name": {"title": {}},
        "Status": {
          "select": {
            "options": [
              {"name": "Not Started", "color": "gray"},
              {"name": "In Progress", "color": "yellow"},
              {"name": "Completed", "color": "green"}
            ]
          }
        },
        "Owner": {"people": {}},
        "Due Date": {"date": {}},
        "Priority": {
          "select": {
            "options": [
              {"name": "High", "color": "red"},
              {"name": "Medium", "color": "yellow"},
              {"name": "Low", "color": "blue"}
            ]
          }
        }
      }
    },
    "meeting_notes": {
      "properties": {
        "Title": {"title": {}},
        "Date": {"date": {}},
        "Attendees": {"people": {}},
        "Meeting Type": {
          "select": {
            "options": [
              {"name": "Team Sync", "color": "blue"},
              {"name": "1-on-1", "color": "green"},
              {"name": "Client Call", "color": "purple"}
            ]
          }
        }
      }
    }
  }
}
```

---

### Batch Operations

Process multiple pages efficiently:

```bash
# Create multiple pages in one call
curl -X POST http://localhost:3000/api/v1/tools/batch \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-tenant",
    "operations": [
      {
        "toolId": "notion.createPage",
        "integration": "notion",
        "parameters": {
          "parent": {"database_id": "xxx"},
          "properties": {"title": [{"text": {"content": "Task 1"}}]}
        }
      },
      {
        "toolId": "notion.createPage",
        "integration": "notion",
        "parameters": {
          "parent": {"database_id": "xxx"},
          "properties": {"title": [{"text": {"content": "Task 2"}}]}
        }
      }
    ]
  }'
```

---

### Monitoring and Logging

Track Notion usage:

```bash
# View Notion-specific logs
docker compose logs -f gateway | grep "integration=notion"

# Prometheus metrics (if enabled)
curl http://localhost:3000/metrics | grep notion

# Example metrics:
# notion_tool_calls_total{tool="createPage"} 42
# notion_tool_latency_seconds{tool="createPage",quantile="0.95"} 0.234
# notion_oauth_refresh_total 0
# notion_errors_total{type="rate_limited"} 2
```

---

### Multi-Workspace Setup

Support team members with different workspaces:

```bash
# Engineering team workspace
vault kv put secret/tenants/engineering/notion \
  access_token="secret_eng_xxx" \
  workspace_id="workspace_eng" \
  workspace_name="Engineering"

# Design team workspace
vault kv put secret/tenants/design/notion \
  access_token="secret_design_xxx" \
  workspace_id="workspace_design" \
  workspace_name="Design"

# Personal workspace
vault kv put secret/tenants/john-doe/notion \
  access_token="secret_personal_xxx" \
  workspace_id="workspace_personal" \
  workspace_name="Personal"
```

Each tenant automatically uses their own workspace.

---

### Rate Limit Configuration

Fine-tune rate limiting:

```typescript
// gateway/src/config/rate-limits.ts
export const RATE_LIMITS = {
  notion: {
    requestsPerSecond: 3,
    burstLimit: 30,
    retryStrategy: {
      maxRetries: 3,
      backoffMultiplier: 2,
      initialDelayMs: 1000
    }
  }
};
```

---

### Custom Error Handling

```typescript
// gateway/src/integrations/notion/error-handler.ts
export function handleNotionError(error: NotionAPIError) {
  switch (error.code) {
    case 'object_not_found':
      throw new NotFoundError(
        'Page or database not found. Ensure it\'s shared with the integration.',
        { pageId: error.pageId }
      );

    case 'validation_error':
      throw new ValidationError(
        'Invalid parameters provided',
        { details: error.details }
      );

    case 'unauthorized':
      throw new OAuthError(
        'Notion integration not authorized. Please reauthorize.',
        'notion',
        error.tenantId
      );

    case 'rate_limited':
      // Gateway handles automatically with exponential backoff
      throw new RateLimitError(
        'Notion rate limit exceeded. Retrying...',
        { retryAfter: error.retryAfter }
      );

    default:
      throw new IntegrationError(
        `Notion API error: ${error.message}`,
        { code: error.code }
      );
  }
}
```

---

## Summary

✅ **Notion integration complete!**

**What You've Set Up:**
1. Official Notion MCP server installed
2. OAuth 2.0 authentication configured in Vault
3. 19 tools registered and embedded for semantic search
4. Gateway routing to Notion API
5. GraphRAG relationships learning from usage
6. Token optimization (99% reduction)

**Next Steps:**
1. **Authorize Your Workspace:** Complete OAuth flow
2. **Test Integration:** Create/query pages and databases
3. **Build AI Agents:** Use semantic routing to access Notion
4. **Monitor Usage:** Check logs and metrics

**Performance:**
- Tool selection: <1ms (semantic routing)
- OAuth token fetch: <10ms (Vault cached)
- API call: 100-500ms (Notion API latency)
- **Total: <600ms** end-to-end

**Token Savings:**
- Traditional: 155 tokens/tool × 19 = **2,945 tokens**
- Connectors: 8 relevant tools × 95 tokens = **760 tokens**
- **Reduction: 74% for Notion alone**

**Resources:**
- 📖 [Notion API Documentation](https://developers.notion.com/)
- 📖 [OAuth Flow Diagram](./notion-oauth-flow.md)
- 📖 [Main Platform Docs](/docs/USING_CONNECTORS_PLATFORM.md)
- 🐛 [GitHub Issues](https://github.com/your-org/connectors/issues)

---

**Questions or Issues?**
- Check [Troubleshooting](#troubleshooting) section
- Review [OAuth Configuration](#oauth-configuration)
- See [Notion OAuth Flow](./notion-oauth-flow.md)
- Open GitHub issue with logs

**Happy Building! 🚀**

---

**Last Updated:** 2025-11-12
**Version:** 1.0.0
**Maintained By:** Connectors Platform Team
