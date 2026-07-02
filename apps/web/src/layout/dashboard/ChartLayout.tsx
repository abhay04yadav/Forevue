import { cn } from "@/lib/utils";

const defaultBarHeights = [38, 64, 48, 80, 56, 72];

export interface ChartPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  heights?: number[];
}

/** Bar chart skeleton — Dashboard Framework widget body */
export function ChartPlaceholder({
  className,
  heights = defaultBarHeights,
  ...props
}: ChartPlaceholderProps) {
  return (
    <div
      className={cn("flex min-h-32 flex-1 items-end gap-[7px]", className)}
      {...props}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-t bg-[var(--color-teal-100)]"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export interface ListPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
}

/** List skeleton — Dashboard Framework widget body */
export function ListPlaceholder({ className, rows = 3, ...props }: ListPlaceholderProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2.5 self-start", className)} {...props}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="size-[26px] shrink-0 rounded-full bg-[var(--color-neutral-100)]" />
          <span className="h-[9px] flex-1 rounded-[5px] bg-[var(--color-neutral-100)]" />
        </div>
      ))}
    </div>
  );
}

export interface ChartLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  kind: "chart" | "list";
  chartHeights?: number[];
  listRows?: number;
}

/** Widget body layout — chart or list placeholder per Dashboard Framework */
export function ChartLayout({
  kind,
  chartHeights,
  listRows,
  className,
  ...props
}: ChartLayoutProps) {
  return (
    <div className={cn("flex min-h-32 flex-1 flex-col", className)} {...props}>
      {kind === "chart" ? (
        <ChartPlaceholder heights={chartHeights} />
      ) : (
        <ListPlaceholder rows={listRows} />
      )}
    </div>
  );
}
