import * as React from "react";

import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}

/** Forevue Tabs — design-system/components/navigation/Tabs.jsx */
function Tabs({ items, value, defaultValue, onChange, className }: TabsProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.id);
  const active = isControlled ? value : internal;

  const select = (id: string) => {
    if (!isControlled) setInternal(id);
    onChange?.(id);
  };

  return (
    <div
      role="tablist"
      className={cn("flex gap-1 border-b border-[var(--border-subtle)]", className)}
    >
      {items.map((item) => {
        const on = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => select(item.id)}
            className={cn(
              "relative -mb-px inline-flex items-center gap-[7px] border-b-2 px-3 py-2.5 text-sm whitespace-nowrap transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
              on
                ? "border-[var(--action-primary)] font-semibold text-[var(--color-deep-teal)]"
                : "border-transparent font-medium text-[var(--color-neutral-600)] hover:text-[var(--text-strong)]",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-[7px] py-px text-xs font-semibold tabular-nums",
                  on
                    ? "bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]"
                    : "bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)]",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  activeValue: string;
}

function TabPanel({ value, activeValue, className, children, ...props }: TabPanelProps) {
  if (value !== activeValue) return null;
  return (
    <div role="tabpanel" className={className} {...props}>
      {children}
    </div>
  );
}

export { TabPanel, Tabs };
