/* @ds-bundle: {"format":3,"namespace":"ForevueDesignSystem_24f415","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Tag","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CardHeader","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Callout","sourcePath":"components/feedback/Callout.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"ConsentTag","sourcePath":"components/product/ConsentTag.jsx"},{"name":"DataStat","sourcePath":"components/product/DataStat.jsx"},{"name":"EvidenceCite","sourcePath":"components/product/EvidenceCite.jsx"},{"name":"RiskMarker","sourcePath":"components/product/RiskMarker.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"6ed0f5815719","components/core/Button.jsx":"4bc474e29827","components/core/Card.jsx":"e6b9373d44a3","components/core/IconButton.jsx":"32ff02ea9ba8","components/feedback/Callout.jsx":"3969e46890cf","components/forms/Checkbox.jsx":"7a664318b293","components/forms/Input.jsx":"64375352c1c5","components/forms/Select.jsx":"9250c466e1b9","components/forms/Switch.jsx":"2698a04081b8","components/navigation/Tabs.jsx":"ef91e8e63cdf","components/product/ConsentTag.jsx":"a821fbd44b66","components/product/DataStat.jsx":"a2fbf8f4e0f2","components/product/EvidenceCite.jsx":"cfcb6c3c0152","components/product/RiskMarker.jsx":"1d464f7f63dc","ui_kits/forevue-app/AppShell.jsx":"e7d098d21bef","ui_kits/forevue-app/AskView.jsx":"d8584eac6651","ui_kits/forevue-app/StudentView.jsx":"781e6a0baeac","ui_kits/forevue-app/WatchView.jsx":"ed3e116a34d4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ForevueDesignSystem_24f415 = window.ForevueDesignSystem_24f415 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Forevue Badge — small status/count pill. Quiet by default; teal/amber/neutral tones.
 * Amber tone is the single accent — use sparingly.
 */
function Badge({
  tone = "neutral",
  children,
  style = {},
  ...rest
}) {
  const tones = {
    neutral: {
      background: "var(--color-neutral-100)",
      color: "var(--color-neutral-700)",
      border: "1px solid var(--border-subtle)"
    },
    teal: {
      background: "var(--color-teal-50)",
      color: "var(--color-deep-teal)",
      border: "1px solid var(--color-teal-100)"
    },
    amber: {
      background: "var(--color-amber-50)",
      color: "var(--color-amber-700)",
      border: "1px solid var(--color-amber-200)"
    },
    dark: {
      background: "var(--color-midnight-teal)",
      color: "var(--text-on-dark)",
      border: "1px solid var(--color-midnight-teal)"
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), children);
}

/**
 * Forevue Tag — squared, dismissible label for filters/metadata. Tabular numerals on counts.
 */
