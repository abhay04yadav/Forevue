import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme, type ThemeMode } from "@/hooks/use-theme";

const cycle: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const labels: Record<ThemeMode, string> = {
  light: "Switch to dark mode",
  dark: "Switch to system theme",
  system: "Switch to light mode",
};

export function ThemeToggle() {
  const { mode, resolved, setMode } = useTheme();
  const next = cycle[mode];

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={labels[mode]}
      title={labels[mode]}
      onClick={() => setMode(next)}
    >
      {resolved === "dark" ? <Moon aria-hidden /> : <Sun aria-hidden />}
    </Button>
  );
}
