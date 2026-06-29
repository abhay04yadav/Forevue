import React from "react";

/**
 * Forevue Button — one teal PRIMARY action per view; secondaries are quiet/bordered.
 * Calm, utilitarian. No gradients, no glow.
 */
export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  children,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: "0 12px", height: 32, fontSize: 13 },
    md: { padding: "0 16px", height: 40, fontSize: 14 },
    lg: { padding: "0 22px", height: 48, fontSize: 15 },
  };

  const variants = {
    primary: {
      background: "var(--action-primary)",
      color: "var(--action-primary-text)",
      border: "1px solid var(--action-primary)",
    },
    secondary: {
      background: "var(--surface-card)",
      color: "var(--color-deep-teal)",
      border: "1px solid var(--border-default)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-deep-teal)",
      border: "1px solid transparent",
    },
    danger: {
      background: "var(--surface-card)",
      color: "var(--color-risk-high)",
      border: "1px solid var(--color-risk-high)",
    },
  };

  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: fullWidth ? "100%" : "auto",
        height: s.height,
        padding: s.padding,
        fontFamily: "var(--font-sans)",
        fontSize: s.fontSize,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: "0.005em",
        borderRadius: "var(--radius-md)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)",
        whiteSpace: "nowrap",
        ...v,
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "translateY(0.5px)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "none";
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === "primary") e.currentTarget.style.background = "var(--action-primary-hover)";
        else if (variant === "secondary") e.currentTarget.style.background = "var(--color-neutral-50)";
        else if (variant === "ghost") e.currentTarget.style.background = "var(--color-teal-50)";
        else if (variant === "danger") e.currentTarget.style.background = "var(--color-risk-high-bg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = v.background;
        e.currentTarget.style.transform = "none";
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
