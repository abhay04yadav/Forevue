import React from "react";

/**
 * Forevue IconButton — square, quiet button for a single icon (toolbars, close, more).
 * Pass an icon node (e.g. a Lucide <i data-lucide> or inline SVG) as children.
 */
export function IconButton({
  variant = "ghost",
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  children,
  style = {},
  ...rest
}) {
  const sizes = { sm: 30, md: 36, lg: 42 };
  const dim = sizes[size] || sizes.md;

  const variants = {
    ghost: { background: "transparent", color: "var(--color-neutral-600)", border: "1px solid transparent" },
    bordered: { background: "var(--surface-card)", color: "var(--color-deep-teal)", border: "1px solid var(--border-default)" },
    solid: { background: "var(--action-primary)", color: "#fff", border: "1px solid var(--action-primary)" },
  };
  const v = variants[variant] || variants.ghost;

  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dim,
        height: dim,
        borderRadius: "var(--radius-md)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background var(--duration-fast) var(--ease-standard)",
        ...v,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === "ghost") e.currentTarget.style.background = "var(--color-neutral-100)";
        else if (variant === "bordered") e.currentTarget.style.background = "var(--color-neutral-50)";
        else if (variant === "solid") e.currentTarget.style.background = "var(--action-primary-hover)";
      }}
      onMouseLeave={(e) => { e.currentTarget.style.background = v.background; }}
      {...rest}
    >
      {children}
    </button>
  );
}
