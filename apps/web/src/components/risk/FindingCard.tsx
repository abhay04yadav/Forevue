import type { RiskFindingResponse } from "@/api/types";
import { cn } from "@/lib/utils";

const METRIC_LABELS: Record<string, string> = {
  scope: "Scope",
  value: "Attendance",
  threshold: "Threshold",
  sessions: "Sessions tracked",
  prior_pct: "Prior period",
  recent_pct: "Recent period",
  drop: "Change",
  failing_count: "Failing internals",
  latest_pct: "Latest score",
  baseline_pct: "Baseline",
  overdue_days: "Days overdue",
};

const PERCENT_KEYS = new Set([
  "value",
  "threshold",
  "prior_pct",
  "recent_pct",
  "drop",
  "latest_pct",
  "baseline_pct",
]);

const SCOPE_LABELS: Record<string, string> = {
  overall: "Overall",
  trend: "Trend",
};

function formatMetricValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (key === "scope" && typeof value === "string") {
    return SCOPE_LABELS[value] ?? value;
  }
  if (typeof value === "number") {
    if (PERCENT_KEYS.has(key)) {
      return key === "drop" ? `${value} pts` : `${value}%`;
    }
    return String(value);
  }
  return String(value);
}

const EVIDENCE_ORDER: Record<string, string[]> = {
  ATTENDANCE_BELOW_THRESHOLD: ["value", "threshold", "sessions", "scope"],
  ATTENDANCE_DECLINING: ["prior_pct", "recent_pct", "drop", "threshold"],
  ACADEMIC_FAILING_INTERNALS: ["failing_count", "threshold"],
  ACADEMIC_DECLINE: ["latest_pct", "baseline_pct", "drop", "threshold"],
  FEE_OVERDUE: ["overdue_days", "threshold"],
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high: {
    bg: "var(--color-risk-high-bg)",
    text: "var(--color-risk-high)",
    label: "High",
  },
  medium: {
    bg: "var(--color-risk-watch-bg)",
    text: "var(--color-risk-watch)",
    label: "Medium",
  },
  low: {
    bg: "var(--color-neutral-100)",
    text: "var(--text-muted)",
    label: "Low",
  },
};

function orderedEvidenceKeys(code: string, evidence: Record<string, unknown>): string[] {
  const preferred = EVIDENCE_ORDER[code] ?? [];
  const keys = Object.keys(evidence);
  const ordered = preferred.filter((key) => keys.includes(key));
  const rest = keys.filter((key) => !ordered.includes(key));
  return [...ordered, ...rest];
}

export interface FindingCardProps {
  finding: RiskFindingResponse;
}

/** Risk finding with human-readable evidence metrics (not raw JSON). */
export function FindingCard({ finding }: FindingCardProps) {
  const evidence = (finding.evidence ?? {}) as Record<string, unknown>;
  const keys = orderedEvidenceKeys(finding.code, evidence);
  const severity = SEVERITY_STYLES[finding.severity.toLowerCase()] ?? SEVERITY_STYLES.low;

  return (
    <li className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold capitalize text-[var(--text-strong)]">
          {finding.risk_type}
        </span>
        <span className="rounded-full bg-[var(--color-neutral-100)] px-2 py-px text-[11px] font-semibold text-[var(--text-muted)]">
          {finding.code.replaceAll("_", " ")}
        </span>
        <span
          className="rounded-full px-2 py-px text-[11px] font-semibold capitalize"
          style={{ background: severity.bg, color: severity.text }}
        >
          {severity.label}
        </span>
        <span className="ml-auto text-xs font-semibold tabular-nums text-[var(--text-muted)]">
          +{Math.round(finding.weight_contribution)} score
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-[var(--text-body)]">{finding.message}</p>

      {keys.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {keys.map((key) => (
            <div
              key={key}
              className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-page)] px-3 py-2"
            >
              <dt className="text-[10px] font-semibold tracking-wide text-[var(--text-muted)] uppercase">
                {METRIC_LABELS[key] ?? key.replaceAll("_", " ")}
              </dt>
              <dd className="fv-data mt-0.5 text-sm font-bold tabular-nums text-[var(--text-strong)]">
                {formatMetricValue(key, evidence[key])}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {finding.code === "ATTENDANCE_BELOW_THRESHOLD" &&
        typeof evidence.value === "number" &&
        typeof evidence.threshold === "number" && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-[var(--text-muted)]">
              <span>vs threshold</span>
              <span className="tabular-nums">
                {evidence.value}% / {evidence.threshold}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-neutral-100)]">
              <div
                className={cn(
                  "h-full rounded-[var(--radius-pill)]",
                  evidence.value < evidence.threshold
                    ? "bg-[var(--color-risk-high)]"
                    : "bg-[var(--color-teal-500)]",
                )}
                style={{ width: `${Math.min(100, evidence.value)}%` }}
              />
            </div>
          </div>
        )}
    </li>
  );
}
