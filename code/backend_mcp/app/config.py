"""Application configuration helpers."""

from __future__ import annotations

import json
import shlex
from functools import lru_cache
from typing import Any

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central place for pulling configuration from the environment/.env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongodb_uri: str = Field(
        default="mongodb://localhost:27017",
        validation_alias=AliasChoices("MONGODB_URI", "MONGO_URI"),
    )
    mongodb_database: str = Field(
        default="weather",
        validation_alias=AliasChoices("MONGODB_DATABASE", "MONGO_DATABASE", "MONGODB_DB"),
    )
    mongodb_collection: str = Field(
        default="measurements",
        validation_alias=AliasChoices("MONGODB_COLLECTION", "MONGO_COLLECTION"),
    )
    mongodb_sort_field: str = Field(
        default="timestamp",
        validation_alias=AliasChoices("MONGODB_SORT_FIELD", "MONGO_SORT_FIELD"),
    )

    mongo_mcp_command: str = Field(
        default="npx",
        validation_alias=AliasChoices("MONGO_MCP_COMMAND", "MCP_MONGO_COMMAND"),
    )
    mongo_mcp_args: list[str] | str = Field(
        default_factory=lambda: ["@mongodb-labs/mongomcp", "serve"],
        validation_alias=AliasChoices("MONGO_MCP_ARGS", "MCP_MONGO_ARGS"),
    )
    mongo_mcp_http_url: str | None = Field(
        default=None,
        validation_alias=AliasChoices("MONGO_MCP_HTTP_URL", "MCP_MONGO_HTTP_URL", "MCP_SERVER_URL"),
    )
    mongo_mcp_http_headers: dict[str, str] = Field(
        default_factory=dict,
        validation_alias=AliasChoices("MONGO_MCP_HTTP_HEADERS", "MCP_MONGO_HTTP_HEADERS"),
    )
    mcp_tool_name: str = Field(
        default="mongodb.collection.findOne",
        validation_alias=AliasChoices("MCP_TOOL_NAME", "MONGO_MCP_TOOL_NAME"),
    )
    mongo_tool_arguments: dict[str, Any] = Field(
        default_factory=dict,
        validation_alias=AliasChoices("MCP_TOOL_ARGUMENTS", "MONGO_TOOL_ARGUMENTS"),
    )
    mcp_disallowed_tools: list[str] | str = Field(
        default_factory=list,
        validation_alias=AliasChoices("MCP_DISALLOWED_TOOLS", "MONGO_MCP_DISALLOWED_TOOLS"),
    )
    groq_model: str = Field(
        default="qwen/qwen3-32b",
        validation_alias=AliasChoices("GROQ_MODEL"),
    )
    groq_temperature: float = Field(
        default=0.6,
        validation_alias=AliasChoices("GROQ_TEMPERATURE"),
    )
    groq_max_tokens: int | None = Field(
        default=1024,
        validation_alias=AliasChoices("GROQ_MAX_TOKENS"),
    )
    groq_max_retries: int = Field(
        default=1,
        validation_alias=AliasChoices("GROQ_MAX_RETRIES"),
    )
    groq_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("GROQ_API_KEY"),
    )
    agent_additional_instructions: str = Field(
        default=(
            "Always call the MongoDB MCP tool to gather real data before responding. "
            "Return only valid JSON with keys latest, history, count, summary, recommendation. "
            "The latest/history entries must mirror the tool output documents."
        ),
        validation_alias=AliasChoices("AGENT_INSTRUCTIONS", "MCP_AGENT_INSTRUCTIONS"),
    )
    mcp_agent_max_steps: int = Field(
        default=3,
        validation_alias=AliasChoices("MCP_AGENT_MAX_STEPS", "MONGO_MCP_MAX_STEPS"),
    )

    @field_validator("mongo_mcp_args", mode="before")
    @classmethod
    def _parse_command_args(cls, value: Any) -> list[str]:
        if isinstance(value, str):
            return shlex.split(value)
        if isinstance(value, list):
            return value
        return []

    @field_validator("mongo_tool_arguments", mode="before")
    @classmethod
    def _parse_tool_arguments(cls, value: Any) -> dict[str, Any]:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return {}
            try:
                return json.loads(value)
            except json.JSONDecodeError as exc:  # pragma: no cover - config guardrail
                raise ValueError("MCP_TOOL_ARGUMENTS must be valid JSON") from exc
        return value or {}

    @field_validator("mongo_mcp_http_headers", mode="before")
    @classmethod
    def _parse_http_headers(cls, value: Any) -> dict[str, str]:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return {}
            try:
                parsed = json.loads(value)
            except json.JSONDecodeError as exc:  # pragma: no cover
                raise ValueError("MONGO_MCP_HTTP_HEADERS must be valid JSON") from exc
            if not isinstance(parsed, dict):
                raise ValueError("MONGO_MCP_HTTP_HEADERS must be a JSON object")
            return {str(k): str(v) for k, v in parsed.items()}
        return {str(k): str(v) for k, v in (value or {}).items()}

    @field_validator("mcp_disallowed_tools", mode="before")
    @classmethod
    def _parse_disallowed_tools(cls, value: Any) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return []

    def build_mcp_environment(self) -> dict[str, str]:
        """Environment variables forwarded to the spawned MCP Mongo server."""

        return {
            "MONGODB_URI": self.mongodb_uri,
            "MONGODB_DATABASE": self.mongodb_database,
            "MONGODB_COLLECTION": self.mongodb_collection,
            "MONGODB_SORT_FIELD": self.mongodb_sort_field,
        }

    @field_validator("groq_max_tokens", mode="before")
    @classmethod
    def _empty_string_to_none(cls, value: Any) -> Any:
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return None
        return value


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""

    return Settings()
