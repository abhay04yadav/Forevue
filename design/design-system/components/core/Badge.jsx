import React from "react";

/**
 * Forevue Badge — small status/count pill. Quiet by default; teal/amber/neutral tones.
 * Amber tone is the single accent — use sparingly.
 */
export function Badge({ tone = "neutral", children, style = {}, ...rest }) {
  const tones = {
    neutral: { background: "var(--color-neutral-100)", color: "var(--color-neutral-700)", border: "1px solid var(--border-subtle)" },
    teal:    { background: "var(--color-teal-50)", color: "var(--color-deep-teal)", border: "1px solid var(--color-teal-100)" },
    amber:   { background: "var(--color-amber-50)", color: "var(--color-amber-700)", border: "1px solid var(--color-amber-200)" },
    dark:    { background: "var(--color-midnight-teal)", color: "var(--text-on-dark)", border: "1px solid var(--color-midnight-teal)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 22,
        padding: "0 9px",
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        borderRadius: "var(--radius-pill)",
        whiteSpace: "nowrap",
        ...t,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}

/**
 * Forevue Tag — squared, dismissible label for filters/metadata. Tabular numerals on counts.
 */
export function Tag({ children, onRemove, style = {}, ...rest }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 26,
        padding: onRemove ? "0 6px 0 10px" : "0 10px",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--color-neutral-700)",
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-sm)",
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {children}
      {onRemove && (
        <button
          aria-label="Remove"
          onClick={onRemove}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            border: "none",
            background: "transparent",
            color: "var(--color-neutral-500)",
            cursor: "pointer",
            borderRadius: 4,
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
