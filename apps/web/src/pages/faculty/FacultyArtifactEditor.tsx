import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getFacultyArtifact, updateFacultyArtifact } from "@/api/faculty";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorState, LoadingState } from "@/design";
import { PageHeader } from "@/layout/PageHeader";
import { STAFF_PATHS } from "@/routes/paths";

export function FacultyArtifactEditor({ artifactId }: { artifactId: string }) {
  const queryClient = useQueryClient();
  const artifact = useQuery({
    queryKey: ["faculty-artifact", artifactId],
    queryFn: () => getFacultyArtifact(artifactId),
  });

  const save = useMutation({
    mutationFn: (markdown: string) =>
      updateFacultyArtifact(artifactId, {
        content_json: { ...artifact.data?.content_json, markdown },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["faculty-artifact", artifactId] }),
  });

  if (artifact.isLoading) return <LoadingState label="Loading draft…" />;
  if (artifact.isError || !artifact.data) {
    return <ErrorState title="Artifact not found" message="This draft may have been removed." />;
  }

  const markdown =
    (artifact.data.content_json.markdown as string) ||
    (artifact.data.content_json.body as string) ||
    "";

  return (
    <div className="pb-16">
      <PageHeader
        breadcrumbs={[{ label: "Create", href: STAFF_PATHS.create }, { label: artifact.data.title }]}
        title={artifact.data.title}
        description={`${artifact.data.artifact_type} · ${artifact.data.status} · v${artifact.data.version}`}
        actions={
          <Button variant="secondary" size="sm" asChild>
            <a
              href={`/faculty/artifacts/${artifactId}/export`}
              onClick={async (e) => {
                e.preventDefault();
                const res = await apiClient.post(
                  `/faculty/artifacts/${artifactId}/export`,
                  undefined,
                  { responseType: "blob" },
                );
                const url = URL.createObjectURL(res.data);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${artifact.data!.title.slice(0, 30)}.md`;
                a.click();
              }}
            >
              Export markdown
            </a>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <textarea
            className="min-h-[420px] w-full resize-y border-0 bg-transparent p-5 font-mono text-sm outline-none"
            defaultValue={markdown}
            onBlur={(e) => {
              if (e.target.value !== markdown) save.mutate(e.target.value);
            }}
          />
        </CardContent>
      </Card>
      <p className="mt-3 text-sm text-[var(--text-muted)]">
        Advisory draft only — edits save on blur.{" "}
        <Link to={STAFF_PATHS.home} className="text-[var(--color-deep-teal)]">
          Back to home
        </Link>
      </p>
    </div>
  );
}
