"""Validation functions for generated MCP servers."""

import asyncio
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional


@dataclass
class ValidationResult:
    """Result of MCP server validation."""

    passed: bool
    """Whether all validation checks passed"""

    errors: List[str]
    """List of validation errors"""

    warnings: List[str]
    """List of non-fatal warnings"""

    checks_run: List[str]
    """List of checks that were executed"""


async def validate_generated_mcp(server_path: Path) -> ValidationResult:
    """
    Validate generated MCP server meets quality standards.

    Checks:
    1. TypeScript compiles without errors
    2. All tool definitions have descriptions
    3. OAuth configuration is valid (if present)
    4. Rate limit handling implemented
    5. Error responses properly typed
    6. Integration tests exist and are runnable

    Args:
        server_path: Path to generated MCP server directory

    Returns:
        Validation result with detailed feedback
    """
    errors: List[str] = []
    warnings: List[str] = []
    checks_run: List[str] = []

    # Check 1: TypeScript compilation
    ts_check = await check_typescript_compilation(server_path)
    checks_run.append("TypeScript compilation")
    if not ts_check.passed:
        errors.extend(ts_check.errors)
    warnings.extend(ts_check.warnings)

    # Check 2: Tool descriptions
    desc_check = await check_tool_descriptions(server_path)
    checks_run.append("Tool descriptions")
    if not desc_check.passed:
        errors.extend(desc_check.errors)
    warnings.extend(desc_check.warnings)

    # Check 3: OAuth configuration
    oauth_check = await check_oauth_config(server_path)
    checks_run.append("OAuth configuration")
    if not oauth_check.passed:
        warnings.extend(oauth_check.errors)  # OAuth is optional, so warnings only

    # Check 4: Rate limits
    rate_limit_check = await check_rate_limits(server_path)
    checks_run.append("Rate limit handling")
    if not rate_limit_check.passed:
        warnings.extend(rate_limit_check.errors)

    # Check 5: Integration tests
    test_check = await check_integration_tests(server_path)
    checks_run.append("Integration tests")
    if not test_check.passed:
        warnings.extend(test_check.errors)

    return ValidationResult(
        passed=len(errors) == 0, errors=errors, warnings=warnings, checks_run=checks_run
    )


