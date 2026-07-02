import { WorkspacePlaceholderPage } from "@/pages/WorkspacePlaceholderPage";

export function PlacementReadinessPage() {
  return (
    <WorkspacePlaceholderPage
      eyebrow="Placement"
      title="Readiness"
      subtitle="Student readiness and skill-gap analytics connect as placement season data is ingested."
    />
  );
}

export function PlacementAnalyticsPage() {
  return (
    <WorkspacePlaceholderPage
      eyebrow="Placement"
      title="Analytics"
      subtitle="Strategic placement analytics and YoY trends will populate from drive and offer records."
    />
  );
}
