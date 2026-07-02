import {
  Calendar,
  Check,
  ChevronRight,
  Download,
  Eye,
  GitBranch,
  ListTree,
  PanelRight,
  Share2,
  Shield,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import * as React from "react";
import { useParams } from "react-router-dom";

import { FacultyArtifactEditor } from "@/pages/faculty/FacultyArtifactEditor";

import { Button } from "@/components/ui/button";
import { iconDefaults } from "@/design/tokens/icons";
import {
  ApprovalBar,
  ArtifactDock,
  ArtifactEditor,
  ExportMenu,
  MOCK_ARTIFACT,
  MOCK_COMMENTS,
  MOCK_EXPORT_OPTIONS,
  MOCK_METADATA,
  MOCK_SECTIONS,
  MOCK_VERSIONS,
  OutlinePanel,
  useArtifactWorkspaceLayout,
} from "@/layout/artifact-workspace";
import { cn } from "@/lib/utils";

const STATUS_BY_STAGE = {
  draft: {
    label: "Draft",
    color: "var(--color-neutral-600)",
    bg: "var(--color-neutral-100)",
    border: "var(--border-default)",
  },
  review: {
    label: "In review",
    color: "var(--color-risk-watch)",
    bg: "var(--color-risk-watch-bg)",
    border: "var(--color-amber-200)",
  },
  approved: {
    label: "Approved",
    color: "var(--color-risk-low)",
    bg: "var(--color-risk-low-bg)",
    border: "var(--color-risk-low)",
  },
  published: {
    label: "Published",
    color: "var(--color-deep-teal)",
    bg: "var(--color-teal-50)",
    border: "var(--color-teal-100)",
  },
} as const;

/** Artifact Workspace page — editor with outline, dock, and approval workflow */
export function ArtifactWorkspacePage() {
  const { artifactId } = useParams<{ artifactId?: string }>();
  if (artifactId) {
    return <FacultyArtifactEditor artifactId={artifactId} />;
  }
  return <MockArtifactWorkspace />;
}

function MockArtifactWorkspace() {
  const layout = useArtifactWorkspaceLayout();
  const [sections, setSections] = React.useState(MOCK_SECTIONS);
  const [workflow, setWorkflow] = React.useState<keyof typeof STATUS_BY_STAGE>("draft");
  const [dockOpen, setDockOpen] = React.useState(layout.showDock);
  const [dockTab, setDockTab] = React.useState<"comments" | "versions" | "metadata">("comments");
  const [comments, setComments] = React.useState(MOCK_COMMENTS);
  const [showResolved, setShowResolved] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [reviewMode, setReviewMode] = React.useState(false);
  const [activeSectionId, setActiveSectionId] = React.useState(sections[0]?.id);
  const exportAnchorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setDockOpen(layout.showDock);
  }, [layout.showDock]);

  const status = STATUS_BY_STAGE[workflow];
  const metadata = React.useMemo(
    () =>
      MOCK_METADATA.map((row) =>
        row.id === "m9" ? { ...row, value: status.label } : row,
      ),
    [status.label],
  );

  const outlineItems = sections.map((s) => ({
    id: s.id,
    title: s.title,
    aiGenerated: s.aiGenerated,
    hasComment: s.hasComment,
    active: s.id === activeSectionId,
  }));

  const handleSectionChange = (id: string, markdown: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, markdown } : s)),
    );
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="-mx-6 -mt-6 flex h-[calc(100vh-52px)] min-h-0 overflow-hidden border-t border-[var(--border-subtle)]">
      {layout.showOutline && (
        <OutlinePanel
          sections={outlineItems}
          activeSectionId={activeSectionId}
          onSelect={scrollToSection}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--surface-page)]">
        <header className="shrink-0 border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div className="flex items-start gap-3 px-[18px] pt-2.5 pb-2">
            {layout.isMobile && (
              <button
                type="button"
                aria-label="Outline"
                className="inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)]"
              >
                <ListTree size={17} strokeWidth={iconDefaults.strokeWidth} />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <nav
                aria-label="Breadcrumb"
                className="mb-0.5 flex items-center gap-1 text-[11.5px] text-[var(--text-muted)]"
              >
                <span>Artifacts</span>
                <ChevronRight size={12} strokeWidth={iconDefaults.strokeWidth} />
                <span>{MOCK_ARTIFACT.type}</span>
              </nav>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="m-0 text-[19px] font-bold tracking-tight text-[var(--text-strong)]">
                  {MOCK_ARTIFACT.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--color-teal-100)] bg-[var(--color-teal-50)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-deep-teal)]">
                  <Sparkles size={12} strokeWidth={iconDefaults.strokeWidth} />
                  Generated by AI
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    color: status.color,
                    background: status.bg,
                    borderColor: status.border,
                  }}
                >
                  <span
                    className="size-[7px] rounded-full"
                    style={{ background: status.color }}
                  />
                  {status.label}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-3.5 text-[11.5px] text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-1">
                  <Tag size={12} /> {MOCK_ARTIFACT.type}
                </span>
                <span className="inline-flex items-center gap-1">
                  <User size={12} /> {MOCK_ARTIFACT.owner}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} /> Updated {MOCK_ARTIFACT.updated}
                </span>
                <span className="inline-flex items-center gap-1">
                  <GitBranch size={12} /> {MOCK_ARTIFACT.version}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Shield size={12} /> Approver: {MOCK_ARTIFACT.approver}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 px-[18px] pb-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setWorkflow("review")}
            >
              Submit for review
            </Button>
            <Button variant="secondary" size="sm">
              <Check size={14} strokeWidth={iconDefaults.strokeWidth} />
              Save version
            </Button>
            <div ref={exportAnchorRef} className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExportOpen((v) => !v)}
              >
                <Download size={14} strokeWidth={iconDefaults.strokeWidth} />
                Export
              </Button>
              <ExportMenu
                options={MOCK_EXPORT_OPTIONS}
                open={exportOpen}
                onClose={() => setExportOpen(false)}
              />
            </div>
            <Button variant="secondary" size="sm">
              <Share2 size={14} strokeWidth={iconDefaults.strokeWidth} />
              Share
            </Button>
            <Button
              variant={reviewMode ? "primary" : "secondary"}
              size="sm"
              onClick={() => setReviewMode((v) => !v)}
            >
              <Eye size={14} strokeWidth={iconDefaults.strokeWidth} />
              Review mode
            </Button>
            <button
              type="button"
              aria-label="Toggle panel"
              onClick={() => setDockOpen((v) => !v)}
              className={cn(
                "ml-auto inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] border-none",
                dockOpen
                  ? "bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]"
                  : "bg-transparent text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]",
              )}
            >
              <PanelRight size={17} strokeWidth={iconDefaults.strokeWidth} />
            </button>
          </div>

          <ApprovalBar stage={workflow} />
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[760px] px-[26px] py-[22px] pb-16">
            <ArtifactEditor sections={sections} onSectionChange={handleSectionChange} />
          </div>
        </div>
      </main>

      {dockOpen && (
        <ArtifactDock
          tab={dockTab}
          onTabChange={setDockTab}
          onClose={layout.isMobile ? () => setDockOpen(false) : undefined}
          comments={comments}
          versions={MOCK_VERSIONS}
          metadata={metadata}
          showResolved={showResolved}
          onToggleResolved={() => setShowResolved((v) => !v)}
          onResolveComment={(id) =>
            setComments((prev) =>
              prev.map((c) => (c.id === id ? { ...c, resolved: true } : c)),
            )
          }
        />
      )}
    </div>
  );
}
