import type { WidgetDefinition } from "./types";

/** Generic placeholder widgets — Dashboard Framework base set (not role-specific) */
export const baseWidgets: WidgetDefinition[] = [
  { id: "w1", title: "Trend over time", kind: "chart", footer: "Placeholder widget" },
  { id: "w2", title: "Breakdown", kind: "chart", footer: "Placeholder widget" },
  { id: "w3", title: "Distribution", kind: "chart", footer: "Placeholder widget" },
  { id: "w4", title: "Recent items", kind: "list", footer: "Placeholder widget" },
  { id: "w5", title: "Comparison", kind: "chart", footer: "Placeholder widget" },
  { id: "w6", title: "Summary", kind: "list", footer: "Placeholder widget" },
];

export const defaultQuickActionLabels = [
  "Summarize this view",
  "Explain what changed",
  "Draft an update",
  "Ask a question",
] as const;

export const defaultKpis = [
  { id: "k1", label: "Total in scope", value: "12", sub: "items", delta: "2", deltaDir: "up" as const },
  { id: "k2", label: "Active", value: "5", sub: "this week", delta: "1", deltaDir: "up" as const },
  {
    id: "k3",
    label: "Needs attention",
    value: "2",
    sub: "to review",
    delta: "1",
    deltaDir: "down" as const,
  },
  { id: "k4", label: "On track", value: "83%", sub: "completion", delta: "4", deltaDir: "up" as const },
];
