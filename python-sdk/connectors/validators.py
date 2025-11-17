"""Input validation utilities."""

from typing import Any
from .errors import ValidationError


def validate_non_empty_string(value: Any, field_name: str) -> None:
    """Validate that value is a non-empty string."""
    if not isinstance(value, str):
        raise ValidationError(
            f"{field_name} must be a string",
            field=field_name,
            value=value
        )

    if not value.strip():
        raise ValidationError(
            f"{field_name} cannot be empty",
            field=field_name,
            value=value
        )


def validate_positive_number(value: Any, field_name: str) -> None:
    """Validate that value is a positive number."""
    if not isinstance(value, (int, float)):
        raise ValidationError(
            f"{field_name} must be a number",
            field=field_name,
            value=value
        )

    if value <= 0:
        raise ValidationError(
            f"{field_name} must be positive",
            field=field_name,
            value=value
        )


def validate_config(config: Any) -> None:
    """Validate ConnectorsConfig."""
    validate_non_empty_string(config.base_url, "base_url")

    if config.timeout is not None:
        validate_positive_number(config.timeout, "timeout")

    if config.max_retries is not None:
        if not isinstance(config.max_retries, int) or config.max_retries < 0:
            raise ValidationError(
                "max_retries must be a non-negative integer",
                field="max_retries",
                value=config.max_retries
            )
