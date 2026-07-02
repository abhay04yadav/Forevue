import { useQueries } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listAtRiskStudents } from "@/api/risk";
import type { AtRiskStudentResponse } from "@/api/types";
import { useAuth } from "@/auth";
import { FacultyEmptyScopeState } from "@/components/faculty/FacultyEmptyScopeState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  ErrorState,
  FilterEmptyState,
  LoadingState,
  TierBadge,
  sevForTier,
  type Tier,
} from "@/design";
import { cn } from "@/lib/utils";

const TIERS: Tier[] = ["high", "watch", "low"];
const TYPES = [
  { key: "all", label: "All" },
  { key: "attendance", label: "Attendance" },
  { key: "academic", label: "Academic" },
  { key: "fee", label: "Fee" },
] as const;
const PAGE_SIZE_CAP = 50;

export function RiskBoardPage() {
  const { user } = useAuth();
  const [tierFilter, setTierFilter] = useState<Record<Tier, boolean>>({
    high: true,
    watch: true,
    low: false,
  });
  const [typeFilter, setTypeFilter] = useState<(typeof TYPES)[number]["key"]>("all");
  const [search, setSearch] = useState("");

  const selectedTiers = TIERS.filter((t) => tierFilter[t]);
  const useDefaultAtRisk = tierFilter.high && tierFilter.watch && !tierFilter.low;

  const queries = useQueries({
    queries:
      selectedTiers.length === 0
        ? []
        : useDefaultAtRisk
          ? [
              {
                queryKey: ["risk-students", "default", typeFilter],
                queryFn: () =>
                  listAtRiskStudents({
                    risk_type: typeFilter === "all" ? undefined : typeFilter,
                  }),
              },
            ]
          : selectedTiers.map((tier) => ({
              queryKey: ["risk-students", tier, typeFilter],
              queryFn: () =>
                listAtRiskStudents({
                  tier,
                  risk_type: typeFilter === "all" ? undefined : typeFilter,
                }),
            })),
  });

  const isLoading = selectedTiers.length > 0 && queries.some((q) => q.isLoading);
  const isError = queries.some((q) => q.isError);
  const anyAtCap = queries.some((q) => (q.data?.length ?? 0) >= PAGE_SIZE_CAP);

  const students = useMemo(() => {
    const merged = new Map<string, AtRiskStudentResponse>();
    for (const q of queries) {
      for (const s of q.data ?? []) {
        merged.set(s.student_id, s);
      }
    }
    return Array.from(merged.values()).sort((a, b) => b.overall_score - a.overall_score);
  }, [queries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.canonical_roll_no.toLowerCase().includes(q),
    );
  }, [students, search]);

  function retry() {
    queries.forEach((q) => q.refetch());
  }

  if (user?.role === "faculty" && (user.departmentCodes?.length ?? 0) === 0) {
    return (
      <div className="pb-16">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--text-strong)]">At-risk students</h1>
        </header>
        <FacultyEmptyScopeState title="No cohort assigned for risk board" />
      </div>
    );
  }

  return (
    <div className="pb-16">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-strong)]">At-risk students</h1>
          <p className="fv-data mt-1.5 text-sm font-medium text-[var(--text-muted)]">
            {filtered.length} shown
          </p>
        </div>
        <div className="flex min-w-[248px] items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-page)] px-3">
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or roll number"
            className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-strong)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="fv-eyebrow mr-1">Tier</span>
          {TIERS.map((tier) => (
            <Button
              key={tier}
              type="button"
              size="sm"
              variant={tierFilter[tier] ? "default" : "outline"}
              className={cn(
                "gap-1.5 capitalize",
                !tierFilter[tier] && "text-[var(--text-muted)] opacity-75",
              )}
              onClick={() => setTierFilter((f) => ({ ...f, [tier]: !f[tier] }))}
            >
              <TierBadge tier={tier} variant="glyph" size="sm" showLabel={false} />
              {tier === "high" ? "High" : tier === "watch" ? "Watch" : "Low"}
            </Button>
          ))}
        </div>
        <div className="hidden h-5 w-px bg-[var(--border-subtle)] sm:block" />
        <div className="flex rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-0.5">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTypeFilter(t.key)}
              className={cn(
                "rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-semibold transition-colors",
                typeFilter === t.key
                  ? "bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-strong)]",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {selectedTiers.length === 0 && (
        <FilterEmptyState message="Select at least one tier to see students." />
      )}

      {selectedTiers.length > 0 && isLoading && (
        <LoadingState label="Loading at-risk students…" />
      )}

      {selectedTiers.length > 0 && !isLoading && isError && (
        <ErrorState
          title="Risk scores didn't load"
          message="The risk service didn't respond. Your students are safe in the system — only this view failed. Try again in a moment."
          onRetry={retry}
        />
      )}

      {selectedTiers.length > 0 && !isLoading && !isError && filtered.length === 0 && students.length === 0 && (
        <EmptyState
          title="Nobody in your cohort is flagged"
          message="No students in your scope are at risk right now. We'll surface anyone here the moment their attendance, marks, or fees cross a threshold."
        />
      )}

      {selectedTiers.length > 0 && !isLoading && !isError && filtered.length === 0 && students.length > 0 && (
        <FilterEmptyState
          message="No students match these filters."
          onClear={() => {
            setSearch("");
            setTypeFilter("all");
          }}
        />
      )}

      {selectedTiers.length > 0 && !isLoading && !isError && filtered.length > 0 && (
        <>
          {anyAtCap && (
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Showing up to {PAGE_SIZE_CAP} per tier. Narrow your filters to see more.
            </p>
          )}
          <ul className="mt-4 flex flex-col gap-3">
            {filtered.map((s) => {
              const sev = sevForTier(s.tier as Tier);
              return (
                <li key={s.student_id}>
                  <Link
                    to={`/students/${s.student_id}`}
                    className="fv-card grid grid-cols-[5px_1fr_auto] gap-4 overflow-hidden p-0 transition-shadow hover:shadow-[var(--shadow-md)]"
                  >
                  <span
                    className="rounded-r-sm"
                    style={{ background: sev.fill }}
                    aria-hidden
                  />
                  <div className="min-w-0 py-4 pl-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-base font-semibold text-[var(--text-strong)]">{s.name}</span>
                      <span className="fv-data text-xs font-semibold text-[var(--text-muted)]">
                        {s.canonical_roll_no}
                      </span>
                    </div>
                  </div>
                  <div className="flex min-w-[92px] flex-col items-end justify-center gap-2 py-4 pr-5 text-right">
                    <TierBadge tier={s.tier as Tier} size="sm" />
                    <div
                      className="fv-data text-3xl leading-none font-extrabold tracking-tight"
                      style={{ color: sev.ink }}
                    >
                      {Math.round(s.overall_score)}
                    </div>
                  </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
