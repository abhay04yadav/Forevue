import { PageHeader } from "@/layout/PageHeader";

export interface WorkspacePlaceholderPageProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

/** Role-agnostic workspace content slot — App Shell design placeholder */
export function WorkspacePlaceholderPage({
  title,
  subtitle = "This view loads into the shared application shell. Navigation, search, and notifications stay consistent across the product.",
  eyebrow,
}: WorkspacePlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} description={subtitle} eyebrow={eyebrow} />

      <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-card)] px-7 py-14 text-center">
        <img src="/forevue-icon.svg" alt="" className="h-16 w-16 opacity-90" />
        <div>
          <p className="fv-eyebrow mb-2">Workspace shell</p>
          <p className="text-lg font-semibold text-[var(--text-strong)]">{title} content renders here</p>
          <p className="mx-auto mt-2 max-w-[52ch] text-sm leading-relaxed text-[var(--text-muted)]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
