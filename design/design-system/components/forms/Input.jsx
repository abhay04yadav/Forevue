import React from "react";

/**
 * Forevue Input — calm text field with label, optional hint/error, deep-teal focus ring.
 */
export function Input({
  label,
  hint,
  error,
  id,
  iconLeft = null,
  size = "md",
  style = {},
  inputStyle = {},
  ...rest
}) {
  const reactId = React.useId();
  const inputId = id || reactId;
  const [focused, setFocused] = React.useState(false);
  const heights = { sm: 34, md: 40, lg: 46 };
  const h = heights[size] || heights.md;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-strong)",
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: h,
          padding: "0 12px",
          background: "var(--surface-card)",
          border: `1px solid ${error ? "var(--color-risk-high)" : focused ? "var(--focus-ring)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-md)",
          boxShadow: focused && !error ? "var(--shadow-focus)" : "none",
          transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
        }}
      >
        {iconLeft && <span style={{ display: "inline-flex", color: "var(--color-neutral-500)" }}>{iconLeft}</span>}
        <input
          id={inputId}
          onFocus={(e) => { setFocused(true); rest.onFocus && rest.onFocus(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur && rest.onBlur(e); }}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            color: "var(--text-strong)",
            ...inputStyle,
          }}
          {...rest}
        />
      </div>
      {(hint || error) && (
        <span style={{ fontSize: 12, color: error ? "var(--color-risk-high)" : "var(--text-muted)" }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