function Tag({
  children,
  onRemove,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), children, onRemove && /*#__PURE__*/React.createElement("button", {
    "aria-label": "Remove",
    onClick: onRemove,
    style: {
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
      lineHeight: 1
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Badge, Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Forevue Button — one teal PRIMARY action per view; secondaries are quiet/bordered.
 * Calm, utilitarian. No gradients, no glow.
 */
function Button({
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
    sm: {
      padding: "0 12px",
      height: 32,
      fontSize: 13
    },
    md: {
      padding: "0 16px",
      height: 40,
      fontSize: 14
    },
    lg: {
      padding: "0 22px",
      height: 48,
      fontSize: 15
    }
  };
  const variants = {
    primary: {
      background: "var(--action-primary)",
      color: "var(--action-primary-text)",
      border: "1px solid var(--action-primary)"
    },
    secondary: {
      background: "var(--surface-card)",
      color: "var(--color-deep-teal)",
      border: "1px solid var(--border-default)"
    },
    ghost: {
      background: "transparent",
      color: "var(--color-deep-teal)",
      border: "1px solid transparent"
    },
    danger: {
      background: "var(--surface-card)",
      color: "var(--color-risk-high)",
      border: "1px solid var(--color-risk-high)"
    }
  };
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    style: {
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
      ...style
    },
    onMouseDown: e => {
      if (!disabled) e.currentTarget.style.transform = "translateY(0.5px)";
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = "none";
    },
    onMouseEnter: e => {
      if (disabled) return;
      if (variant === "primary") e.currentTarget.style.background = "var(--action-primary-hover)";else if (variant === "secondary") e.currentTarget.style.background = "var(--color-neutral-50)";else if (variant === "ghost") e.currentTarget.style.background = "var(--color-teal-50)";else if (variant === "danger") e.currentTarget.style.background = "var(--color-risk-high-bg)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = v.background;
      e.currentTarget.style.transform = "none";
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Forevue Card — the workhorse product surface. White, soft neutral border,
 * generous radius, subtle shadow. Calm and uncluttered.
 */
function Card({
  as: Tag = "div",
  padding = "lg",
  interactive = false,
  children,
  style = {},
  ...rest
}) {
  const pads = {
    none: 0,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24
  };
  const p = pads[padding] ?? pads.lg;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      padding: p,
      transition: "box-shadow var(--duration-normal) var(--ease-standard), border-color var(--duration-normal) var(--ease-standard)",
      ...style
    },
    onMouseEnter: e => {
      if (!interactive) return;
      e.currentTarget.style.boxShadow = "var(--shadow-md)";
      e.currentTarget.style.borderColor = "var(--border-default)";
    },
    onMouseLeave: e => {
      if (!interactive) return;
      e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      e.currentTarget.style.borderColor = "var(--border-subtle)";
    }
  }, rest), children);
}

/** Optional card header row with a title and trailing slot. */
function CardHeader({
  title,
  eyebrow,
  trailing,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 12,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: 700,
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--color-deep-teal)",
      marginBottom: 4
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-md)",
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, title)), trailing);
}
Object.assign(__ds_scope, { Card, CardHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Forevue IconButton — square, quiet button for a single icon (toolbars, close, more).
 * Pass an icon node (e.g. a Lucide <i data-lucide> or inline SVG) as children.
 */
function IconButton({
  variant = "ghost",
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  children,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: 30,
    md: 36,
    lg: 42
  };
  const dim = sizes[size] || sizes.md;
  const variants = {
    ghost: {
      background: "transparent",
      color: "var(--color-neutral-600)",
      border: "1px solid transparent"
    },
    bordered: {
      background: "var(--surface-card)",
      color: "var(--color-deep-teal)",
      border: "1px solid var(--border-default)"
    },
    solid: {
      background: "var(--action-primary)",
      color: "#fff",
      border: "1px solid var(--action-primary)"
    }
  };
  const v = variants[variant] || variants.ghost;
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": ariaLabel,
    disabled: disabled,
    style: {
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
      ...style
    },
    onMouseEnter: e => {
      if (disabled) return;
      if (variant === "ghost") e.currentTarget.style.background = "var(--color-neutral-100)";else if (variant === "bordered") e.currentTarget.style.background = "var(--color-neutral-50)";else if (variant === "solid") e.currentTarget.style.background = "var(--action-primary-hover)";
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = v.background;
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Callout.jsx
try { (() => {
/**
 * Forevue Callout — quiet inline note. Includes the "abstain" tone for when
 * Forevue can't ground an answer (grounded-or-abstain), and a "draft" tone for
 * human-owned generated content.
 */
const TONES = {
  info: {
    color: "var(--color-deep-teal)",
    bg: "var(--color-teal-50)",
    border: "var(--color-teal-100)"
  },
  abstain: {
    color: "var(--color-neutral-700)",
    bg: "var(--color-neutral-100)",
    border: "var(--border-subtle)"
  },
  draft: {
    color: "var(--color-amber-700)",
    bg: "var(--color-amber-50)",
    border: "var(--color-amber-200)"
  },
  caution: {
    color: "var(--color-risk-high)",
    bg: "var(--color-risk-high-bg)",
    border: "var(--color-risk-high)"
  }
};
function Callout({
  tone = "info",
  title,
  icon,
  children,
  style = {}
}) {
  const t = TONES[tone] || TONES.info;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 11,
      padding: "12px 14px",
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: "var(--radius-md)",
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      color: t.color,
      flex: "none",
      marginTop: 1
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 13.5,
      fontWeight: 600,
      color: t.color,
      marginBottom: children ? 3 : 0
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 13.5,
      lineHeight: 1.5,
      color: "var(--text-body)"
    }
  }, children)));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Callout.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Forevue Checkbox — square check, teal when on. Label sits to the right.
 */
function Checkbox({
  label,
  checked,
  defaultChecked,
  disabled,
  id,
  onChange,
  style = {},
  ...rest
}) {
  const reactId = React.useId();
  const cbId = id || reactId;
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = isControlled ? checked : internal;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: cbId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--text-body)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: cbId,
    type: "checkbox",
    checked: on,
    disabled: disabled,
    onChange: e => {
      if (!isControlled) setInternal(e.target.checked);
      onChange && onChange(e);
    },
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 18,
      height: 18,
      flex: "none",
      borderRadius: 5,
      border: `1.5px solid ${on ? "var(--action-primary)" : "var(--border-strong)"}`,
      background: on ? "var(--action-primary)" : "var(--surface-card)",
      color: "#fff",
      transition: "background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)"
    }
  }, on && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2L5 8.5L9.5 3.5",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Forevue Input — calm text field with label, optional hint/error, deep-teal focus ring.
 */
function Input({
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
  const heights = {
    sm: 34,
    md: 40,
    lg: 46
  };
  const h = heights[size] || heights.md;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: h,
      padding: "0 12px",
      background: "var(--surface-card)",
      border: `1px solid ${error ? "var(--color-risk-high)" : focused ? "var(--focus-ring)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      boxShadow: focused && !error ? "var(--shadow-focus)" : "none",
      transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)"
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color: "var(--color-neutral-500)"
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: e => {
      setFocused(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocused(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--text-strong)",
      ...inputStyle
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: error ? "var(--color-risk-high)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Forevue Select — native select styled to match Input. Deep-teal focus ring.
 */
function Select({
  label,
  hint,
  id,
  size = "md",
  children,
  style = {},
  ...rest
}) {
  const reactId = React.useId();
  const selectId = id || reactId;
  const [focused, setFocused] = React.useState(false);
  const heights = {
    sm: 34,
    md: 40,
    lg: 46
  };
  const h = heights[size] || heights.md;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: selectId,
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: h,
      border: `1px solid ${focused ? "var(--focus-ring)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      background: "var(--surface-card)",
      boxShadow: focused ? "var(--shadow-focus)" : "none",
      transition: "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selectId,
    onFocus: e => {
      setFocused(true);
      rest.onFocus && rest.onFocus(e);
    },
    onBlur: e => {
      setFocused(false);
      rest.onBlur && rest.onBlur(e);
    },
    style: {
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
      cursor: "pointer"
    }
  }, rest), children), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: 12,
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: "var(--color-neutral-500)",
      fontSize: 11
    }
  }, "\u25BE")), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Forevue Switch — quiet toggle, teal track when on. For settings/filters.
 */
