"""AI plane monitoring counters (Ch11 §6) — in-process metrics for gateway guardrails."""

from dataclasses import dataclass, field
from threading import Lock


@dataclass
class AIMetricsSnapshot:
    gateway_calls: int = 0
    cache_hits: int = 0
    abstentions: int = 0
    grounded_answers: int = 0
    output_validation_rejections: int = 0
    rag_retrievals: int = 0
    rag_empty_retrievals: int = 0
    session_memory_reads: int = 0
    session_memory_writes: int = 0


class AIMetrics:
    def __init__(self) -> None:
        self._lock = Lock()
        self._snapshot = AIMetricsSnapshot()

    def record_gateway_call(self, *, cached: bool) -> None:
        with self._lock:
            self._snapshot.gateway_calls += 1
            if cached:
                self._snapshot.cache_hits += 1

    def record_abstention(self) -> None:
        with self._lock:
            self._snapshot.abstentions += 1

    def record_grounded_answer(self) -> None:
        with self._lock:
            self._snapshot.grounded_answers += 1

    def record_output_validation_rejection(self) -> None:
        with self._lock:
            self._snapshot.output_validation_rejections += 1

    def record_rag_retrieval(self, *, empty: bool) -> None:
        with self._lock:
            self._snapshot.rag_retrievals += 1
            if empty:
                self._snapshot.rag_empty_retrievals += 1

    def record_session_memory_read(self) -> None:
        with self._lock:
            self._snapshot.session_memory_reads += 1

    def record_session_memory_write(self) -> None:
        with self._lock:
            self._snapshot.session_memory_writes += 1

    def snapshot(self) -> AIMetricsSnapshot:
        with self._lock:
            return AIMetricsSnapshot(**self._snapshot.__dict__)


_metrics = AIMetrics()


def get_ai_metrics() -> AIMetrics:
    return _metrics


def reset_ai_metrics_for_tests() -> None:
    global _metrics
    _metrics = AIMetrics()
