import * as React from "react";

import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

/** Forevue Skeleton — .fv-shim from final designs */
function Skeleton({ className, width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("fv-shim", className)}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  const widths = ["94%", "86%", "90%", "78%", "85%"];
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText };
