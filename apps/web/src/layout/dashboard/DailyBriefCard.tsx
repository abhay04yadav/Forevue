import { Card, CardContent } from "@/components/ui/card";

export interface DailyBriefCardProps {
  eyebrow?: string;
  title?: string;
  text: string;
  bullets?: string[];
}

/** Shared daily brief surface for student, faculty, HOD, and leadership personas. */
export function DailyBriefCard({ eyebrow = "Daily brief", title, text, bullets = [] }: DailyBriefCardProps) {
  return (
    <Card className="mb-6 border-[var(--color-teal-200)] bg-[var(--color-teal-50)]/40">
      <CardContent className="p-5">
        <p className="fv-eyebrow mb-1 text-[var(--color-deep-teal)]">{eyebrow}</p>
        {title && <h2 className="text-lg font-semibold text-[var(--text-strong)]">{title}</h2>}
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-body)]">{text}</p>
        {bullets.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm text-[var(--text-body)]">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="text-[var(--color-deep-teal)]">·</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
