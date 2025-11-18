# Python SDK - Installation

This guide covers installing and configuring the Connectors Python SDK.

## Requirements

- Python 3.10 or higher
- pip, poetry, or uv package manager
- Gateway running (local or remote)

## Installation

### Using pip

```bash
pip install connectors-sdk
```

### Using Poetry

```bash
poetry add connectors-sdk
```

### Using uv

```bash
uv pip install connectors-sdk
```

### From Source

```bash
git clone https://github.com/connectors/python-sdk.git
cd python-sdk
pip install -e .
```

## Verify Installation

```python
import connectors

print(f"Connectors SDK version: {connectors.__version__}")
```

## Configuration

### Environment Variables

The SDK reads configuration from environment variables:

```bash
# .env file
CONNECTORS_BASE_URL=http://localhost:3000
CONNECTORS_TENANT_ID=my-company
CONNECTORS_API_KEY=your-api-key
CONNECTORS_TIMEOUT=30
CONNECTORS_LOG_LEVEL=INFO
```

Load environment variables:

```python
from dotenv import load_dotenv
from connectors import Connectors

load_dotenv()

# Automatically reads from environment variables
connectors = Connectors()
```

### Constructor Configuration

```python
from connectors import Connectors

connectors = Connectors(
    base_url="http://localhost:3000",
    tenant_id="my-company",
    api_key="your-api-key",
    timeout=60,
    retries=5,
    log_level="DEBUG"
)
```

### Configuration File

Create a configuration file:

```python
# config/connectors.py
import os
from connectors import Connectors

def get_connectors() -> Connectors:
    return Connectors(
        base_url=os.environ.get("CONNECTORS_BASE_URL", "http://localhost:3000"),
        tenant_id=os.environ.get("CONNECTORS_TENANT_ID"),
        api_key=os.environ.get("CONNECTORS_API_KEY"),
        log_level=os.environ.get("CONNECTORS_LOG_LEVEL", "INFO")
    )
```

Use in your code:

```python
from config.connectors import get_connectors

async def main():
    connectors = get_connectors()
    tools = await connectors.tools.select("query")
```

## Gateway Setup

The SDK requires a running Connectors gateway.

### Local Development (Docker Compose)

1. Clone the Connectors repository:
```bash
git clone https://github.com/connectors/platform.git
cd platform
```

2. Start services:
```bash
docker compose up -d
```

3. Verify gateway is running:
```bash
curl http://localhost:3000/health
```

### Production (Kubernetes)

See [Deployment Guide](../../deployment/kubernetes.md) for production deployment.

## Dependencies

The SDK has the following dependencies (automatically installed):

```
aiohttp>=3.9.0        # Async HTTP client
pydantic>=2.0.0       # Data validation
python-dotenv>=1.0.0  # Environment variables
typing-extensions>=4.5.0  # Type hints
```

### Optional Dependencies

#### Development Tools

```bash
pip install connectors-sdk[dev]
```

Includes:
- pytest - Testing framework
- pytest-asyncio - Async test support
- mypy - Type checking
- black - Code formatting
- ruff - Linting

#### Documentation

```bash
pip install connectors-sdk[docs]
```

Includes:
- mkdocs - Documentation generator
- mkdocs-material - Material theme

## IDE Setup

### VS Code

Install Python extension and configure settings:

```json
// .vscode/settings.json
{
  "python.linting.enabled": true,
  "python.linting.mypyEnabled": true,
  "python.formatting.provider": "black",
  "python.analysis.typeCheckingMode": "strict",
  "editor.formatOnSave": true
}
```

### PyCharm

1. Go to Preferences → Project → Python Interpreter
2. Add connectors-sdk package
3. Enable type checking: Preferences → Editor → Inspections → Python → Type Checker

## Type Checking with mypy

Configure mypy for type checking:

```ini
# mypy.ini
[mypy]
python_version = 3.10
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True

[mypy-connectors.*]
ignore_missing_imports = False
```

Run type checking:
```bash
mypy your_code.py
```

## Testing Setup

### Install Test Dependencies

```bash
pip install connectors-sdk[dev]
```

### Write Tests

```python
# tests/test_tools.py
import pytest
from connectors import Connectors

@pytest.fixture
async def connectors():
    return Connectors(base_url="http://localhost:3000")

@pytest.mark.asyncio
async def test_tool_selection(connectors):
    tools = await connectors.tools.select("create PR")
    assert len(tools) > 0
    assert tools[0]["tool"]["category"] == "code"
```

### Run Tests

```bash
pytest tests/
```

## Logging Configuration

### Basic Logging

```python
import logging
from connectors import Connectors

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

connectors = Connectors(
    base_url="http://localhost:3000",
    log_level="DEBUG"
)
```

### Custom Logger

```python
import logging
from connectors import Connectors

# Create custom logger
logger = logging.getLogger("my_app")
logger.setLevel(logging.INFO)

handler = logging.FileHandler("connectors.log")
handler.setFormatter(logging.Formatter("%(asctime)s - %(message)s"))
logger.addHandler(handler)

# SDK will use this logger
connectors = Connectors(
    base_url="http://localhost:3000",
    logger=logger
)
```

## Common Issues

### Import Error

**Error:**
```
ModuleNotFoundError: No module named 'connectors'
```

**Solution:**
```bash
# Ensure SDK is installed
pip list | grep connectors-sdk

# Reinstall if missing
pip install connectors-sdk
```

### Gateway Connection Error

**Error:**
```
NetworkError: Connection refused to http://localhost:3000
```

**Solution:**
```bash
# Check if gateway is running
curl http://localhost:3000/health

# Start gateway if not running
cd platform && docker compose up -d gateway
```

### Type Checking Errors

**Error:**
```
error: Incompatible types in assignment
```

**Solution:**
```python
# Use proper type hints
from connectors.types import Tool, ToolSelection
from typing import List

tools: List[ToolSelection] = await connectors.tools.select("query")
```

### Async/Await Errors

**Error:**
```
RuntimeError: no running event loop
```

**Solution:**
```python
import asyncio

async def main():
    connectors = Connectors(base_url="...")
    tools = await connectors.tools.select("query")

# Use asyncio.run()
asyncio.run(main())
```

## Virtual Environments

### Using venv

```bash
# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install SDK
pip install connectors-sdk
```

### Using conda

```bash
# Create environment
conda create -n connectors python=3.10

# Activate
conda activate connectors

# Install SDK
pip install connectors-sdk
```

### Using poetry

```bash
# Initialize project
poetry init

# Add SDK
poetry add connectors-sdk

# Install dependencies
poetry install

# Run code
poetry run python your_code.py
```

## Docker Setup

### Dockerfile

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

CMD ["python", "main.py"]
```

### requirements.txt

```
connectors-sdk>=1.0.0
python-dotenv>=1.0.0
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    environment:
      - CONNECTORS_BASE_URL=http://gateway:3000
      - CONNECTORS_API_KEY=${CONNECTORS_API_KEY}
    depends_on:
      - gateway

  gateway:
    image: connectors/gateway:latest
    ports:
      - "3000:3000"
```

## Next Steps

- **[Client API](client.md)** - Learn about the main client API
- **[Tools API](tools.md)** - Semantic tool selection
- **[MCP API](mcp.md)** - Deploy and manage servers
- **[Examples](../examples.md)** - Common usage patterns

---

**[← Back to Python SDK](./)**
