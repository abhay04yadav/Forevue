"""Output validation — narration must not cite figures absent from grounded rows (Ch3 §8)."""

import re
from typing import Any

_NUMBER_RE = re.compile(r"\b\d+(?:\.\d+)?\b")


def _numbers_from_rows(rows: list[dict[str, Any]]) -> set[str]:
    found: set[str] = set()
    for row in rows:
        for value in row.values():
            if isinstance(value, bool):
                continue
            if isinstance(value, int):
                found.add(str(value))
                found.add(f"{value:.1f}")
            elif isinstance(value, float):
                found.add(str(int(value)) if value.is_integer() else str(value))
                found.add(f"{value:.1f}")
            elif value is not None:
                for match in _NUMBER_RE.findall(str(value)):
                    found.add(match)
    return found


def validate_narration(narration: str | None, rows: list[dict[str, Any]]) -> str | None:
    """Reject fabricated figures by replacing narration when it cites numbers not in rows."""
    if not narration or not rows:
        return narration

    allowed = _numbers_from_rows(rows)
    cited = set(_NUMBER_RE.findall(narration))
    if not cited:
        return narration

    ungrounded = {n for n in cited if n not in allowed and not _is_harmless_count(n, rows)}
    if not ungrounded:
        return narration

    row_count = len(rows)
    metric_hint = rows[0].get("value")
    if metric_hint is not None and len(rows) == 1:
        return f"The governed data shows {metric_hint}."
    return f"Found {row_count} grounded row(s) in your data. See the table for exact figures."

def _is_harmless_count(number: str, rows: list[dict[str, Any]]) -> bool:
    """Allow row-count references that match the grounded result size."""
    try:
        return int(float(number)) == len(rows)
    except ValueError:
        return False
