import type { CSSProperties, ReactNode } from "react";

import type { Tier } from "../tokens";

const TIERS: Record<Tier, { color: string; bg: string; label: string }> = {
  high: { color: "var(--color-risk-high)", bg: "var(--color-risk-high-bg)", label: "High" },
  watch: { color: "var(--color-risk-watch)", bg: "var(--color-risk-watch-bg)", label: "Watch" },
  low: { color: "var(--color-risk-low)", bg: "var(--color-risk-low-bg)", label: "Low" },
};

function Glyph({ tier, size = 12 }: { tier: Tier; size?: number }) {
  const c = TIERS[tier]?.color ?? TIERS.low.color;
  if (tier === "high") {
    return (
      <span
        aria-hidden
        style={{ display: "inline-block", width: size, height: size, background: c, borderRadius: 2 }}
      />
    );
  }
  if (tier === "watch") {
    return (
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: size,
          height: size,
          background: c,
          borderRadius: 2,
          transform: "rotate(45deg)",
        }}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ display: "inline-block", width: size, height: size, background: c, borderRadius: "50%" }}
    />
  );
}

export interface RiskMarkerProps {
  tier?: Tier;
  variant?: "pill" | "glyph";
  showLabel?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
  children?: ReactNode;
}

/** Colour + shape + label — never colour alone (frozen DS primitive). */
export function RiskMarker({
  tier = "low",
  variant = "pill",
  showLabel = true,
  label,
  size = "md",
  style = {},
}: RiskMarkerProps) {
  const t = TIERS[tier] ?? TIERS.low;
  const text = label ?? t.label;
  const g = size === "sm" ? 9 : size === "lg" ? 14 : 11;

  if (variant === "glyph") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, ...style }} title={`${text} risk`}>
        <Glyph tier={tier} size={g} />
        {showLabel && (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: t.color }}>{text}</span>
        )}
      </span>
    );
  }

  return (
    <span
      style={{
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
        ...style,
      }}
      title={`${text} risk`}
    >
      <Glyph tier={tier} size={g} />
      {showLabel && text}
    </span>
  );
}
