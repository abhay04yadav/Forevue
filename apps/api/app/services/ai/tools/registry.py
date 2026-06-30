"""Allow-listed AI tools (Ch3 §5)."""

from typing import Any

from app.services.ai.semantic import catalog

SEMANTIC_QUERY_TOOL = "query_semantic_metric"


def tool_definitions_for_role(role: str) -> list[dict[str, Any]]:
    metrics = [metric.id for metric in catalog.metrics_for_role(role)]
    if not metrics:
        return []
    return [
        {
            "type": "function",
            "function": {
                "name": SEMANTIC_QUERY_TOOL,
                "description": "Query a governed semantic metric with optional dimensions and filters.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "metric": {"type": "string", "enum": metrics},
                        "dimensions": {
                            "type": "array",
                            "items": {"type": "string"},
                        },
                        "filters": {
                            "type": "object",
                            "additionalProperties": {"type": "string"},
                        },
                        "limit": {"type": "integer", "minimum": 1, "maximum": 500},
                    },
                    "required": ["metric"],
                },
            },
        }
    ]
