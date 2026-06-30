"""Provider factory — routes to stub or real LLM backends (Ch3 §3)."""

from app.core.config import settings
from app.services.ai.gateway.providers.base import LLMProvider
from app.services.ai.gateway.stub_provider import StubProvider


def get_llm_provider() -> LLMProvider:
    name = settings.ai_gateway_provider.lower()
    if name == "stub":
        return StubProvider()
    if name == "openai":
        from app.services.ai.gateway.providers.openai_provider import OpenAIProvider

        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is required when AI_GATEWAY_PROVIDER=openai")
        return OpenAIProvider(
            api_key=settings.openai_api_key,
            model=settings.openai_model,
            intent_model=settings.openai_intent_model,
            narration_model=settings.openai_narration_model,
        )
    if name == "anthropic":
        from app.services.ai.gateway.providers.anthropic_provider import AnthropicProvider

        if not settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is required when AI_GATEWAY_PROVIDER=anthropic")
        return AnthropicProvider(
            api_key=settings.anthropic_api_key,
            model=settings.anthropic_model,
        )
    raise ValueError(f"Unknown AI gateway provider: {settings.ai_gateway_provider}")
