import { Moon, Sun } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabPanel, Tabs } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/use-theme";
import { PageHeader } from "@/layout/PageHeader";
import { MOCK_SHELL_USER } from "@/layout/shell/mock-data";
import { iconDefaults } from "@/design/tokens/icons";

const SETTINGS_TABS = [
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "security", label: "Security" },
];

/** Settings view — App Shell design (mock, no backend) */
export function SettingsPage() {
  const [tab, setTab] = React.useState("profile");
  const { resolved, setMode } = useTheme();
  const user = MOCK_SHELL_USER;

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Settings" }]}
        title="Settings"
        description="Profile, notifications, and appearance for your workspace."
      />

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border-subtle)] px-[18px] pt-1.5">
          <Tabs items={SETTINGS_TABS} value={tab} onChange={setTab} />
        </div>

        <div className="max-w-[640px] p-6">
          <TabPanel value="profile" activeValue={tab}>
            <div className="flex flex-col gap-[18px]">
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--color-teal-600)] text-lg font-bold text-white">
                  {user.initials}
                </span>
                <div>
                  <div className="text-base font-semibold text-[var(--text-strong)]">{user.name}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge tone="teal">{user.roleLabel}</Badge>
                    <span className="text-[13px] text-[var(--text-muted)]">{user.title}</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <Input label="Full name" defaultValue={user.name} />
                <Input label="Work email" defaultValue={user.email} />
                <Input label="Title" defaultValue={user.title} />
                <Input label="Role" defaultValue={user.roleLabel} disabled hint="Set by your workspace admin." />
              </div>
              <div className="flex gap-2.5 pt-1">
                <Button type="button">Save changes</Button>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="notifications" activeValue={tab}>
            <div className="flex flex-col gap-5">
              <div>
                <div className="text-sm font-semibold text-[var(--text-strong)]">Channels</div>
                <p className="mt-1 mb-3 text-[13px] text-[var(--text-muted)]">
                  Where Forevue reaches you. It surfaces — it never acts on its own.
                </p>
                <MockToggle label="In-app notifications" defaultOn />
                <MockToggle label="Email" defaultOn />
                <MockToggle label="Weekly digest" />
              </div>
              <div className="border-t border-[var(--border-subtle)] pt-4">
                <div className="mb-3 text-sm font-semibold text-[var(--text-strong)]">
                  What to notify me about
                </div>
                <MockToggle label="Alerts — a threshold is crossed" defaultOn />
                <MockToggle label="Approvals waiting for me" defaultOn />
                <MockToggle label="AI recommendations" defaultOn />
                <MockToggle label="Tasks assigned to me" defaultOn />
              </div>
            </div>
          </TabPanel>

          <TabPanel value="appearance" activeValue={tab}>
            <div className="flex flex-col gap-5">
              <div>
                <div className="mb-2.5 text-sm font-semibold text-[var(--text-strong)]">Theme</div>
                <div className="inline-flex gap-0.75 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-page)] p-0.75">
                  <ThemeChip
                    active={resolved === "light"}
                    icon={Sun}
                    label="Light"
                    onClick={() => setMode("light")}
                  />
                  <ThemeChip
                    active={resolved === "dark"}
                    icon={Moon}
                    label="Dark"
                    onClick={() => setMode("dark")}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3.5 border-t border-[var(--border-subtle)] pt-4">
                <MockToggle label="Compact density" />
                <MockToggle label="Reduce motion" />
              </div>
            </div>
          </TabPanel>

          <TabPanel value="security" activeValue={tab}>
            <div className="flex flex-col gap-4 text-sm text-[var(--text-muted)]">
              <p>Password and session controls are mocked for this build loop.</p>
              <Button type="button" variant="secondary">
                Change password
              </Button>
              <Button type="button" variant="ghost">
                Sign out everywhere
              </Button>
            </div>
          </TabPanel>
        </div>
      </div>
    </div>
  );
}

function MockToggle({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <label className="mb-3 flex cursor-pointer items-center gap-3 text-sm text-[var(--text-body)]">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => setOn(e.target.checked)}
        className="h-4 w-4 accent-[var(--color-teal)]"
      />
      {label}
    </label>
  );
}

function ThemeChip({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Sun;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex cursor-pointer items-center gap-1.75 rounded-[7px] border-none px-3.5 py-1.75 text-[13px] transition-shadow"
      style={{
        background: active ? "var(--surface-card)" : "transparent",
        color: active ? "var(--text-strong)" : "var(--text-muted)",
        fontWeight: active ? 600 : 500,
        boxShadow: active ? "var(--shadow-xs)" : "none",
      }}
    >
      <Icon size={15} strokeWidth={iconDefaults.strokeWidth} aria-hidden />
      {label}
    </button>
  );
}
