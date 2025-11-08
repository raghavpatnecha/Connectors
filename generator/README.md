# OpenAPI to MCP Generator

Automatically generate TypeScript-based MCP servers from OpenAPI specifications with OAuth support, rate limiting, and auto-generated integration tests.

## Features

- **Automatic Tool Generation**: Convert OpenAPI operations to MCP tools
- **OAuth Integration**: Extract and configure OAuth flows from security schemes
- **Rate Limiting**: Built-in rate limit handling with retry logic
- **Type Safety**: Generate TypeScript types from JSON schemas
- **Auto-Splitting**: Split large APIs (>100 operations) by tags
- **Integration Tests**: Auto-generate Jest tests for all tools
- **Validation**: Comprehensive validation of generated code

## Installation

```bash
# Install with Poetry
cd generator
poetry install

# Or install globally
pip install -e .
```

## Quick Start

### Generate MCP Server from OpenAPI Spec

```bash
# From local file
openapi-mcp-gen generate ./specs/github.yaml

# From URL
openapi-mcp-gen generate https://api.github.com/openapi.yaml

# With custom category
openapi-mcp-gen generate ./specs/slack.yaml --category communication

# Custom output directory
openapi-mcp-gen generate ./specs/stripe.yaml --output ~/my-mcps/stripe
```

### Analyze OpenAPI Spec

Preview what will be generated without creating files:

```bash
openapi-mcp-gen analyze ./specs/github.yaml
```

Output:
```
API Information:
  Title: GitHub REST API
  Version: 1.0.0
  Category: code
  Base URL: https://api.github.com

Operations: 847
  GET: 450
  POST: 200
  PUT: 100
  PATCH: 50
  DELETE: 47

⚠ API has 847 operations (>100)
  Server will be split by tags

OAuth Configuration:
  oauth2: authorizationCode
```

### Validate Generated Server

```bash
# Basic validation
openapi-mcp-gen validate ./integrations/code/github

# Verbose output
openapi-mcp-gen validate ./integrations/code/github -v
```

## Usage Examples

### Generate GitHub MCP Server

```bash
# Download GitHub OpenAPI spec
curl -o github-openapi.yaml https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml

# Generate MCP server
openapi-mcp-gen generate github-openapi.yaml --category code

# Build and test
cd integrations/code/github-rest-api
npm install
npm run build
npm test
```

### Generate Slack MCP Server

```bash
# From Slack's OpenAPI spec URL
openapi-mcp-gen generate https://api.slack.com/specs/openapi/v2/slack_web.json \
  --category communication

cd integrations/communication/slack-web-api
npm install
npm run build
```

### Generate with Options

```bash
# Dry run (preview without writing files)
openapi-mcp-gen generate ./specs/api.yaml --dry-run

# Skip test generation
openapi-mcp-gen generate ./specs/api.yaml --no-tests

# Skip validation
openapi-mcp-gen generate ./specs/api.yaml --no-validate

# Force split even if under 100 operations
openapi-mcp-gen generate ./specs/api.yaml --force-split
```

## Generated Project Structure

```
integrations/
└── code/
    └── github-rest-api/
        ├── src/
        │   └── index.ts          # MCP server implementation
        ├── tests/
        │   └── integration.test.ts  # Auto-generated tests
        ├── package.json          # Dependencies
        ├── tsconfig.json         # TypeScript config
        └── README.md             # Usage documentation
```

## Generated Features

### OAuth Support

Generated servers automatically configure OAuth from OpenAPI security schemes:

```typescript
// Extracted from OpenAPI spec
const OAUTH_CONFIG = {
  flowType: "authorizationCode",
  authUrl: "https://github.com/login/oauth/authorize",
  tokenUrl: "https://github.com/login/oauth/access_token",
  scopes: {
    "repo": "Full control of repositories",
    "user": "Read user profile data"
  }
};
```

The gateway injects OAuth tokens via `OAUTH_ACCESS_TOKEN` environment variable.

### Rate Limiting

Rate limits are automatically extracted and enforced:

```typescript
const RATE_LIMITS = {
  requestsPerMinute: 60,
  requestsPerHour: 5000,
  burstLimit: 10
};

// Automatic rate limit handling
await rateLimiter.waitForSlot();
const response = await client.createPullRequest(params);
rateLimiter.recordRequest();
```

### Type-Safe Tools

TypeScript types are generated from JSON schemas:

```typescript
interface CreatePullRequestParams {
  owner: string;
  repo: string;
  title: string;
  head: string;
  base: string;
  body?: string;
  draft?: boolean;
}

async createPullRequest(params: CreatePullRequestParams): Promise<PullRequest> {
  // Implementation
}
```

## Configuration

### Category Auto-Detection

Categories are inferred from API metadata using keywords:

