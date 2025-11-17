# @connectors/cli

Interactive command-line interface for the Connectors Platform - AI Agent Integration with 99% token reduction.

## Features

- **Interactive Setup** - Guided configuration with connection testing
- **MCP Server Management** - Add, list, remove, and import MCP servers
- **Semantic Tool Search** - Find tools using natural language queries
- **Beautiful Output** - Colored terminal output with spinners and tables
- **Configuration Management** - Persistent configuration in user home directory

## Installation

### Global Installation (Recommended)

```bash
npm install -g @connectors/cli
```

### Local Development

```bash
cd gateway/packages/cli
npm install
npm run build
npm link
```

## Quick Start

### 1. Initialize Configuration

```bash
connectors init
```

This will prompt you for:
- Gateway URL (default: http://localhost:3000)
- Tenant ID
- API Key (optional)

The CLI will test the connection to verify your setup.

### 2. Add an MCP Server

```bash
# Interactive mode (recommended)
connectors mcp add

# With options
connectors mcp add \
  --name my-server \
  --source github \
  --url https://github.com/user/repo \
  --category custom
```

### 3. List MCP Servers

```bash
# List all servers
connectors mcp list

# Filter by category
connectors mcp list --category code
```

### 4. Search for Tools

```bash
connectors tools search "create a GitHub pull request"
```

## Commands

### `connectors init`

Initialize Connectors configuration. This command:
- Prompts for gateway URL, tenant ID, and API key
- Tests connection to the gateway
- Saves configuration to `~/.config/connectors/config.json`

**Example:**
```bash
connectors init
```

### `connectors mcp add`

Add a custom MCP server to the platform.

**Options:**
- `-n, --name <name>` - Server name
- `-s, --source <type>` - Source type: `github`, `stdio`, `http`, `docker`
- `-u, --url <url>` - Source URL (for GitHub/HTTP)
- `-c, --category <category>` - Category name

**Examples:**

```bash
# Interactive mode
connectors mcp add

# GitHub repository
connectors mcp add \
  --name github-mcp \
  --source github \
  --url https://github.com/modelcontextprotocol/servers/tree/main/src/github \
  --category code

# STDIO server
connectors mcp add \
  --name local-server \
  --source stdio \
  --category custom

# HTTP endpoint
connectors mcp add \
  --name api-server \
  --source http \
  --url https://api.example.com/mcp \
  --category api

# Docker image
connectors mcp add \
  --name docker-server \
  --source docker \
  --category custom
```

### `connectors mcp list`

List all MCP servers in the platform.

**Options:**
- `-c, --category <category>` - Filter by category

**Examples:**

```bash
# List all servers
connectors mcp list

# List code category servers
connectors mcp list --category code

# List custom servers
connectors mcp list --category custom
```

### `connectors mcp remove <name>`

Remove a custom MCP server.

**Example:**
```bash
connectors mcp remove my-server
```

### `connectors mcp import <file>`

Import MCP servers from a configuration file (standard MCP config format).

**File Format:**
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/files"]
    }
  }
}
```

**Example:**
```bash
connectors mcp import mcp-config.json
```

### `connectors tools search <query>`

Search for tools using semantic search.

**Options:**
- `-m, --max <number>` - Maximum number of tools to return (default: 10)

**Examples:**

```bash
# Search for GitHub tools
connectors tools search "create a pull request"

# Limit results
connectors tools search "send email" --max 5

# Find database tools
connectors tools search "query postgres database" --max 20
```

### `connectors config`

Manage Connectors configuration.

**Options:**
- `-s, --show` - Show current configuration
- `-e, --edit` - Edit configuration (re-run init)

**Examples:**

```bash
# Interactive menu
connectors config

# Show current config
connectors config --show

# Edit configuration
connectors config --edit
```

## Configuration

The CLI stores configuration in your home directory:
- **macOS/Linux:** `~/.config/connectors/config.json`
- **Windows:** `%APPDATA%\connectors\config.json`

Configuration includes:
- `baseURL` - Gateway URL
- `tenantId` - Your tenant identifier
- `apiKey` - Optional API key for authentication

## Output Examples

### Successful Deployment

```
🚀 Connectors Platform Setup

? Gateway URL: http://localhost:3000
? Tenant ID: my-tenant
? API Key (optional): ****

✔ Connection successful!

✅ Configuration saved!

Config file: /Users/username/.config/connectors/config.json
```

### MCP Server List

```
📦 MCP Servers (8)

CODE
┌──────────────────┬───────┬──────────┬────────┐
│ Name             │ Tools │ Type     │ Status │
├──────────────────┼───────┼──────────┼────────┤
│ github           │ 25    │ Built-in │ ready  │
│ gitlab           │ 20    │ Built-in │ ready  │
└──────────────────┴───────┴──────────┴────────┘

COMMUNICATION
┌──────────────────┬───────┬──────────┬────────┐
│ Name             │ Tools │ Type     │ Status │
├──────────────────┼───────┼──────────┼────────┤
│ slack            │ 15    │ Built-in │ ready  │
│ gmail            │ 18    │ Built-in │ ready  │
└──────────────────┴───────┴──────────┴────────┘

Total: 8 server(s)
```

### Tool Search Results

```
🔍 Search Results for: "create a GitHub PR"

┌────────────────────────────┬──────────────────────────────────┬──────────┬───────┐
│ Tool ID                    │ Description                      │ Category │ Score │
├────────────────────────────┼──────────────────────────────────┼──────────┼───────┤
│ github.createPullRequest   │ Create a new pull request        │ code     │ 0.952 │
│ github.updatePullRequest   │ Update an existing pull request  │ code     │ 0.847 │
│ github.mergePullRequest    │ Merge a pull request             │ code     │ 0.823 │
└────────────────────────────┴──────────────────────────────────┴──────────┴───────┘

Showing 3 of 10 requested tools
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Local Testing

```bash
# Build and link locally
npm run build
npm link

# Test commands
connectors --help
connectors init
```

## Architecture

The CLI is built with:
- **commander** - Command-line argument parsing
- **inquirer** - Interactive prompts
- **ora** - Terminal spinners
- **chalk** - Colored output
- **conf** - Configuration management
- **table** - ASCII table formatting
- **@connectors/sdk** - Connectors platform SDK

## Error Handling

The CLI provides clear error messages and exit codes:
- **0** - Success
- **1** - General error (deployment failed, network error, etc.)

All errors are displayed with:
- Red colored output for errors
- Yellow colored output for warnings
- Helpful suggestions for resolution

## Support

- **Documentation:** https://github.com/raghavpatnecha/Connectors
- **Issues:** https://github.com/raghavpatnecha/Connectors/issues
- **Discussions:** https://github.com/raghavpatnecha/Connectors/discussions

## License

MIT © Connectors Platform Team
