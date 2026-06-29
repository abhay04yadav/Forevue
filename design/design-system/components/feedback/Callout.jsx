import React from "react";

/**
 * Forevue Callout — quiet inline note. Includes the "abstain" tone for when
 * Forevue can't ground an answer (grounded-or-abstain), and a "draft" tone for
 * human-owned generated content.
 */
const TONES = {
  info:    { color: "var(--color-deep-teal)",  bg: "var(--color-teal-50)",  border: "var(--color-teal-100)" },
  abstain: { color: "var(--color-neutral-700)", bg: "var(--color-neutral-100)", border: "var(--border-subtle)" },
  draft:   { color: "var(--color-amber-700)",  bg: "var(--color-amber-50)",  border: "var(--color-amber-200)" },
  caution: { color: "var(--color-risk-high)",  bg: "var(--color-risk-high-bg)", border: "var(--color-risk-high)" },
};

export function Callout({ tone = "info", title, icon, children, style = {} }) {
  const t = TONES[tone] || TONES.info;
  return (
    <div
      style={{
        display: "flex",
        gap: 11,
        padding: "12px 14px",
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: "var(--radius-md)",
        ...style,
      }}
    >
      {icon && <span aria-hidden="true" style={{ display: "inline-flex", color: t.color, flex: "none", marginTop: 1 }}>{icon}</span>}
      <div style={{ minWidth: 0 }}>
        {title && (
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, color: t.color, marginBottom: children ? 3 : 0 }}>
            {title}
          </div>
        )}
        {children && (
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, lineHeight: 1.5, color: "var(--text-body)" }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
