"""HTTP client with retry logic and error handling."""

import asyncio
import random
from typing import TypeVar, Type, Optional, Dict, Any
import httpx
from .types import ConnectorsConfig
from .errors import HTTPError, RetryableError, TimeoutError as ConnectorsTimeoutError

T = TypeVar("T")


class HTTPClient:
    """HTTP client with exponential backoff and retry logic."""

    def __init__(self, config: ConnectorsConfig) -> None:
        self.base_url = config.base_url.rstrip("/")
        self.timeout = config.timeout / 1000  # Convert ms to seconds
        self.max_retries = config.max_retries
        self.headers = {
            "Content-Type": "application/json",
            **config.headers,
        }

        if config.api_key:
            self.headers["Authorization"] = f"Bearer {config.api_key}"
        if config.tenant_id:
            self.headers["X-Tenant-ID"] = config.tenant_id

    async def get(self, path: str, response_type: Type[T]) -> T:
        """Send GET request."""
        return await self.request("GET", path, response_type=response_type)

    async def post(self, path: str, data: Dict[str, Any], response_type: Type[T]) -> T:
        """Send POST request."""
        return await self.request("POST", path, json=data, response_type=response_type)

    async def delete(self, path: str, response_type: Type[T]) -> T:
        """Send DELETE request."""
        return await self.request("DELETE", path, response_type=response_type)

    async def request(
        self,
        method: str,
        path: str,
        response_type: Type[T],
        json: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> T:
        """Send HTTP request with retry logic."""
        url = f"{self.base_url}{path}"
        retryable_codes = {408, 429, 500, 502, 503, 504}

        last_error: Optional[Exception] = None

        for attempt in range(self.max_retries + 1):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.request(
                        method=method,
                        url=url,
                        headers=self.headers,
                        json=json,
                        params=params,
                        timeout=self.timeout,
                    )

                    if response.status_code >= 400:
                        if (
                            response.status_code in retryable_codes
                            and attempt < self.max_retries
                        ):
                            delay = self._calculate_backoff(attempt)
                            await asyncio.sleep(delay)
                            continue

                        raise HTTPError(
                            f"HTTP {response.status_code}: {response.text}",
                            status_code=response.status_code,
                            response_body=response.text,
                        )

                    data = response.json()

                    # Handle Pydantic models
                    if hasattr(response_type, "model_validate"):
                        return response_type.model_validate(data)  # type: ignore
                    # Handle dict type
                    elif response_type == dict:  # type: ignore
                        return data  # type: ignore
                    else:
                        return response_type(**data)  # type: ignore

            except httpx.TimeoutException as e:
                last_error = ConnectorsTimeoutError(
                    f"Request timeout after {self.timeout}s", cause=e
                )
                if attempt < self.max_retries:
                    await asyncio.sleep(self._calculate_backoff(attempt))
                    continue
            except httpx.RequestError as e:
                last_error = RetryableError(f"Request failed: {str(e)}", cause=e)
                if attempt < self.max_retries:
                    await asyncio.sleep(self._calculate_backoff(attempt))
                    continue

        if last_error:
            raise last_error

        # Should never reach here
        raise RetryableError("Request failed after all retries")

    def _calculate_backoff(self, attempt: int) -> float:
        """Calculate exponential backoff with jitter."""
        base_delay = 1.0
        max_delay = 30.0
        exponential = base_delay * (2**attempt)
        jitter = random.uniform(0, 1)
        return min(exponential + jitter, max_delay)
