import React from "react";

/**
 * Forevue EvidenceCite — every AI answer shows its provenance. Grounded-or-abstain.
 * Renders the sources an answer is based on as quiet, clickable chips.
 */
export function EvidenceCite({ sources = [], label = "Based on", onOpen, style = {} }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, ...style }}>
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "var(--tracking-eyebrow)",
          textTransform: "uppercase",
          color: "var(--color-deep-teal)",
        }}
      >
        {label}
      </span>
      {sources.map((src, i) => {
        const text = typeof src === "string" ? src : src.label;
        const meta = typeof src === "string" ? null : src.meta;
        return (
          <button
            key={i}
            onClick={() => onOpen && onOpen(src, i)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 26,
              padding: "0 10px",
              background: "var(--surface-card)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-sans)",
              fontSize: 12.5,
              fontWeight: 500,
              color: "var(--color-neutral-700)",
              cursor: onOpen ? "pointer" : "default",
              transition: "border-color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard)",
            }}
            onMouseEnter={(e) => { if (onOpen) { e.currentTarget.style.borderColor = "var(--color-teal-300)"; e.currentTarget.style.background = "var(--color-teal-50)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-default)"; e.currentTarget.style.background = "var(--surface-card)"; }}
          >
            <span aria-hidden="true" style={{ display: "inline-flex", color: "var(--color-deep-teal)" }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M4 2.5h5L13 6.5V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M9 2.5V6.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </span>
            <span>{text}</span>
            {meta && <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>· {meta}</span>}
          </button>
        );
      })}
    </div>
  );
}
