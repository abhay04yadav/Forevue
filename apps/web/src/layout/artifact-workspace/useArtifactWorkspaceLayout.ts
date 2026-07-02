import * as React from "react";

export type ArtifactLayoutMode = "wide" | "tablet" | "mobile";

export const artifactBreakpoints = {
  wide: 1200,
  tablet: 760,
} as const;

function modeForWidth(width: number): ArtifactLayoutMode {
  if (width >= artifactBreakpoints.wide) return "wide";
  if (width >= artifactBreakpoints.tablet) return "tablet";
  return "mobile";
}

export function useArtifactWorkspaceLayout() {
  const [mode, setMode] = React.useState<ArtifactLayoutMode>(() =>
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
    isMobile: mode === "mobile",
    showOutline: mode !== "mobile",
    showDock: mode === "wide",
  };
}
