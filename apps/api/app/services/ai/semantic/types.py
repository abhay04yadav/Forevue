"""Governed semantic-layer types (Ch3 §5, Ch6 §8).

The model selects metrics/dimensions/filters — never SQL. Deterministic code
validates and executes selections against tenant-scoped canonical data.
"""

from dataclasses import dataclass, field
from typing import Any, Literal

ValueType = Literal["integer", "float", "percentage"]

MAX_SEMANTIC_ROWS = 500
DEFAULT_SEMANTIC_LIMIT = 100


@dataclass(frozen=True)
class MetricDefinition:
    """A governed metric the semantic layer may expose to a role."""

    id: str
    label: str
    description: str
    value_type: ValueType
    allowed_dimensions: frozenset[str]
    allowed_filters: frozenset[str]
    allowed_roles: frozenset[str]


@dataclass
class SemanticSelection:
    """Structured selection the tool layer validates and executes."""

    metric: str
    dimensions: list[str] = field(default_factory=list)
    filters: dict[str, str] = field(default_factory=dict)
    limit: int = DEFAULT_SEMANTIC_LIMIT


@dataclass
class SemanticQueryResult:
    metric: str
    columns: list[str]
    rows: list[dict[str, Any]]
    row_count: int
    truncated: bool
    interpretation: str
