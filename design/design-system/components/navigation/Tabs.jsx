import React from "react";

/**
 * Forevue Tabs — quiet underline tabs. Active tab is teal with a teal underline.
 * Controlled (value+onChange) or uncontrolled (defaultValue).
 */
export function Tabs({ items = [], value, defaultValue, onChange, style = {} }) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.id);
  const active = isControlled ? value : internal;

  const select = (id) => { if (!isControlled) setInternal(id); onChange && onChange(id); };

  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: 4,
        borderBottom: "1px solid var(--border-subtle)",
        ...style,
      }}
    >
      {items.map((it) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={on}
            onClick={() => select(it.id)}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 12px",
              marginBottom: -1,
              border: "none",
              background: "transparent",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: on ? 600 : 500,
              color: on ? "var(--color-deep-teal)" : "var(--color-neutral-600)",
              borderBottom: `2px solid ${on ? "var(--action-primary)" : "transparent"}`,
              cursor: "pointer",
              transition: "color var(--duration-fast) var(--ease-standard)",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { if (!on) e.currentTarget.style.color = "var(--text-strong)"; }}
            onMouseLeave={(e) => { if (!on) e.currentTarget.style.color = "var(--color-neutral-600)"; }}
          >
            {it.label}
            {it.count !== undefined && (
              <span
                style={{
                  fontVariantNumeric: "tabular-nums",
                  fontSize: 12,
                  fontWeight: 600,
                  color: on ? "var(--color-deep-teal)" : "var(--color-neutral-500)",
                  background: on ? "var(--color-teal-50)" : "var(--color-neutral-100)",
                  borderRadius: 999,
                  padding: "1px 7px",
                }}
              >
                {it.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
