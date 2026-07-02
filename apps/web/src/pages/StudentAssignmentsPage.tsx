import { FileText } from "lucide-react";
import * as React from "react";

import { StudentQueryState } from "@/components/student";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs } from "@/components/ui/tabs";
import { iconDefaults } from "@/design/tokens/icons";
import { useStudentAssignments, useStudentId } from "@/hooks/useStudentContext";
import { useStudentNav } from "@/hooks/useStudentNav";
import { PageHeader } from "@/layout/PageHeader";

export function StudentAssignmentsPage() {
  const studentId = useStudentId();
  const nav = useStudentNav();
  const [filter, setFilter] = React.useState<string>("open");
  const assignments = useStudentAssignments(filter === "all" ? undefined : filter);

  if (!studentId) {
    return <p className="text-sm text-[var(--text-muted)]">Student record unavailable.</p>;
  }

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: "Home" }, { label: "Assignments" }]}
        title="Assignments"
        description={`${assignments.data?.open_count ?? 0} open`}
      />
      <div className="mb-4">
        <Tabs
          items={[
            { id: "open", label: "Open" },
            { id: "submitted", label: "Submitted" },
            { id: "all", label: "All" },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>
      <Card padding="none">
        <CardContent className="pt-2">
          <StudentQueryState
            isLoading={assignments.isLoading}
            isError={assignments.isError}
            onRetry={() => assignments.refetch()}
            empty={!assignments.data?.items.length}
          >
            {assignments.data?.items.map((a) => (
              <div key={a.id} className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-4 last:border-b-0">
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]">
                  <FileText size={16} strokeWidth={iconDefaults.strokeWidth} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{a.title}</span>
                    <Badge tone="neutral">{a.priority}</Badge>
                    <Badge tone="neutral">{a.status}</Badge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{a.due_label} · {a.course_name}</p>
                  <Progress value={a.progress_pct} className="mt-2 max-w-xs" />
                </div>
                <Button variant="secondary" size="sm" onClick={() => nav.toAi({ assignmentId: a.id })}>
                  AI help
                </Button>
              </div>
            ))}
          </StudentQueryState>
        </CardContent>
      </Card>
    </div>
  );
}
