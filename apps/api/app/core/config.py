from pathlib import Path
import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

_API_ROOT = Path(__file__).resolve().parents[2]
# Local `.env` must win over a stale shell DATABASE_URL — but never during pytest,
# where testcontainers inject DATABASE_URL and a checked-in .env would clobber it.
if not os.environ.get("FOREVUE_TESTING"):
    load_dotenv(_API_ROOT / ".env", override=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_API_ROOT / ".env") if not os.environ.get("FOREVUE_TESTING") else None,
        env_file_encoding="utf-8",
    )

    app_env: str = "development"
    log_level: str = "INFO"

    database_url: str
    """Postgres URL for the app's non-superuser role (app_user). RLS applies to this role."""

    migrations_database_url: str | None = None
    """Postgres URL used only by Alembic, as a privileged/owner role that can run DDL
    (CREATE ROLE app_user, GRANT, ENABLE/FORCE ROW LEVEL SECURITY, CREATE POLICY).
    Falls back to database_url for local dev against a superuser Postgres container."""

    app_db_password: str | None = None
    """Password the bootstrap migration assigns to the app_user role. Only read by
    migrations/versions/*; the running app never needs it (it connects via database_url)."""

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7

    frontend_origins: str = "http://localhost:5173"
    """Comma-separated allowed CORS origins for the frontend (Phase 3 §A.1).
    Default is the Vite dev server. Never combined with allow_credentials=True
    here -- auth is Bearer-token-in-header, not cookies, so credentialed CORS
    isn't needed."""

    redis_url: str | None = None
    """Redis for refresh-token denylist and auth rate limits (Ch6 DATA-6.1).
    When unset, an in-process store is used (dev/tests only)."""

    redis_fail_closed: bool = True
    """When Redis is configured, auth flows fail closed if Redis is unreachable."""

    auth_rate_limit_per_minute: int = 30
    """Per-identifier cap on /auth/* requests (Ch7 §10). Set 0 to disable."""

    ai_gateway_provider: str = "stub"
    """LLM provider routed through the AI Gateway (Ch3 §3). 'stub' for local/tests."""

    ai_gateway_cache_enabled: bool = True
    """Tenant-partitioned gateway response cache (Ch3 §3)."""

    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    openai_intent_model: str | None = None
    openai_narration_model: str | None = None

    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-3-5-haiku-latest"

    ai_session_memory_max_turns: int = 10
    ai_session_memory_ttl_seconds: int = 86400

    ai_rag_top_k: int = 5
    ai_rag_min_score: float = 0.05
    ai_embedding_dimensions: int = 384


settings = Settings()