function Switch({
  label,
  checked,
  defaultChecked,
  disabled,
  id,
  onChange,
  style = {},
  ...rest
}) {
  const reactId = React.useId();
  const swId = id || reactId;
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = isControlled ? checked : internal;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: swId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--text-body)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: swId,
    type: "checkbox",
    role: "switch",
    checked: on,
    disabled: disabled,
    onChange: e => {
      if (!isControlled) setInternal(e.target.checked);
      onChange && onChange(e);
    },
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: "relative",
      width: 38,
      height: 22,
      flex: "none",
      borderRadius: 999,
      background: on ? "var(--action-primary)" : "var(--color-neutral-300)",
      transition: "background var(--duration-normal) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: on ? 18 : 2,
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "var(--shadow-xs)",
      transition: "left var(--duration-normal) var(--ease-standard)"
    }
  })), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/**
 * Forevue Tabs — quiet underline tabs. Active tab is teal with a teal underline.
 * Controlled (value+onChange) or uncontrolled (defaultValue).
 */
function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  style = {}
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.id);
  const active = isControlled ? value : internal;
  const select = id => {
    if (!isControlled) setInternal(id);
    onChange && onChange(id);
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "flex",
      gap: 4,
      borderBottom: "1px solid var(--border-subtle)",
      ...style
    }
  }, items.map(it => {
    const on = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      role: "tab",
      "aria-selected": on,
      onClick: () => select(it.id),
      style: {
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
        whiteSpace: "nowrap"
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.color = "var(--text-strong)";
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.color = "var(--color-neutral-600)";
      }
    }, it.label, it.count !== undefined && /*#__PURE__*/React.createElement("span", {
      style: {
        fontVariantNumeric: "tabular-nums",
        fontSize: 12,
        fontWeight: 600,
        color: on ? "var(--color-deep-teal)" : "var(--color-neutral-500)",
        background: on ? "var(--color-teal-50)" : "var(--color-neutral-100)",
        borderRadius: 999,
        padding: "1px 7px"
      }
    }, it.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/product/ConsentTag.jsx
try { (() => {
/**
 * Forevue ConsentTag — minors always carry a consent-required marker (DPDP).
 * Privacy-first: never show a minor's data without this present.
 */
function ConsentTag({
  state = "required",
  label,
  size = "md",
  style = {}
}) {
  const states = {
    required: {
      label: "Minor — consent required",
      color: "var(--color-amber-700)",
      bg: "var(--color-amber-50)",
      border: "var(--color-amber-200)",
      icon: /*#__PURE__*/React.createElement("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 16 16",
        fill: "none"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "7",
        width: "10",
        height: "7",
        rx: "1.4",
        stroke: "currentColor",
        strokeWidth: "1.3"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7",
        stroke: "currentColor",
        strokeWidth: "1.3",
        strokeLinecap: "round"
      }))
    },
    granted: {
      label: "Consent on file",
      color: "var(--color-risk-low)",
      bg: "var(--color-risk-low-bg)",
      border: "var(--color-risk-low)",
      icon: /*#__PURE__*/React.createElement("svg", {
        width: "13",
        height: "13",
        viewBox: "0 0 16 16",
        fill: "none"
      }, /*#__PURE__*/React.createElement("path", {
        d: "M3 8.5 6.5 12 13 4.5",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }))
    }
  };
  const s = states[state] || states.required;
  const text = label || s.label;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: size === "sm" ? 22 : 26,
      padding: "0 10px",
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-sans)",
      fontSize: size === "sm" ? 11.5 : 12.5,
      fontWeight: 600,
      color: s.color,
      whiteSpace: "nowrap",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-flex"
    }
  }, s.icon), text);
}
Object.assign(__ds_scope, { ConsentTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/ConsentTag.jsx", error: String((e && e.message) || e) }); }

// components/product/DataStat.jsx
try { (() => {
/**
 * Forevue DataStat — a single figure with label. Public Sans 800, tabular numerals.
 * Optional small delta line. Numbers never use the serif.
 */
function DataStat({
  value,
  label,
  sub,
  delta,
  deltaDir = "flat",
  align = "left",
  style = {}
}) {
  const deltaColors = {
    up: "var(--color-risk-low)",
    down: "var(--color-risk-high)",
    flat: "var(--text-muted)"
  };
  const arrow = deltaDir === "up" ? "↑" : deltaDir === "down" ? "↓" : "→";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      textAlign: align,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-data)",
      fontWeight: 800,
      fontVariantNumeric: "tabular-nums",
      fontSize: 34,
      lineHeight: 1,
      letterSpacing: "-0.02em",
      color: "var(--color-deep-teal)"
    }
  }, value), (sub || delta) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12.5
    }
  }, delta && /*#__PURE__*/React.createElement("span", {
    style: {
      color: deltaColors[deltaDir],
      fontWeight: 600,
      fontVariantNumeric: "tabular-nums"
    }
  }, arrow, " ", delta), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, sub)));
}
Object.assign(__ds_scope, { DataStat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/DataStat.jsx", error: String((e && e.message) || e) }); }

// components/product/EvidenceCite.jsx
try { (() => {
/**
 * Forevue EvidenceCite — every AI answer shows its provenance. Grounded-or-abstain.
 * Renders the sources an answer is based on as quiet, clickable chips.
 */
function EvidenceCite({
  sources = [],
  label = "Based on",
  onOpen,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--color-deep-teal)"
    }
  }, label), sources.map((src, i) => {
    const text = typeof src === "string" ? src : src.label;
    const meta = typeof src === "string" ? null : src.meta;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => onOpen && onOpen(src, i),
      style: {
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
        transition: "border-color var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard)"
      },
      onMouseEnter: e => {
        if (onOpen) {
          e.currentTarget.style.borderColor = "var(--color-teal-300)";
          e.currentTarget.style.background = "var(--color-teal-50)";
        }
      },
      onMouseLeave: e => {
        e.currentTarget.style.borderColor = "var(--border-default)";
        e.currentTarget.style.background = "var(--surface-card)";
      }
    }, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        display: "inline-flex",
        color: "var(--color-deep-teal)"
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 16 16",
      fill: "none"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M4 2.5h5L13 6.5V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1Z",
      stroke: "currentColor",
      strokeWidth: "1.3",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M9 2.5V6.5h4",
      stroke: "currentColor",
      strokeWidth: "1.3",
      strokeLinejoin: "round"
    }))), /*#__PURE__*/React.createElement("span", null, text), meta && /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-muted)",
        fontWeight: 400
      }
    }, "\xB7 ", meta));
  }));
}
Object.assign(__ds_scope, { EvidenceCite });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/EvidenceCite.jsx", error: String((e && e.message) || e) }); }

