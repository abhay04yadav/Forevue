import { AppLayout } from "./AppLayout";
import { ShellProvider } from "./shell/ShellProvider";

/** Protected authenticated layout — shell chrome + routing outlet */
export function ProtectedLayout() {
  return (
    <ShellProvider>
      <AppLayout />
    </ShellProvider>
  );
}

/** @deprecated Use ProtectedLayout — kept for compatibility */
export function RootLayout() {
  return <ProtectedLayout />;
}
