import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getImportBatch } from "@/api/imports";
import { recompute } from "@/api/risk";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { ErrorState } from "@/design";
import { PageHeader } from "@/layout/PageHeader";

const RECOMPUTE_OK_STATUSES = new Set(["ok"]);

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="font-medium text-[var(--text-muted)]">{label}</span>
      <span className="text-right font-semibold text-[var(--text-strong)]">{value}</span>
    </div>
  );
}

export function AdminImportsPage() {
  const [batchId, setBatchId] = useState("");
  const [lookupId, setLookupId] = useState("");

  const batchQuery = useQuery({
    queryKey: ["import-batch", lookupId],
    queryFn: () => getImportBatch(lookupId),
    enabled: !!lookupId,
  });

  const recomputeMutation = useMutation({
    mutationFn: () => recompute({ scope: "tenant" }),
    onSuccess: (summary) => {
      toast({
        title: `Recompute done — ${summary.changed} changed, ${summary.evaluated} evaluated`,
        tone: "success",
      });
    },
  });

  const needsRecompute = batchQuery.data?.risk_recompute_status
    ? !RECOMPUTE_OK_STATUSES.has(batchQuery.data.risk_recompute_status)
    : false;

  return (
    <div className="pb-16">
      <PageHeader
        title="Imports"
        description="Look up an import batch by id to check its load and risk-recompute status."
      />

      <Card className="mt-6 max-w-3xl">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="import-batch-id">Import batch id</Label>
            <div className="flex gap-2">
              <Input
                id="import-batch-id"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="e.g. 9efd1c21-34ae-4946-a0a8-7f5fcedf8e47"
              />
              <Button type="button" disabled={!batchId} onClick={() => setLookupId(batchId)}>
                Look up
              </Button>
            </div>
          </div>

          {batchQuery.isError && (
            <ErrorState
              title="Batch not found"
              message="Check the id and try again."
              onRetry={() => batchQuery.refetch()}
            />
          )}

          {batchQuery.data && (
            <div className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] p-4">
              <DetailRow label="Pipeline status" value={batchQuery.data.status} />
              <DetailRow
                label="Rows loaded"
                value={`${batchQuery.data.row_count_loaded} / ${batchQuery.data.row_count_raw}`}
              />
              <DetailRow label="Rows quarantined" value={String(batchQuery.data.row_count_quarantined)} />
              <DetailRow label="Risk recompute" value={batchQuery.data.risk_recompute_status ?? "—"} />
              {batchQuery.data.error && <DetailRow label="Error" value={batchQuery.data.error} />}

              {needsRecompute && (
                <Button
                  type="button"
                  className="mt-2 self-start"
                  disabled={recomputeMutation.isPending}
                  onClick={() => recomputeMutation.mutate()}
                >
                  {recomputeMutation.isPending ? "Recomputing…" : "Run tenant recompute"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
