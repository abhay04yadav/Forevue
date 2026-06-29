import React from "react";

/**
 * Forevue Switch — quiet toggle, teal track when on. For settings/filters.
 */
export function Switch({ label, checked, defaultChecked, disabled, id, onChange, style = {}, ...rest }) {
  const reactId = React.useId();
  const swId = id || reactId;
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = isControlled ? checked : internal;

  return (
    <label
      htmlFor={swId}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        color: "var(--text-body)",
        ...style,
      }}
    >
      <input
        id={swId}
        type="checkbox"
        role="switch"
        checked={on}
        disabled={disabled}
        onChange={(e) => { if (!isControlled) setInternal(e.target.checked); onChange && onChange(e); }}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        {...rest}
      />
      <span
        aria-hidden="true"
        style={{
          position: "relative",
          width: 38,
          height: 22,
          flex: "none",
          borderRadius: 999,
          background: on ? "var(--action-primary)" : "var(--color-neutral-300)",
          transition: "background var(--duration-normal) var(--ease-standard)",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: on ? 18 : 2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "var(--shadow-xs)",
            transition: "left var(--duration-normal) var(--ease-standard)",
          }}
        />
      </span>
      {label}
    </label>
  );
}
