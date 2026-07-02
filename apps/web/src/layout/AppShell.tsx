import { AppLayout } from "./AppLayout";

/** Authenticated shell — thin wrapper around {@link AppLayout} */
export function AppShell({ children }: { children?: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
