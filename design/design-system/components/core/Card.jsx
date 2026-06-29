import React from "react";

/**
 * Forevue Card — the workhorse product surface. White, soft neutral border,
 * generous radius, subtle shadow. Calm and uncluttered.
 */
export function Card({
  as: Tag = "div",
  padding = "lg",
  interactive = false,
  children,
  style = {},
  ...rest
}) {
  const pads = { none: 0, sm: 12, md: 16, lg: 20, xl: 24 };
  const p = pads[padding] ?? pads.lg;

  return (
    <Tag
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        padding: p,
        transition: "box-shadow var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!interactive) return;
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.borderColor = "var(--border-default)";
      }}
      onMouseLeave={(e) => {
        if (!interactive) return;
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.borderColor = "var(--border-subtle)";
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Optional card header row with a title and trailing slot. */
export function CardHeader({ title, eyebrow, trailing, style = {} }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
        ...style,
      }}
    >
      <div>
        {eyebrow && (
          <div
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: 700,
              letterSpacing: "var(--tracking-eyebrow)",
              textTransform: "uppercase",
              color: "var(--color-deep-teal)",
              marginBottom: 4,
            }}
          >
            {eyebrow}
          </div>
        )}
        {title && (
          <div style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--text-strong)" }}>
            {title}
          </div>
        )}
      </div>
      {trailing}
    </div>
  );
}
