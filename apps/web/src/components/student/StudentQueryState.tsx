import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SkeletonText } from "@/components/ui/skeleton";

export function StudentQueryState({
  isLoading,
  isError,
  onRetry,
  empty,
  children,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  empty?: boolean;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <div className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
          <Loader2 className="size-4 animate-spin text-[var(--color-deep-teal)]" aria-hidden />
          Loading…
        </div>
        <SkeletonText lines={3} />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-semibold text-[var(--text-strong)]">Couldn&apos;t load</p>
        <p className="text-xs text-[var(--text-muted)]">Try again in a moment.</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    );
  }
  if (empty) {
    return <p className="text-center text-xs text-[var(--text-muted)]">Nothing here yet.</p>;
  }
  return <>{children}</>;
}
