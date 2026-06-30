import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children?: React.ReactNode }) {
  const content = children ?? <Outlet />;

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <motion.aside
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0.2, 1] }}
        className="border-border bg-card hidden w-[var(--app-sidebar)] shrink-0 flex-col border-r md:flex"
        aria-label="Primary navigation"
      >
        <div className="border-border flex h-14 items-center border-b px-5">
          <span className="text-foreground text-sm font-bold tracking-tight">Forevue</span>
        </div>
        <nav className="text-muted-foreground flex-1 px-3 py-4 text-sm">
          <p className="px-2 text-xs font-bold tracking-[0.14em] uppercase">Navigation</p>
          <p className="text-muted-foreground mt-3 px-2 text-xs leading-relaxed">
            Role workspaces will appear here.
          </p>
        </nav>
      </motion.aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="border-border bg-card/80 supports-[backdrop-filter]:bg-card/70 sticky top-0 z-10 flex h-14 items-center justify-between border-b px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <span className="text-sm font-bold tracking-tight">Forevue</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className={cn("flex-1 px-4 py-6 md:px-8")}>{content}</main>
      </div>
    </div>
  );
}
