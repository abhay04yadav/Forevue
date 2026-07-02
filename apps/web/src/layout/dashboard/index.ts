export { DailyBriefCard, type DailyBriefCardProps } from "./DailyBriefCard";
export { DashboardGrid, type DashboardGridProps } from "./DashboardGrid";
export { ChartLayout, ChartPlaceholder, ListPlaceholder, type ChartLayoutProps } from "./ChartLayout";
export { KpiLayout, type KpiLayoutProps } from "./KpiLayout";
export { QuickActions, type QuickActionsProps } from "./QuickActions";
export {
  NotificationsSummary,
  RecentActivity,
  SidebarPanel,
  type NotificationsSummaryProps,
  type RecentActivityProps,
  type SidebarPanelProps,
} from "./SidebarWidgets";
export {
  DashboardWidgetProvider,
  useDashboardWidgets,
  WidgetFilterBar,
  WidgetGrid,
  WidgetToolbar,
  type DashboardWidgetProviderProps,
  type WidgetFilterBarProps,
  type WidgetGridProps,
  type WidgetToolbarProps,
} from "./WidgetFramework";
export { baseWidgets, defaultKpis, defaultQuickActionLabels } from "./placeholders";
export type {
  ActivityItem,
  DashboardFilterState,
  DashboardLayoutMode,
  KpiItem,
  NotificationItem,
  NotificationTone,
  QuickActionItem,
  WidgetDefinition,
  WidgetKind,
} from "./types";
export { dashboardBreakpoints, useDashboardLayout } from "./useDashboardLayout";
