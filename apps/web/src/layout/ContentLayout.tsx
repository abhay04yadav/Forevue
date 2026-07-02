import { cn } from "@/lib/utils";

export interface ContentLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  /** When false, children fill the scroll area without an inner max-width wrapper */
  contained?: boolean;
}

/** Forevue main content column — top bar + scrollable page body */
export function ContentLayout({
  className,
  header,
  contained = true,
  children,
  ...props
}: ContentLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen min-w-0 flex-1 flex-col bg-[var(--surface-page)]",
        className,
      )}
      {...props}
    >
      {header}
      <main className="flex-1 overflow-y-auto bg-[var(--surface-page)]">
        {contained ? children : <div className="h-full">{children}</div>}
      </main>
    </div>
  );
}