// components/product/RiskMarker.jsx
try { (() => {
/**
 * Forevue RiskMarker — the signature governance primitive.
 * Student risk is NEVER colour alone: colour + SHAPE + LABEL, every time.
 *   high  = square   (red)
 *   watch = diamond  (amber)
 *   low   = circle   (green)
 * Colour-vision-safe by design.
 */
const TIERS = {
  high: {
    color: "var(--color-risk-high)",
    bg: "var(--color-risk-high-bg)",
    label: "High"
  },
  watch: {
    color: "var(--color-risk-watch)",
    bg: "var(--color-risk-watch-bg)",
    label: "Watch"
  },
  low: {
    color: "var(--color-risk-low)",
    bg: "var(--color-risk-low-bg)",
    label: "Low"
  }
};
function Glyph({
  tier,
  size = 12
}) {
  const c = TIERS[tier]?.color || TIERS.low.color;
  if (tier === "high") {
    // square
    return /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        display: "inline-block",
        width: size,
        height: size,
        background: c,
        borderRadius: 2
      }
    });
  }
  if (tier === "watch") {
    // diamond
    return /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        display: "inline-block",
        width: size,
        height: size,
        background: c,
        borderRadius: 2,
        transform: "rotate(45deg)"
      }
    });
  }
  // low — circle
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: "inline-block",
      width: size,
      height: size,
      background: c,
      borderRadius: "50%"
    }
  });
}
function RiskMarker({
  tier = "low",
  variant = "pill",
  showLabel = true,
  label,
  size = "md",
  style = {}
}) {
  const t = TIERS[tier] || TIERS.low;
  const text = label || t.label;
  const g = size === "sm" ? 9 : size === "lg" ? 14 : 11;
  if (variant === "glyph") {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        ...style
      },
      title: `${text} risk`
    }, /*#__PURE__*/React.createElement(Glyph, {
      tier: tier,
      size: g
    }), showLabel && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 600,
        color: t.color
      }
    }, text));
  }

  // pill
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      height: size === "sm" ? 22 : 26,
      padding: "0 10px",
      background: t.bg,
      border: `1px solid ${t.color}`,
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-sans)",
      fontSize: size === "sm" ? 12 : 13,
      fontWeight: 600,
      color: t.color,
      whiteSpace: "nowrap",
      ...style
    },
    title: `${text} risk`
  }, /*#__PURE__*/React.createElement(Glyph, {
    tier: tier,
    size: g
  }), showLabel && text);
}
Object.assign(__ds_scope, { RiskMarker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/RiskMarker.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forevue-app/AppShell.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Forevue product app — shell (sidebar + topbar). Cool neutral, calm, utilitarian.
const {
  useState
} = React;
function NavItem({
  icon,
  label,
  active,
  count,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      width: "100%",
      padding: "9px 11px",
      border: "none",
      borderRadius: "var(--radius-md)",
      background: active ? "var(--color-teal-50)" : "transparent",
      color: active ? "var(--color-deep-teal)" : "var(--color-neutral-700)",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      fontWeight: active ? 600 : 500,
      cursor: "pointer",
      textAlign: "left",
      transition: "background var(--duration-fast) var(--ease-standard)"
    },
    onMouseEnter: e => {
      if (!active) e.currentTarget.style.background = "var(--color-neutral-100)";
    },
    onMouseLeave: e => {
      if (!active) e.currentTarget.style.background = "transparent";
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": icon,
    style: {
      width: 17,
      height: 17,
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, label), count !== undefined && /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: "tabular-nums",
      fontSize: 12,
      fontWeight: 600,
      color: active ? "var(--color-deep-teal)" : "var(--color-neutral-500)",
      background: active ? "#fff" : "var(--color-neutral-100)",
      borderRadius: 999,
      padding: "1px 8px"
    }
  }, count));
}
function AppShell({
  nav,
  active,
  onNav,
  title,
  subtitle,
  actions,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100%",
      background: "var(--surface-page)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      width: "var(--app-sidebar)",
      flex: "none",
      background: "#fff",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      padding: "16px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "4px 8px 18px"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/forevue-icon-on-light.svg",
    alt: "",
    style: {
      width: 26,
      height: 26
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: "var(--color-ink)",
      letterSpacing: "-0.01em"
    }
  }, "Forevue")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, nav.map(n => /*#__PURE__*/React.createElement(NavItem, _extends({
    key: n.id
  }, n, {
    active: active === n.id,
    onClick: () => onNav(n.id)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement(NavItem, {
    icon: "settings",
    label: "Settings"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "10px 8px 2px",
      borderTop: "1px solid var(--border-subtle)",
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: "var(--color-teal-600)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 700,
      flex: "none"
    }
  }, "RM"), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, "R. Menon"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: "var(--text-muted)"
    }
  }, "Dean, Academics"))))), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "16px 28px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 19,
      fontWeight: 600,
      color: "var(--text-strong)",
      letterSpacing: "-0.01em"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "2px 0 0",
      fontSize: 13,
      color: "var(--text-muted)"
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, actions)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "24px 28px"
    }
  }, children)));
}
Object.assign(window, {
  AppShell,
  NavItem
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forevue-app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forevue-app/AskView.jsx
try { (() => {
// Forevue — Ask view. Plain-English query → grounded answer with evidence + a human-owned draft.
const {
  useState: useAskState
} = React;
function AskView() {
  const {
    Card,
    Button,
    EvidenceCite,
    RiskMarker,
    Callout,
    ConsentTag,
    DataStat
  } = window.ForevueDesignSystem_24f415;
  const [asked, setAsked] = useAskState(true);
  const [query, setQuery] = useAskState("Which students in CSE-3 are slipping, and why?");
  const suggestions = ["Who is at risk in first-year ECE this week?", "Show fee defaulters with low attendance", "What evidence supports the NAAC criteria 2 report?"];
  const students = [{
    name: "A. Sharma",
    roll: "21CSE-014",
    tier: "high",
    reason: "Attendance 58% · 2 internals missed",
    minor: false
  }, {
    name: "P. Nair",
    roll: "21CSE-027",
    tier: "high",
    reason: "Attendance 61% · fees overdue",
    minor: true
  }, {
    name: "S. Iqbal",
    roll: "21CSE-031",
    tier: "watch",
    reason: "Marks down 14% since wk 4",
    minor: false
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 880,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "none",
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "sparkles",
    style: {
      width: 19,
      height: 19,
      color: "var(--color-deep-teal)",
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => setQuery(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") setAsked(true);
    },
    placeholder: "Ask anything about your students, in plain English\u2026",
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-sans)",
      fontSize: 16,
      color: "var(--text-strong)"
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => setAsked(true),
    iconRight: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "arrow-up",
      style: {
        width: 16,
        height: 16
      }
    })
  }, "Ask")), !asked && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      padding: "12px 16px",
      display: "flex",
      flexWrap: "wrap",
      gap: 8
    }
  }, suggestions.map((s, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => {
      setQuery(s);
      setAsked(true);
    },
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      color: "var(--color-neutral-700)",
      background: "var(--color-neutral-50)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-pill)",
      padding: "6px 12px",
      cursor: "pointer"
    }
  }, s)))), asked && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "var(--tracking-eyebrow)",
      textTransform: "uppercase",
      color: "var(--color-deep-teal)"
    }
  }, "Answer"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, "\xB7 grounded on 3 sources")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 16,
      lineHeight: 1.6,
      color: "var(--text-strong)"
    }
  }, "Three students in CSE-3 have slipped below the attendance line this week, and two of them also have internals missing. Here's who, and what each is based on."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 28,
      margin: "18px 0 6px"
    }
  }, /*#__PURE__*/React.createElement(DataStat, {
    label: "Below the line",
    value: "3",
    delta: "1",
    deltaDir: "down",
    sub: "vs last week"
  }), /*#__PURE__*/React.createElement(DataStat, {
    label: "Avg. attendance",
    value: "60%",
    sub: "CSE-3 watchlist"
  }), /*#__PURE__*/React.createElement(DataStat, {
    label: "Earliest signal",
    value: "wk 4",
    sub: "marks dip"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column"
    }
  }, students.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "12px 0",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(RiskMarker, {
    tier: s.tier,
    size: "sm"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14.5,
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, s.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: "var(--text-muted)",
      fontVariantNumeric: "tabular-nums"
    }
  }, s.roll), s.minor && /*#__PURE__*/React.createElement(ConsentTag, {
    state: "required",
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: "var(--text-body)",
      marginTop: 2
    }
  }, s.reason)), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Open")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(EvidenceCite, {
    label: "Based on",
    sources: [{
      label: "Attendance register",
      meta: "wk 6–9"
    }, {
      label: "Internal marks",
      meta: "CSE-3"
    }, {
      label: "Fee status",
      meta: "Apr"
    }],
    onOpen: () => {}
  }))), /*#__PURE__*/React.createElement(Callout, {
    tone: "draft",
    title: "Draft \u2014 for you to review",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "pencil-line"
    })
  }, "A short note to the three students' mentor, naming each student and the specific signal. Nothing is sent and nothing is written back to the ERP until you approve it.", /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm"
  }, "Review draft"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Discard")))));
}
Object.assign(window, {
  AskView
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forevue-app/AskView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forevue-app/StudentView.jsx
try { (() => {
// Forevue — Student view. Evidence on the table; the why behind a risk tier. Dignity, not labels.
function StudentView() {
  const {
    Card,
    CardHeader,
    Button,
    RiskMarker,
    ConsentTag,
    EvidenceCite,
    Callout,
    Badge
  } = window.ForevueDesignSystem_24f415;
  const signals = [{
    label: "Attendance",
    value: "61%",
    note: "below the 65% line · 4 weeks running",
    tier: "high",
    icon: "calendar-x"
  }, {
    label: "Internal marks",
    value: "−18%",
    note: "vs personal baseline since wk 4",
    tier: "watch",
    icon: "trending-down"
  }, {
    label: "Fees",
    value: "Overdue",
    note: "₹42,000 · since 12 Apr",
    tier: "watch",
    icon: "receipt"
  }, {
    label: "Library / LMS",
    value: "Active",
    note: "no drop in engagement",
    tier: "low",
    icon: "book-open"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 860,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 52,
      height: 52,
      borderRadius: "50%",
      background: "var(--color-teal-600)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 19,
      fontWeight: 700,
      flex: "none"
    }
  }, "PN"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 22,
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, "P. Nair"), /*#__PURE__*/React.createElement(RiskMarker, {
    tier: "high"
  }), /*#__PURE__*/React.createElement(ConsentTag, {
    state: "required"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--text-muted)",
      marginTop: 4,
      fontVariantNumeric: "tabular-nums"
    }
  }, "21CSE-027 \xB7 Computer Science, Semester 3 \xB7 Mentor: Dr. Rao")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "message-square",
      style: {
        width: 16,
        height: 16
      }
    })
  }, "Draft outreach"))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg"
  }, /*#__PURE__*/React.createElement(CardHeader, {
    eyebrow: "Why high risk",
    title: "Three signals line up"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 4px",
      fontSize: 15,
      lineHeight: 1.6,
      color: "var(--text-body)"
    }
  }, "Attendance has been below the line for four weeks while internal marks fell from a steady baseline, and fees are overdue. Engagement on the LMS is still healthy \u2014 so this reads as a support need, not disengagement."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginTop: 16
    }
  }, signals.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 11,
      padding: 14,
      background: "var(--color-neutral-50)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": s.icon,
    style: {
      width: 18,
      height: 18,
      color: "var(--color-neutral-600)",
      flex: "none",
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, s.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      fontVariantNumeric: "tabular-nums",
      color: "var(--color-deep-teal)"
    }
  }, s.value)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-muted)",
      marginTop: 3,
      lineHeight: 1.45
    }
  }, s.note), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(RiskMarker, {
    tier: s.tier,
    variant: "glyph",
    size: "sm"
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(EvidenceCite, {
    label: "Drawn from",
    sources: [{
      label: "Attendance register"
    }, {
      label: "Internal marks"
    }, {
      label: "Fee ledger"
    }, {
      label: "LMS activity"
    }],
    onOpen: () => {}
  }))), /*#__PURE__*/React.createElement(Callout, {
    tone: "info",
    icon: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "info"
    })
  }, "Forevue surfaces and shows the evidence. The decision \u2014 and the conversation with P. Nair \u2014 stays with the mentor."));
}
Object.assign(window, {
  StudentView
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forevue-app/StudentView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forevue-app/WatchView.jsx
try { (() => {
// Forevue — Watchlist view. Students who need attention. Risk = colour + shape + label.
const {
  useState: useWatchState
} = React;
function WatchView() {
  const {
    Card,
    Tabs,
    Tag,
    Button,
    IconButton,
    RiskMarker,
    ConsentTag
  } = window.ForevueDesignSystem_24f415;
  const [tab, setTab] = useWatchState("watch");
  const rows = [{
    name: "P. Nair",
    roll: "21CSE-027",
    dept: "CSE-3",
    tier: "high",
    att: "61%",
    marks: "−18%",
    fees: "Overdue",
    minor: true
  }, {
    name: "A. Sharma",
    roll: "21CSE-014",
    dept: "CSE-3",
    tier: "high",
    att: "58%",
    marks: "−9%",
    fees: "Clear",
    minor: false
  }, {
    name: "S. Iqbal",
    roll: "21CSE-031",
    dept: "CSE-3",
    tier: "watch",
    att: "72%",
    marks: "−14%",
    fees: "Clear",
    minor: false
  }, {
    name: "M. Reddy",
    roll: "21ECE-008",
    dept: "ECE-1",
    tier: "watch",
    att: "75%",
    marks: "−6%",
    fees: "Partial",
    minor: true
  }, {
    name: "K. Bose",
    roll: "20CSE-112",
    dept: "CSE-5",
    tier: "low",
    att: "88%",
    marks: "+2%",
    fees: "Clear",
    minor: false
  }];
  const th = {
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    padding: "0 14px 10px"
  };
  const td = {
    fontSize: 14,
    color: "var(--text-body)",
    padding: "13px 14px",
    borderTop: "1px solid var(--border-subtle)",
    fontVariantNumeric: "tabular-nums"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    onRemove: () => {}
  }, "CSE-3"), /*#__PURE__*/React.createElement(Tag, {
    onRemove: () => {}
  }, "This week"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    iconLeft: /*#__PURE__*/React.createElement("i", {
      "data-lucide": "plus",
      style: {
        width: 15,
        height: 15
      }
    })
  }, "Add filter")), /*#__PURE__*/React.createElement(Card, {
    padding: "none",
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 14px 0"
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      id: "watch",
      label: "Needs attention",
      count: 18
    }, {
      id: "all",
      label: "All students",
      count: 1240
    }, {
      id: "minors",
      label: "Consent-gated",
      count: 213
    }]
  })), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      padding: "0 4px"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      paddingTop: 14
    }
  }, "Student"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      paddingTop: 14
    }
  }, "Dept"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      paddingTop: 14
    }
  }, "Risk"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      paddingTop: 14
    }
  }, "Attendance"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      paddingTop: 14
    }
  }, "Marks \u0394"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      paddingTop: 14
    }
  }, "Fees"), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      paddingTop: 14,
      width: 40
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: "var(--text-strong)"
    }
  }, r.name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)",
      fontSize: 12.5
    }
  }, r.roll), r.minor && /*#__PURE__*/React.createElement(ConsentTag, {
    state: "required",
    size: "sm"
  }))), /*#__PURE__*/React.createElement("td", {
    style: td
  }, r.dept), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(RiskMarker, {
    tier: r.tier,
    size: "sm"
  })), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: parseInt(r.att) < 65 ? "var(--color-risk-high)" : "var(--text-body)",
      fontWeight: parseInt(r.att) < 65 ? 600 : 400
    }
  }, r.att), /*#__PURE__*/React.createElement("td", {
    style: {
      ...td,
      color: r.marks.startsWith("−") ? "var(--color-risk-high)" : "var(--color-risk-low)"
    }
  }, r.marks), /*#__PURE__*/React.createElement("td", {
    style: td
  }, r.fees), /*#__PURE__*/React.createElement("td", {
    style: td
  }, /*#__PURE__*/React.createElement(IconButton, {
    "aria-label": "Open"
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "chevron-right",
    style: {
      width: 16,
      height: 16
    }
  })))))))));
}
Object.assign(window, {
  WatchView
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forevue-app/WatchView.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.ConsentTag = __ds_scope.ConsentTag;

__ds_ns.DataStat = __ds_scope.DataStat;

__ds_ns.EvidenceCite = __ds_scope.EvidenceCite;

__ds_ns.RiskMarker = __ds_scope.RiskMarker;

})();
