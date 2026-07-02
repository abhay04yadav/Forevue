import { WorkspacePlaceholderPage } from "@/pages/WorkspacePlaceholderPage";

export function FacultyTeachingPage() {
  return (
    <WorkspacePlaceholderPage
      eyebrow="Teaching"
      title="Teaching workspace"
      subtitle="Lecture planner, course progress, and office hours connect when the teaching module is ingested."
    />
  );
}

export function FacultyCreatePage() {
  return (
    <WorkspacePlaceholderPage
      eyebrow="Create"
      title="Create & draft"
      subtitle="Assessment, assignment, and notice generators will appear here — advisory drafts only, never auto-published."
    />
  );
}
