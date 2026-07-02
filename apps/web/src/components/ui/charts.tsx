import * as React from "react";

import { cn } from "@/lib/utils";

export interface BarChartItem {
  label: string;
  value: number | string;
  height: number | string;
  fill?: string;
  labelColor?: string;
}

export interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  caption?: React.ReactNode;
  captionIcon?: React.ReactNode;
  bars: BarChartItem[];
  height?: number;
}

/** Forevue BarChart — Student Dashboard / Artifact Workspace chart blocks */
function BarChart({
  caption,
  captionIcon,
  bars,
  height = 120,
  className,
  ...props
}: BarChartProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {caption && (
        <div className="mb-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] text-[var(--text-muted)] uppercase">
          {captionIcon && <span className="inline-flex text-[var(--color-deep-teal)]">{captionIcon}</span>}
          {caption}
        </div>
      )}
      <div
        className="relative flex items-end gap-2.5 px-0.5 pt-1.5"
        style={{ height }}
      >
        {bars.map((bar) => (
          <div
            key={bar.label}
            className="relative flex h-full flex-1 flex-col items-center justify-end gap-1.5 pb-5"
          >
            <span
              className="text-[11px] font-bold tabular-nums"
              style={{ color: bar.labelColor ?? "var(--text-strong)" }}
            >
              {bar.value}
            </span>
            <div
              className="w-full rounded-t-[5px]"
              style={{
                height: bar.height,
                background: bar.fill ?? "var(--color-teal-500)",
              }}
            />
            <span className="absolute bottom-0 text-[10.5px] text-[var(--text-muted)]">
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { BarChart };
