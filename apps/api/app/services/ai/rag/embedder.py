"""Deterministic local embedder for RAG (Ch3 §6) — no external API required in dev/tests."""

import hashlib
import math
import re
from typing import Sequence

from app.core.config import settings

_TOKEN_RE = re.compile(r"[a-z0-9]+", re.IGNORECASE)


def embed_text(text: str, *, dimensions: int | None = None) -> list[float]:
    dims = dimensions or settings.ai_embedding_dimensions
    vector = [0.0] * dims
    tokens = _TOKEN_RE.findall(text.lower())
    if not tokens:
        return vector

    for token in tokens:
        digest = hashlib.sha256(token.encode()).digest()
        for i in range(dims):
            byte = digest[i % len(digest)]
            vector[i] += ((byte / 255.0) * 2.0) - 1.0

    norm = math.sqrt(sum(v * v for v in vector))
    if norm == 0:
        return vector
    return [v / norm for v in vector]


def cosine_similarity(a: Sequence[float], b: Sequence[float]) -> float:
    if len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b, strict=True))
    return dot
