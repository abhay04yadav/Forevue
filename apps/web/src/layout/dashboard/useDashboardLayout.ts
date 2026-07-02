import * as React from "react";

import type { DashboardLayoutMode } from "./types";

/** Dashboard Framework layout breakpoints — design/final-designs/Dashboard Framework */
export const dashboardBreakpoints = {
  wide: 1040,
  tablet: 720,
} as const;

function modeForWidth(width: number): DashboardLayoutMode {
  if (width >= dashboardBreakpoints.wide) return "wide";
  if (width >= dashboardBreakpoints.tablet) return "tablet";
  return "mobile";
}

/** Responsive layout mode for dashboard regions (wide / tablet / mobile) */
export function useDashboardLayout() {
  const [mode, setMode] = React.useState<DashboardLayoutMode>(() =>
    typeof window !== "undefined" ? modeForWidth(window.innerWidth) : "wide",
  );

  React.useEffect(() => {
    const onResize = () => setMode(modeForWidth(window.innerWidth));
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    mode,
    isWide: mode === "wide",
    isTablet: mode === "tablet",
    isMobile: mode === "mobile",
    showSidebarRail: mode !== "mobile",
    widgetColumns: mode === "mobile" ? 1 : mode === "tablet" ? 2 : undefined,
  };
}