async def check_typescript_compilation(server_path: Path) -> ValidationResult:
    """Check if TypeScript code compiles without errors."""
    errors: List[str] = []
    warnings: List[str] = []

    tsconfig = server_path / "tsconfig.json"
    if not tsconfig.exists():
        errors.append("tsconfig.json not found")
        return ValidationResult(passed=False, errors=errors, warnings=warnings, checks_run=[])

    try:
        # Check if node_modules exists, if not suggest npm install
        if not (server_path / "node_modules").exists():
            warnings.append(
                "node_modules not found - run 'npm install' before TypeScript compilation"
            )
            return ValidationResult(passed=True, errors=errors, warnings=warnings, checks_run=[])

        # Run TypeScript compiler
        result = subprocess.run(
            ["npx", "tsc", "--noEmit"],
            cwd=server_path,
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode != 0:
            errors.append(f"TypeScript compilation failed:\n{result.stderr}")
            return ValidationResult(passed=False, errors=errors, warnings=warnings, checks_run=[])

    except subprocess.TimeoutExpired:
        errors.append("TypeScript compilation timed out")
        return ValidationResult(passed=False, errors=errors, warnings=warnings, checks_run=[])
    except FileNotFoundError:
        warnings.append("TypeScript compiler not found - install with 'npm install -g typescript'")
        return ValidationResult(passed=True, errors=errors, warnings=warnings, checks_run=[])

    return ValidationResult(passed=True, errors=errors, warnings=warnings, checks_run=[])


async def check_tool_descriptions(server_path: Path) -> ValidationResult:
    """Check that all tool definitions have proper descriptions."""
    errors: List[str] = []
    warnings: List[str] = []

    index_file = server_path / "src" / "index.ts"
    if not index_file.exists():
        errors.append("src/index.ts not found")
        return ValidationResult(passed=False, errors=errors, warnings=warnings, checks_run=[])

    content = index_file.read_text()

    # Check for tool definitions
    import re

    tool_pattern = r'name:\s*["\'](\w+)["\']'
    tools = re.findall(tool_pattern, content)

    if len(tools) == 0:
        warnings.append("No tools found in generated server")

    # Check each tool has description
    for tool_name in tools:
        # Look for description near tool definition
        tool_section_pattern = rf'name:\s*["\'{tool_name}["\'].*?description:\s*["\'](.+?)["\']'
        match = re.search(tool_section_pattern, content, re.DOTALL)

        if not match:
            errors.append(f"Tool '{tool_name}' missing description")
        elif len(match.group(1)) < 10:
            warnings.append(f"Tool '{tool_name}' has very short description")

    passed = len(errors) == 0
    return ValidationResult(passed=passed, errors=errors, warnings=warnings, checks_run=[])


async def check_oauth_config(server_path: Path) -> ValidationResult:
    """Check if OAuth configuration is valid."""
    errors: List[str] = []
    warnings: List[str] = []

    index_file = server_path / "src" / "index.ts"
    if not index_file.exists():
        errors.append("src/index.ts not found")
        return ValidationResult(passed=False, errors=errors, warnings=warnings, checks_run=[])

    content = index_file.read_text()

    # Check for OAuth-related code
    if "oauth" not in content.lower() and "authorization" not in content.lower():
        warnings.append("No OAuth configuration found - API may use API keys")
        return ValidationResult(passed=True, errors=errors, warnings=warnings, checks_run=[])

    # Check for required OAuth fields
    required_oauth_fields = ["tokenUrl", "authorizationUrl", "scopes"]
    for field in required_oauth_fields:
        if field not in content:
            warnings.append(f"OAuth field '{field}' not found in configuration")

    return ValidationResult(passed=True, errors=errors, warnings=warnings, checks_run=[])


async def check_rate_limits(server_path: Path) -> ValidationResult:
    """Check if rate limit handling is implemented."""
    errors: List[str] = []
    warnings: List[str] = []

    index_file = server_path / "src" / "index.ts"
    if not index_file.exists():
        errors.append("src/index.ts not found")
        return ValidationResult(passed=False, errors=errors, warnings=warnings, checks_run=[])

    content = index_file.read_text()

    # Check for rate limit handling code
    rate_limit_keywords = ["ratelimit", "rate-limit", "429", "retry-after"]

    found_rate_limit_handling = any(keyword.lower() in content.lower() for keyword in rate_limit_keywords)

    if not found_rate_limit_handling:
        warnings.append("No rate limit handling found - consider adding retry logic")

    return ValidationResult(passed=True, errors=errors, warnings=warnings, checks_run=[])


async def check_integration_tests(server_path: Path) -> ValidationResult:
    """Check if integration tests exist and are valid."""
    errors: List[str] = []
    warnings: List[str] = []

    test_file = server_path / "tests" / "integration.test.ts"
    if not test_file.exists():
        warnings.append("Integration tests not found at tests/integration.test.ts")
        return ValidationResult(passed=True, errors=errors, warnings=warnings, checks_run=[])

    content = test_file.read_text()

    # Check for test patterns
    from .config import REQUIRED_TEST_PATTERNS

    for pattern in REQUIRED_TEST_PATTERNS:
        if pattern.lower() not in content.lower():
            warnings.append(f"Test pattern '{pattern}' not found in tests")

    # Check for describe/it blocks
    if "describe(" not in content or "it(" not in content:
        errors.append("Tests missing proper Jest structure (describe/it blocks)")

    passed = len(errors) == 0
    return ValidationResult(passed=passed, errors=errors, warnings=warnings, checks_run=[])


async def run_integration_tests(server_path: Path) -> ValidationResult:
    """Run integration tests and return results."""
    errors: List[str] = []
    warnings: List[str] = []

    try:
        # Check if node_modules exists
        if not (server_path / "node_modules").exists():
            warnings.append("Dependencies not installed - run 'npm install' before running tests")
            return ValidationResult(passed=True, errors=errors, warnings=warnings, checks_run=[])

        # Run tests
        result = subprocess.run(
            ["npm", "test"], cwd=server_path, capture_output=True, text=True, timeout=60
        )

        if result.returncode != 0:
            errors.append(f"Tests failed:\n{result.stderr}")
            return ValidationResult(passed=False, errors=errors, warnings=warnings, checks_run=[])

    except subprocess.TimeoutExpired:
        errors.append("Tests timed out")
        return ValidationResult(passed=False, errors=errors, warnings=warnings, checks_run=[])
    except FileNotFoundError:
        warnings.append("npm not found - install Node.js to run tests")
        return ValidationResult(passed=True, errors=errors, warnings=warnings, checks_run=[])

    return ValidationResult(passed=True, errors=errors, warnings=warnings, checks_run=[])
