"""Service responsible for orchestrating the MCP-use agent for weather data."""

from __future__ import annotations

import asyncio
import json
import logging
from functools import lru_cache
from typing import Any

try:  # pragma: no cover
    from langchain_groq import ChatGroq
except ImportError:  # pragma: no cover
    ChatGroq = None

from langchain_core.language_models.base import BaseLanguageModel
from mcp_use.agents.mcpagent import MCPAgent
from mcp_use.client import MCPClient

from app.config import Settings, get_settings


class WeatherAgentService:
    """Wraps an MCP-use agent that queries Mongo via the MCP tool."""

    _ping_filter_installed = False

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._client = MCPClient.from_dict(self._build_client_config())
        self._install_ping_warning_filter()
        self._tool_arguments: dict[str, Any] = self._resolve_tool_arguments()
        if ChatGroq is None:
            raise RuntimeError(
                "langchain-groq is required for the Groq chat model. Install it with `pip install langchain-groq`."
            )
        if not self._settings.groq_api_key:
            raise RuntimeError("GROQ_API_KEY must be set for the Groq LLM provider.")
        groq_kwargs: dict[str, Any] = {
            "model_name": self._settings.groq_model,
            "temperature": self._settings.groq_temperature,
            "max_retries": self._settings.groq_max_retries,
            "groq_api_key": self._settings.groq_api_key,
        }
        if self._settings.groq_max_tokens is not None:
            groq_kwargs["max_tokens"] = self._settings.groq_max_tokens
        self._llm = ChatGroq(**groq_kwargs)
        self._agent = MCPAgent(
            llm=self._llm,
            client=self._client,
            max_steps=self._settings.mcp_agent_max_steps,
            auto_initialize=False,
            memory_enabled=False,
            additional_instructions=self._settings.agent_additional_instructions,
            disallowed_tools=self._settings.mcp_disallowed_tools or None,
        )
        self._init_lock = asyncio.Lock()
        self._initialized = False

    async def warm_up(self) -> None:
        """Initialize the MCP agent ahead of incoming requests."""

        try:
            await self._ensure_initialized()
        except Exception:  # pragma: no cover - startup prefetch
            logger.exception("Failed to warm up MCP agent")
            raise

    def _install_ping_warning_filter(self) -> None:
        if WeatherAgentService._ping_filter_installed:
            return

        class _PingFilter(logging.Filter):
            def filter(self, record: logging.LogRecord) -> bool:
                message = record.getMessage()
                if "Failed to validate notification" in message and "method='ping'" in message:
                    return False
                return True

        logging.getLogger().addFilter(_PingFilter())
        WeatherAgentService._ping_filter_installed = True

    def _build_client_config(self) -> dict[str, Any]:
        server_config: dict[str, Any]
        if self._settings.mongo_mcp_http_url:
            server_config = {
                "url": self._settings.mongo_mcp_http_url,
            }
            if self._settings.mongo_mcp_http_headers:
                server_config["headers"] = self._settings.mongo_mcp_http_headers
        else:
            server_config = {
                "command": self._settings.mongo_mcp_command,
                "args": self._settings.mongo_mcp_args,
                "env": self._settings.build_mcp_environment(),
            }

        return {"mcpServers": {"mongo-weather": server_config}}

    def _resolve_tool_arguments(self) -> dict[str, Any]:
        if self._settings.mongo_tool_arguments:
            return self._settings.mongo_tool_arguments

        return {
            "database": self._settings.mongodb_database,
            "collection": self._settings.mongodb_collection,
            "filter": {},
            "sort": {self._settings.mongodb_sort_field: -1},
            "limit": 1,
        }

    async def _ensure_initialized(self) -> None:
        if self._initialized:
            return
        async with self._init_lock:
            if self._initialized:
                return
            await self._agent.initialize()
            self._initialized = True

    async def fetch_latest_weather(self) -> dict[str, Any]:
        """Execute the agent and parse the latest weather payload."""

        await self._ensure_initialized()
        tool_args = json.dumps(self._tool_arguments, separators=(",", ":"))
        query = (
            f"Call the MongoDB MCP tool '{self._settings.mcp_tool_name}' with arguments {tool_args}. "
            "Respond only with valid JSON of the shape "
            '{"latest": <latest document>, '
            '"summary": <short and funny sentence about the measurements containing the sensor values>, '
            '"recommendation": <dry sarcastic advice based on the readings>}. '
            "Do not invent fields inside the documents—reuse exactly what the tool returns. Summary field must contain sensor values"
        )
        max_attempts = 2
        last_error: Exception | None = None
        for attempt in range(1, max_attempts + 1):
            try:
                result = await self._agent.run(query)
                return self._normalize_result(result)
            except Exception as exc:
                last_error = exc
                logger.warning("Agent attempt %s/%s failed: %s", attempt, max_attempts, exc)
                if attempt == max_attempts:
                    raise
        raise last_error or RuntimeError("Agent failed without error")  # pragma: no cover - safety net

    def _normalize_result(self, result: Any) -> dict[str, Any]:
        payload = self._coerce_weather_payload(result)
        if payload:
            return payload
        raise RuntimeError(f"Unsupported agent result: {type(result)!r}")

    def _coerce_weather_payload(self, result: Any) -> dict[str, Any]:
        if result is None:
            return {}

        if isinstance(result, dict):
            if "latest" in result:
                return result
            return self._build_payload_from_docs([result])

        if isinstance(result, list):
            return self._build_payload_from_docs(result)

        if isinstance(result, str):
            text = result.strip()
            if not text:
                return {}
            try:
                return self._coerce_weather_payload(json.loads(text))
            except json.JSONDecodeError:
                embedded = self._extract_embedded_json(text)
                if embedded is not None:
                    return self._coerce_weather_payload(embedded)
                return {}

        if hasattr(result, "model_dump"):
            return self._coerce_weather_payload(result.model_dump())

        if hasattr(result, "content"):
            parts: list[str] = []
            for item in getattr(result, "content", []):
                if isinstance(item, str):
                    parts.append(item)
                else:
                    text = getattr(item, "text", None)
                    if text:
                        parts.append(text)
            if parts:
                return self._coerce_weather_payload("\n".join(parts))

        return {}

    def _extract_embedded_json(self, text: str) -> Any | None:
        decoder = json.JSONDecoder()
        for idx, char in enumerate(text):
            if char in "{[":
                try:
                    obj, _ = decoder.raw_decode(text[idx:])
                    return obj
                except json.JSONDecodeError:
                    continue
        return None

    def _build_payload_from_docs(self, docs: list[Any]) -> dict[str, Any]:
        if not docs:
            return {}

        latest = docs[0]
        payload: dict[str, Any] = {
            "latest": latest,
            "count": len(docs),
            "source": "mongodb-mcp",
        }
        history = docs[1:]
        if history:
            payload["history"] = history

        if isinstance(latest, dict):
            temperature = latest.get("temperature")
            humidity = latest.get("humidity")
            summary_bits: list[str] = []
            if temperature is not None:
                summary_bits.append(f"{temperature}°C")
            if humidity is not None:
                summary_bits.append(f"{humidity}% humidity")
            if summary_bits:
                payload["summary"] = f"Latest weather sample: {', '.join(summary_bits)}"

        return payload


@lru_cache
def get_weather_agent_service() -> WeatherAgentService:
    """Return a cached WeatherAgentService instance."""

    return WeatherAgentService()
