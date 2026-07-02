import { ChevronRight, Search, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { iconDefaults } from "@/design/tokens/icons";

import { useShell } from "./ShellProvider";

const MOCK_HELP_ARTICLES = [
  { id: "h1", title: "How Forevue surfaces risk", meta: "Grounded answers with evidence" },
  { id: "h2", title: "Consent for minor records", meta: "Privacy-first data handling" },
  { id: "h3", title: "Approving ERP writes", meta: "Nothing is saved until you approve" },
  { id: "h4", title: "Keyboard shortcuts", meta: "Search, navigate, close overlays" },
  { id: "h5", title: "Roles and visibility", meta: "Who sees what in your college" },
];

/** Help center drawer — App Shell design (mock) */
export function HelpPanel() {
  const { overlay, closeOverlay } = useShell();
  const [query, setQuery] = React.useState("");

  if (overlay !== "help") return null;

  const q = query.trim().toLowerCase();
  const articles = MOCK_HELP_ARTICLES.filter(
    (a) => !q || a.title.toLowerCase().includes(q) || a.meta.toLowerCase().includes(q),
  );

  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 z-50 bg-[rgba(6,54,59,0.35)] animate-fv-fade"
        onClick={closeOverlay}
      />
      <aside
        role="dialog"
        aria-label="Help center"
        className="fixed top-0 right-0 bottom-0 z-[51] flex w-[min(380px,100vw)] flex-col border-l border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-lg)] animate-fv-slide-in-right"
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--border-subtle)] px-[18px] py-4">
          <h2 className="m-0 flex-1 text-base font-bold text-[var(--text-strong)]">Help center</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={closeOverlay}
            className="inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center border-none bg-transparent text-[var(--color-neutral-500)]"
          >
            <X size={17} strokeWidth={iconDefaults.strokeWidth} />
          </button>
        </div>

        <div className="border-b border-[var(--border-subtle)] px-[18px] py-4">
          <div className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-page)] px-3">
            <Search size={16} strokeWidth={iconDefaults.strokeWidth} className="text-[var(--color-neutral-500)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles"
              className="flex-1 border-none bg-transparent text-sm text-[var(--text-strong)] outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {articles.map((a) => (
            <button
              key={a.id}
              type="button"
              className="flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border-none bg-transparent px-3 py-3 text-left transition-colors hover:bg-[var(--color-neutral-100)]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-[var(--text-strong)]">{a.title}</span>
                <span className="block text-[12.5px] text-[var(--text-muted)]">{a.meta}</span>
              </span>
              <ChevronRight size={15} strokeWidth={iconDefaults.strokeWidth} className="text-[var(--color-neutral-400)]" />
            </button>
          ))}
          {articles.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              No articles match your search.
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border-subtle)] px-[18px] py-3.5">
          <Button type="button" variant="secondary" fullWidth>
            Contact support
          </Button>
        </div>
      </aside>
    </>
  );
}
