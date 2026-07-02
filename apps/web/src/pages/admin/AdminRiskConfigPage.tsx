import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getRiskConfig, updateRiskConfig } from "@/api/risk";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { ErrorState, LoadingState } from "@/design";
import { PageHeader } from "@/layout/PageHeader";

const WEIGHT_KEYS = [
  "ATTENDANCE_BELOW_THRESHOLD",
  "ATTENDANCE_DECLINING",
  "ACADEMIC_FAILING_INTERNALS",
  "ACADEMIC_DECLINE",
  "FEE_OVERDUE",
] as const;

interface ConfigFormState {
  attendance_threshold_pct: number;
  attendance_min_sessions: number;
  attendance_trend_window: number;
  attendance_decline_points: number;
  academic_fail_pct: number;
  academic_decline_points: number;
  fee_overdue_days: number;
  weights: Record<string, number>;
  tier_cutoffs: { watch: number; high: number };
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function AdminRiskConfigPage() {
  const queryClient = useQueryClient();
  const configQuery = useQuery({ queryKey: ["risk-config"], queryFn: getRiskConfig });
  const [form, setForm] = useState<ConfigFormState | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (configQuery.data && !form) {
      setForm(configQuery.data.config as unknown as ConfigFormState);
    }
  }, [configQuery.data, form]);

  const save = useMutation({
    mutationFn: (config: ConfigFormState) => updateRiskConfig({ config: config as never }),
    onSuccess: (data) => {
      queryClient.setQueryData(["risk-config"], data);
      toast({ title: `Saved — version ${data.version}`, tone: "success" });
      setValidationErrors([]);
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
      if (Array.isArray(detail)) {
        setValidationErrors(
          detail.map((d: { loc?: unknown[]; msg?: string }) => `${(d.loc ?? []).join(".")}: ${d.msg}`),
        );
      } else {
        setValidationErrors(["Couldn't save. Check that watch < high and all values are in range."]);
      }
    },
  });

  if (configQuery.isLoading) return <LoadingState label="Loading risk config…" />;
  if (configQuery.isError || !form) {
    return (
      <ErrorState
        title="Couldn't load risk config"
        message="Try again in a moment."
        onRetry={() => configQuery.refetch()}
      />
    );
  }

  const invalidCutoffs = form.tier_cutoffs.watch >= form.tier_cutoffs.high;

  return (
    <div className="pb-16">
      <PageHeader
        title="Risk config"
        description={`Version ${configQuery.data?.version} · thresholds drive every score and tier computed by the engine.`}
      />

      <Card className="mt-6">
        <CardContent className="flex flex-col gap-6 p-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <h2 className="sm:col-span-2 text-base font-semibold text-[var(--text-strong)]">Attendance</h2>
            <NumberField
              label="Threshold % (below this fires a finding)"
              value={form.attendance_threshold_pct}
              onChange={(n) => setForm({ ...form, attendance_threshold_pct: n })}
            />
            <NumberField
              label="Min sessions before the rule fires"
              value={form.attendance_min_sessions}
              onChange={(n) => setForm({ ...form, attendance_min_sessions: n })}
            />
            <NumberField
              label="Trend window (sessions)"
              value={form.attendance_trend_window}
              onChange={(n) => setForm({ ...form, attendance_trend_window: n })}
            />
            <NumberField
              label="Decline points to flag a drop"
              value={form.attendance_decline_points}
              onChange={(n) => setForm({ ...form, attendance_decline_points: n })}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <h2 className="sm:col-span-2 text-base font-semibold text-[var(--text-strong)]">Academic</h2>
            <NumberField
              label="Fail % (internal mark below this)"
              value={form.academic_fail_pct}
              onChange={(n) => setForm({ ...form, academic_fail_pct: n })}
            />
            <NumberField
              label="Decline points to flag a drop"
              value={form.academic_decline_points}
              onChange={(n) => setForm({ ...form, academic_decline_points: n })}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <h2 className="sm:col-span-2 text-base font-semibold text-[var(--text-strong)]">Fees</h2>
            <NumberField
              label="Overdue days threshold"
              value={form.fee_overdue_days}
              onChange={(n) => setForm({ ...form, fee_overdue_days: n })}
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <h2 className="sm:col-span-2 text-base font-semibold text-[var(--text-strong)]">Weights</h2>
            {WEIGHT_KEYS.map((key) => (
              <NumberField
                key={key}
                label={key.replace(/_/g, " ")}
                value={form.weights[key] ?? 0}
                onChange={(n) => setForm({ ...form, weights: { ...form.weights, [key]: n } })}
              />
            ))}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <h2 className="sm:col-span-2 text-base font-semibold text-[var(--text-strong)]">Tier cutoffs</h2>
            <NumberField
              label="Watch (score ≥)"
              value={form.tier_cutoffs.watch}
              onChange={(n) => setForm({ ...form, tier_cutoffs: { ...form.tier_cutoffs, watch: n } })}
            />
            <NumberField
              label="High (score ≥)"
              value={form.tier_cutoffs.high}
              onChange={(n) => setForm({ ...form, tier_cutoffs: { ...form.tier_cutoffs, high: n } })}
            />
          </section>

          {invalidCutoffs && (
            <p className="text-sm font-medium text-[var(--color-risk-high)]">Watch must be strictly less than high.</p>
          )}
          {validationErrors.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm font-medium text-[var(--color-risk-high)]">
              {validationErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            disabled={save.isPending || invalidCutoffs}
            onClick={() => save.mutate(form)}
          >
            {save.isPending ? "Saving…" : "Save changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
