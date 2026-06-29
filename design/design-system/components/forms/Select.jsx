import React from "react";

/**
 * Forevue Select — native select styled to match Input. Deep-teal focus ring.
 */
export function Select({ label, hint, id, size = "md", children, style = {}, ...rest }) {
  const reactId = React.useId();
  const selectId = id || reactId;
  const [focused, setFocused] = React.useState(false);
  const heights = { sm: 34, md: 40, lg: 46 };
  const h = heights[size] || heights.md;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          position: "relative",
          height: h,
          border: `1px solid ${focused ? "var(--focus-ring)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-md)",
          background: "var(--surface-card)",
          boxShadow: focused ? "var(--shadow-focus)" : "none",
          transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
        }}
      >
        <select
          id={selectId}
          onFocus={(e) => { setFocused(true); rest.onFocus && rest.onFocus(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur && rest.onBlur(e); }}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            width: "100%",
            height: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            padding: "0 34px 0 12px",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "var(--text-strong)",
            cursor: "pointer",
          }}
          {...rest}
        >
          {children}
        </select>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "var(--color-neutral-500)",
            fontSize: 11,
          }}
        >
          ▾
        </span>
      </div>
      {hint && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{hint}</span>}
    </div>
  );
}
