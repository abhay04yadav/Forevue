import { StudentQueryState } from "@/components/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStudentFees, useStudentId } from "@/hooks/useStudentContext";
import { useStudentNav } from "@/hooks/useStudentNav";
import { PageHeader } from "@/layout/PageHeader";

function formatAmount(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function StudentFeesPage() {
  const studentId = useStudentId();
  const nav = useStudentNav();
  const fees = useStudentFees();

  if (!studentId) {
    return <p className="text-sm text-[var(--text-muted)]">Student record unavailable.</p>;
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Brief" }, { label: "Fees" }]}
        title="Fees"
        description="Your fee standing from the institution ledger — read-only."
      />
      <Card padding="md" className="mb-4">
        <StudentQueryState isLoading={fees.isLoading} isError={fees.isError} onRetry={() => fees.refetch()}>
          {fees.data && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-xs text-[var(--text-muted)]">Total due</div>
                  <div className="fv-data text-2xl font-extrabold">{formatAmount(fees.data.total_due)}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)]">Paid</div>
                  <div className="text-2xl font-bold tabular-nums">{formatAmount(fees.data.total_paid)}</div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text-muted)]">Balance</div>
                  <div className="text-2xl font-bold tabular-nums">{formatAmount(fees.data.total_balance)}</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[var(--text-body)]">{fees.data.note}</p>
            </div>
          )}
        </StudentQueryState>
      </Card>

      <Card padding="none">
        <CardContent className="divide-y divide-[var(--border-subtle)] pt-2">
          <StudentQueryState isLoading={fees.isLoading} isError={fees.isError} empty={!fees.data?.items.length}>
            {fees.data?.items.map((item) => (
              <div key={`${item.term}-${item.fee_head}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-4">
                <div>
                  <p className="font-semibold text-[var(--text-strong)]">{item.fee_head}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.term}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold tabular-nums">Balance {formatAmount(item.balance ?? 0)}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Due {formatAmount(item.amount_due ?? 0)} · Paid {formatAmount(item.amount_paid ?? 0)}
                  </p>
                </div>
              </div>
            ))}
          </StudentQueryState>
        </CardContent>
      </Card>

      <div className="mt-4">
        <Button variant="secondary" onClick={() => nav.toAi({ context: "fees" })}>
          Ask Forevue about fees
        </Button>
      </div>
    </div>
  );
}
