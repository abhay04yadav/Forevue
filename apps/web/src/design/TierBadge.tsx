import { RiskMarker, TIER_LABEL, type Tier } from "@forevue/design-system";

export function TierBadge({ tier, big = false }: { tier: Tier; big?: boolean }) {
  return <RiskMarker tier={tier} size={big ? "lg" : "md"} label={TIER_LABEL[tier].toUpperCase()} />;
}
