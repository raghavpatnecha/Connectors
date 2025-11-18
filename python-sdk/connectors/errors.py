"""Error types for Connectors SDK."""

from typing import Optional, Any


class ConnectorsError(Exception):
    """Base exception for all Connectors SDK errors."""

    def __init__(self, message: str, **kwargs: Any) -> None:
        super().__init__(message)
        self.message = message
        for key, value in kwargs.items():
            setattr(self, key, value)


class ValidationError(ConnectorsError):
    """Raised when input validation fails."""

    def __init__(self, message: str, field: Optional[str] = None, value: Any = None) -> None:
        super().__init__(message, field=field, value=value)
        self.field = field
        self.value = value


class HTTPError(ConnectorsError):
    """Raised when HTTP request fails."""

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        response_body: Optional[str] = None,
    ) -> None:
        super().__init__(message, status_code=status_code, response_body=response_body)
        self.status_code = status_code
        self.response_body = response_body


class TimeoutError(ConnectorsError):
    """Raised when request times out."""

    def __init__(self, message: str, cause: Optional[Exception] = None) -> None:
        super().__init__(message, cause=cause)
        self.cause = cause


class RetryableError(ConnectorsError):
    """Raised for errors that can be retried."""

    def __init__(self, message: str, cause: Optional[Exception] = None) -> None:
        super().__init__(message, cause=cause)
        self.cause = cause


class DeploymentTimeoutError(ConnectorsError):
    """Raised when MCP deployment times out."""

    def __init__(
        self, message: str, deployment_id: str, timeout: int
    ) -> None:
        super().__init__(message, deployment_id=deployment_id, timeout=timeout)
        self.deployment_id = deployment_id
        self.timeout = timeout


class DeploymentFailedError(ConnectorsError):
    """Raised when MCP deployment fails."""

    def __init__(
        self, message: str, deployment_id: str, reason: Optional[str] = None
    ) -> None:
        super().__init__(message, deployment_id=deployment_id, reason=reason)
        self.deployment_id = deployment_id
        self.reason = reason
