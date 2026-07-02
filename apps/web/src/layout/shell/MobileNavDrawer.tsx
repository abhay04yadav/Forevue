import { HelpCircle, Settings, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerBody, DrawerHeader } from "@/components/ui/drawer";
import { iconDefaults } from "@/design/tokens/icons";

import { AppNav } from "../AppNav";
import { useShell } from "./ShellProvider";

/** Mobile navigation drawer — App Shell design */
export function MobileNavDrawer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mobileDrawerOpen, setMobileDrawerOpen, openOverlay } = useShell();
  const isSettings = location.pathname.startsWith("/settings");

  return (
    <Drawer
      open={mobileDrawerOpen}
      onOpenChange={setMobileDrawerOpen}
      side="left"
      width={264}
    >
      <DrawerHeader
        title={
          <div className="flex items-center gap-2.25">
            <img src="/forevue-icon.svg" alt="" className="h-6 w-6" />
            <span className="text-[17px] font-bold text-[var(--text-strong)]">Forevue</span>
          </div>
        }
        onClose={() => setMobileDrawerOpen(false)}
      />
      <DrawerBody className="flex flex-col gap-2 px-1">
        <Button
          type="button"
          variant="primary"
          className="mb-1"
          iconLeft={<Sparkles size={iconDefaults.size} strokeWidth={iconDefaults.strokeWidth} />}
          onClick={() => {
            setMobileDrawerOpen(false);
            navigate("/ai");
          }}
        >
          AI workspace
        </Button>

        <AppNav onNavigate={() => setMobileDrawerOpen(false)} />

        <div className="mt-auto flex flex-col gap-0.5 border-t border-[var(--border-subtle)] pt-2">
          <button
            type="button"
            onClick={() => {
              setMobileDrawerOpen(false);
              openOverlay("help");
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border-none bg-transparent px-2.75 py-2.75 text-left text-sm text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]"
          >
            <HelpCircle size={18} strokeWidth={iconDefaults.strokeWidth} />
            Help
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileDrawerOpen(false);
              navigate("/settings");
            }}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border-none px-2.75 py-2.75 text-left text-sm hover:bg-[var(--color-neutral-100)]"
            style={{
              background: isSettings ? "var(--color-teal-50)" : "transparent",
              color: isSettings ? "var(--color-deep-teal)" : "var(--color-neutral-700)",
              fontWeight: isSettings ? 600 : 500,
            }}
          >
            <Settings size={18} strokeWidth={iconDefaults.strokeWidth} />
            Settings
          </button>
        </div>
      </DrawerBody>
    </Drawer>
  );
}
