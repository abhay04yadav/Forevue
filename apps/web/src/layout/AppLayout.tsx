import { motion } from "framer-motion";
import * as React from "react";
import { Outlet } from "react-router-dom";

import { motion as motionTokens } from "@/design/tokens/motion";
import { cn } from "@/lib/utils";

import { Container } from "./Container";
import { ContentLayout } from "./ContentLayout";
import { AppSidebar } from "./shell/AppSidebar";
import { AppTopNav } from "./shell/AppTopNav";
import { ShellOverlays } from "./shell/ShellOverlays";
import { useIsMobileLayout } from "./useIsMobileLayout";

export interface AppLayoutProps {
  children?: React.ReactNode;
}

/** Forevue authenticated application shell */
export function AppLayout({ children }: AppLayoutProps) {
  const content = children ?? <Outlet />;
  const isMobile = useIsMobileLayout();

  return (
    <div className="fv-shell-page flex h-screen overflow-hidden">
      {!isMobile && (
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: motionTokens.durationNormal,
            ease: motionTokens.easeStandard,
          }}
          className="hidden h-full shrink-0 md:flex"
        >
          <AppSidebar />
        </motion.div>
      )}

      <ContentLayout header={<AppTopNav />} className="min-h-0 min-w-0 flex-1">
        <Container width="wide" className={cn("pb-12")}>
          {content}
        </Container>
      </ContentLayout>

      <ShellOverlays />
    </div>
  );
}
