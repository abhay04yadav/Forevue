/** Product labels and enums aligned with the frozen Design System (risk tiers). */

export type Tier = "low" | "watch" | "high";
export type Severity = "low" | "medium" | "high";
export type RiskType = "attendance" | "academic" | "fee";

export const TIER_LABEL: Record<Tier, string> = { high: "High", watch: "Watch", low: "Low" };

export const RISK_TYPE_LABEL: Record<RiskType, string> = {
  attendance: "Attendance",
  academic: "Academic",
  fee: "Fee",
};

export const TYPE_LABEL: Record<string, string> = {
  mentor_meeting: "Mentor meeting",
  remedial_class: "Remedial class",
  parent_contact: "Parent contact",
  counselling: "Counselling",
  other: "Other",
};

export const STATUS_LABEL: Record<string, string> = {
  suggested: "Suggested",
  open: "Open",
  in_progress: "In progress",
  completed: "Completed",
  dismissed: "Dismissed",
};

export const OUTCOME_LABEL: Record<string, string> = {
  improved: "Improved",
  no_change: "No change",
  worsened: "Worsened",
  unknown: "Unknown",
};

export const TITLE_HINT: Record<string, string> = {
  mentor_meeting: "e.g. 1:1 check-in on attendance",
  remedial_class: "e.g. Extra DBMS problem session",
  parent_contact: "e.g. Call guardian about attendance",
  counselling: "e.g. Refer to student wellbeing cell",
  other: "Describe the action",
};

/** Severity styling for finding cards (maps tier → severity for legacy screens). */
export const SEV: Record<Severity, { ink: string; fill: string; bg: string }> = {
  high: { ink: "var(--color-risk-high)", fill: "var(--color-risk-high)", bg: "var(--color-risk-high-bg)" },
  medium: { ink: "var(--color-risk-watch)", fill: "var(--color-risk-watch)", bg: "var(--color-risk-watch-bg)" },
  low: { ink: "var(--color-risk-low)", fill: "var(--color-risk-low)", bg: "var(--color-risk-low-bg)" },
};

export const TIER_SEV: Record<Tier, Severity> = { high: "high", watch: "medium", low: "low" };

export function sevForTier(tier: Tier) {
  return SEV[TIER_SEV[tier]];
}
