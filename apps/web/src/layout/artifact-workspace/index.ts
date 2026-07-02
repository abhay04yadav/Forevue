export { ApprovalBar, type ApprovalBarProps } from "./ApprovalBar";
export { ArtifactDock, type ArtifactDockProps } from "./ArtifactDock";
export { ArtifactEditor, type ArtifactEditorProps } from "./Editor";
export { CommentsPanel, type CommentsPanelProps } from "./Comments";
export { ExportMenu, type ExportMenuProps } from "./ExportMenu";
export { MetadataPanel, type MetadataPanelProps } from "./Metadata";
export { OutlinePanel, type OutlinePanelProps } from "./Outline";
export { VersionHistory, type VersionHistoryProps } from "./VersionHistory";
export {
  MOCK_ARTIFACT,
  MOCK_CHART_BARS,
  MOCK_COMMENTS,
  MOCK_EXPORT_OPTIONS,
  MOCK_METADATA,
  MOCK_SECTIONS,
  MOCK_STATS,
  MOCK_TABLE,
  MOCK_VERSIONS,
  WORKFLOW_LABELS,
} from "./mock-data";
export type {
  ApprovalStep,
  ArtifactDockTab,
  ArtifactMeta,
  ArtifactSection,
  ArtifactSectionKind,
  CommentEntry,
  ExportOption,
  MetadataRow,
  OutlineItem,
  VersionEntry,
  WorkflowStage,
} from "./types";
export { artifactBreakpoints, useArtifactWorkspaceLayout } from "./useArtifactWorkspaceLayout";