- **code**: github, gitlab, bitbucket, repository, git
- **communication**: slack, discord, teams, email, chat
- **project_management**: jira, asana, trello, task, project
- **cloud**: aws, azure, gcp, kubernetes, docker
- **data**: postgres, mysql, mongodb, database
- **crm**: salesforce, hubspot, customer, lead
- **finance**: stripe, paypal, payment, invoice
- **ai**: openai, anthropic, ml, model, embedding

Override with `--category` flag.

### Operation Limits

APIs with >100 operations are automatically split by tags:

```bash
# Large API → Multiple servers
openapi-mcp-gen generate ./specs/aws.yaml

# Output:
# integrations/cloud/aws-ec2/
# integrations/cloud/aws-s3/
# integrations/cloud/aws-lambda/
```

## Validation Checks

The validator performs comprehensive checks:

1. **TypeScript Compilation**: Ensures generated code compiles
2. **Tool Descriptions**: All tools have proper descriptions (>10 chars)
3. **OAuth Configuration**: Valid OAuth config if present
4. **Rate Limit Handling**: Proper rate limit implementation
5. **Integration Tests**: Tests exist and follow patterns
6. **Error Handling**: Proper error types and messages

```bash
openapi-mcp-gen validate ./integrations/code/github -v

# Output:
✓ All validation checks passed!

Checks run: TypeScript compilation, Tool descriptions, OAuth configuration, Rate limit handling, Integration tests

Warnings:
  ⚠ Tool 'listRepos' has very short description
```

## Development

### Project Structure

```
generator/
├── __init__.py              # Package exports
├── cli.py                   # CLI commands
├── config.py                # Configuration constants
├── utils.py                 # Utility functions
├── openapi_generator.py     # Main generator class
├── validators.py            # Validation functions
├── templates/
│   ├── mcp_server_template.ts.j2   # MCP server template
│   └── test_template.ts.j2         # Test template
├── tests/                   # Unit tests
├── pyproject.toml          # Poetry config
└── README.md               # This file
```

### Running Tests

```bash
cd generator
poetry install
poetry run pytest
poetry run pytest --cov=generator
```

### Code Quality

```bash
# Format with black
poetry run black .

# Type check with mypy
poetry run mypy generator

# Lint with ruff
poetry run ruff check .
```

## Advanced Usage

### Custom Templates

Modify templates in `generator/templates/`:

- `mcp_server_template.ts.j2`: Main server implementation
- `test_template.ts.j2`: Integration test suite

Variables available:
- `{{ title }}`: API title
- `{{ category }}`: API category
- `{{ version }}`: API version
- `{{ base_url }}`: API base URL
- `{{ oauth }}`: OAuth configuration object
- `{{ rate_limits }}`: Rate limit config
- `{{ tools }}`: List of tool definitions

### Programmatic Usage

```python
from generator import OpenAPIToMCP, GenerationConfig

config = GenerationConfig(
    spec_path="./specs/github.yaml",
    category="code",
    include_tests=True,
    validate_output=True
)

generator = OpenAPIToMCP(config)
result = await generator.generate()

if result.success:
    print(f"Generated {result.server_count} servers")
    for path in result.output_paths:
        print(f"  {path}")
else:
    print(f"Errors: {result.errors}")
```

## Troubleshooting

### "TypeScript compilation failed"

Install TypeScript dependencies:

```bash
cd integrations/code/your-server
npm install
```

### "OAuth configuration not found"

Some APIs use API keys instead of OAuth. This is a warning, not an error. Configure API keys via environment variables or Vault.

### "API has too many operations"

Large APIs are automatically split by tags. Use `--force-split` to split smaller APIs.

### "Spec validation failed"

Ensure your OpenAPI spec is valid:

```bash
# Install openapi-spec-validator
pip install openapi-spec-validator

# Validate spec
openapi-spec-validator ./specs/api.yaml
```

## Integration with Gateway

Generated MCP servers integrate with the enhanced MCP gateway:

1. **OAuth Proxy**: Gateway injects OAuth tokens via `OAUTH_ACCESS_TOKEN`
2. **Semantic Routing**: Gateway uses FAISS to select optimal tools
3. **GraphRAG**: Gateway enhances tool selection with relationship data
4. **Progressive Loading**: Gateway loads tool schemas in tiers

```yaml
# Gateway configuration
mcp_servers:
  - name: github
    path: integrations/code/github-rest-api
    category: code
    oauth:
      provider: github
      vault_path: secret/tenants/{tenant_id}/github
```

## Contributing

1. Follow CLAUDE.md Python standards (snake_case, docstrings)
2. Add tests for new features
3. Update templates if adding new capabilities
4. Run validation before committing

## License

MIT License - See LICENSE file for details

## Support

- Issues: https://github.com/your-org/connectors/issues
- Docs: https://docs.connectors-platform.io
- Discord: https://discord.gg/connectors
