import { breakpoints } from "@/design/tokens/breakpoints";
import * as React from "react";

/** Hook for responsive shell layout (mobile drawer vs desktop sidebar) */
export function useIsMobileLayout() {
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoints.content,
  );

  React.useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoints.content - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}
