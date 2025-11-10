"""Configuration constants for MCP generation."""

from pathlib import Path

# Generation limits
MAX_OPERATIONS_PER_SERVER = 100
MAX_DESCRIPTION_LENGTH = 500
MIN_DESCRIPTION_LENGTH = 10

# Timeouts
DEFAULT_HTTP_TIMEOUT = 30
VALIDATION_TIMEOUT = 60

# Paths
TEMPLATES_DIR = Path(__file__).parent / "templates"
OUTPUT_BASE_DIR = Path(__file__).parent.parent / "integrations"

# OAuth configuration
SUPPORTED_OAUTH_FLOWS = ["authorizationCode", "implicit", "clientCredentials"]
OAUTH_SCOPES_SEPARATOR = " "

# TypeScript generation
TS_INDENT = "  "
TS_LINE_LENGTH = 100

# Validation requirements
MIN_COVERAGE_PERCENT = 70
REQUIRED_TEST_PATTERNS = ["error handling", "oauth", "rate limit"]

# API categories mapping
CATEGORY_KEYWORDS = {
    "code": ["github", "gitlab", "bitbucket", "repository", "git", "commit", "pull request"],
    "communication": ["slack", "discord", "teams", "email", "chat", "message", "notification"],
    "project_management": ["jira", "asana", "trello", "monday", "task", "project", "sprint"],
    "cloud": ["aws", "azure", "gcp", "kubernetes", "docker", "terraform", "cloud"],
    "data": ["postgres", "mysql", "mongodb", "redis", "database", "query", "analytics"],
    "crm": ["salesforce", "hubspot", "pipedrive", "customer", "lead", "deal"],
    "marketing": ["mailchimp", "sendgrid", "marketing", "campaign", "newsletter"],
    "finance": ["stripe", "paypal", "payment", "invoice", "transaction"],
    "ai": ["openai", "anthropic", "ai", "ml", "model", "embedding", "completion"],
    "productivity": ["calendar", "drive", "docs", "sheets", "office", "productivity"],
}

# Rate limit defaults
DEFAULT_RATE_LIMIT = {
    "requests_per_minute": 60,
    "requests_per_hour": 1000,
    "burst_limit": 10,
}

# Tool naming conventions
TOOL_NAME_MAX_LENGTH = 50
TOOL_NAME_SEPARATOR = "_"
