import { useEffect } from "react";

import { useThemeStore } from "@/stores/theme-store";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(mode: "light" | "dark" | "system"): "light" | "dark" {
  return mode === "system" ? getSystemTheme() : mode;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useThemeStore((state) => state.mode);
  const setResolved = useThemeStore((state) => state.setResolved);

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(mode);
      setResolved(resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
      document.documentElement.style.colorScheme = resolved;
    };

    apply();

    if (mode !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [mode, setResolved]);

  return <>{children}</>;
}
