import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import type { DeltaDirection } from "@/layout/KpiCard";

export type DashboardLayoutMode = "wide" | "tablet" | "mobile";

export type WidgetKind = "chart" | "list" | "custom";

export interface KpiItem {
  id: string;
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  delta?: React.ReactNode;
  deltaDir?: DeltaDirection;
  valueClassName?: string;
}

export interface WidgetDefinition {
  id: string;
  title: string;
  kind: WidgetKind;
  footer?: string;
  /** Wide layouts may span two columns */
  span?: 1 | 2;
  render?: () => React.ReactNode;
}

export interface QuickActionItem {
  id: string;
  label: string;
  onClick?: () => void;
}

export interface ActivityItem {
  id: string;
  icon: LucideIcon;
  text: string;
  time: string;
}

export type NotificationTone = "default" | "alert" | "ai";

export interface NotificationItem {
  id: string;
  icon: LucideIcon;
  title: string;
  body?: string;
  time: string;
  tone?: NotificationTone;
}

export interface DashboardFilterState {
  timeRange: string;
  scope: string;
  search: string;
}
