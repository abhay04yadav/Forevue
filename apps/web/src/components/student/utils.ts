import type { Tier } from "@/design";

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function healthTier(score: number): Tier {
  if (score >= 75) return "low";
  if (score >= 60) return "watch";
  return "high";
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function activityIcon(type: string) {
  switch (type) {
    case "submission":
      return "file";
    case "timetable":
      return "calendar";
    default:
      return "sparkles";
  }
}
