import { useThemeStore, type ThemeMode } from "@/stores/theme-store";

export function useTheme() {
  const mode = useThemeStore((state) => state.mode);
  const resolved = useThemeStore((state) => state.resolved);
  const setMode = useThemeStore((state) => state.setMode);

  return { mode, resolved, setMode };
}

export type { ThemeMode };
