import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { iconDefaults } from "@/design/tokens/icons";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="mt-10 flex items-center justify-center gap-2 text-[13.5px] font-medium text-[var(--text-muted)]">
      <Loader2
        className="animate-spin text-[var(--color-deep-teal)]"
        size={iconDefaults.size}
        strokeWidth={iconDefaults.strokeWidth}
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="mx-auto mt-10 max-w-lg text-center" padding="none" interactive={false}>
      <CardContent className="flex flex-col items-center px-6 py-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-risk-high-bg)] text-[var(--color-risk-high)]">
          <AlertCircle className="h-6 w-6" strokeWidth={iconDefaults.strokeWidth} aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-[var(--text-strong)]">{title}</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">{message}</p>
        {onRetry && (
          <Button type="button" className="mt-5" onClick={onRetry}>
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="mx-auto mt-10 max-w-lg text-center" padding="none" interactive={false}>
      <CardContent className="flex flex-col items-center px-6 py-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-risk-low-bg)] text-[var(--color-risk-low)]">
          <CheckCircle2 className="h-6 w-6" strokeWidth={iconDefaults.strokeWidth} aria-hidden />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-[var(--text-strong)]">{title}</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">{message}</p>
      </CardContent>
    </Card>
  );
}

export function FilterEmptyState({
  message,
  onClear,
}: {
  message: string;
  onClear?: () => void;
}) {
  return (
    <Card
      className="mx-auto mt-8 max-w-lg border border-dashed border-[var(--border-default)] text-center"
      padding="none"
    >
      <CardContent className="px-6 py-8">
        <p className="text-sm text-[var(--text-muted)]">{message}</p>
        {onClear && (
          <Button type="button" variant="ghost" className="mt-3" onClick={onClear}>
            Clear filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
