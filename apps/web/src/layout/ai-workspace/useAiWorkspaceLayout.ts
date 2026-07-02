import * as React from "react";

export type AiWorkspaceLayoutMode = "wide" | "tablet" | "mobile";

export const aiWorkspaceBreakpoints = {
  wide: 1200,
  tablet: 760,
} as const;

function modeForWidth(width: number): AiWorkspaceLayoutMode {
  if (width >= aiWorkspaceBreakpoints.wide) return "wide";
  if (width >= aiWorkspaceBreakpoints.tablet) return "tablet";
  return "mobile";
}

/** Responsive layout for AI Workspace panes */
export function useAiWorkspaceLayout() {
  const [mode, setMode] = React.useState<AiWorkspaceLayoutMode>(() =>
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
    showConversationRail: mode !== "mobile",
    showContextDock: mode === "wide",
  };
}
