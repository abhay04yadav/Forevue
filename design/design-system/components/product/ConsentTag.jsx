import React from "react";

/**
 * Forevue ConsentTag — minors always carry a consent-required marker (DPDP).
 * Privacy-first: never show a minor's data without this present.
 */
export function ConsentTag({ state = "required", label, size = "md", style = {} }) {
  const states = {
    required: {
      label: "Minor — consent required",
      color: "var(--color-amber-700)",
      bg: "var(--color-amber-50)",
      border: "var(--color-amber-200)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <rect x="3" y="7" width="10" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
    granted: {
      label: "Consent on file",
      color: "var(--color-risk-low)",
      bg: "var(--color-risk-low-bg)",
      border: "var(--color-risk-low)",
      icon: (
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  };
  const s = states[state] || states.required;
  const text = label || s.label;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: size === "sm" ? 22 : 26,
        padding: "0 10px",
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-sans)",
        fontSize: size === "sm" ? 11.5 : 12.5,
        fontWeight: 600,
        color: s.color,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span aria-hidden="true" style={{ display: "inline-flex" }}>{s.icon}</span>
      {text}
    </span>
  );
}
