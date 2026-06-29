import React from "react";

/**
 * Forevue DataStat — a single figure with label. Public Sans 800, tabular numerals.
 * Optional small delta line. Numbers never use the serif.
 */
export function DataStat({ value, label, sub, delta, deltaDir = "flat", align = "left", style = {} }) {
  const deltaColors = {
    up: "var(--color-risk-low)",
    down: "var(--color-risk-high)",
    flat: "var(--text-muted)",
  };
  const arrow = deltaDir === "up" ? "↑" : deltaDir === "down" ? "↓" : "→";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: align, ...style }}>
      {label && (
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "var(--tracking-eyebrow)",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          fontFamily: "var(--font-data)",
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          fontSize: 34,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "var(--color-deep-teal)",
        }}
      >
        {value}
      </span>
      {(sub || delta) && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          {delta && (
            <span style={{ color: deltaColors[deltaDir], fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {arrow} {delta}
            </span>
          )}
          {sub && <span style={{ color: "var(--text-muted)" }}>{sub}</span>}
        </span>
      )}
    </div>
  );
}
