import type { LucideIcon } from "lucide-react";
import type * as React from "react";

export type WorkflowStage = "draft" | "review" | "approved" | "published";

export type ArtifactSectionKind = "text" | "stats" | "table" | "chart";

export interface ArtifactMeta {
  id: string;
  name: string;
  type: string;
  approver: string;
  version: string;
  updated: string;
  sensitivity: string;
  owner: string;
  department: string;
}

export interface ArtifactSection {
  id: string;
  title: string;
  kind: ArtifactSectionKind;
  aiGenerated?: boolean;
  markdown?: string;
  hasComment?: boolean;
  hasErpAction?: boolean;
}

export interface OutlineItem {
  id: string;
  title: string;
  aiGenerated?: boolean;
  hasComment?: boolean;
  active?: boolean;
}

export interface VersionEntry {
  id: string;
  label: string;
  tag: string;
  tagTone: "ai" | "human" | "approved";
  who: string;
  time: string;
  note: string;
  restorable?: boolean;
}

export interface CommentEntry {
  id: string;
  initials: string;
  name: string;
  time: string;
  body: string;
  resolved?: boolean;
  avatarTone?: "teal" | "deep" | "neutral";
}

export interface MetadataRow {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  variant?: "text" | "tag";
  tagColor?: string;
  tagBg?: string;
}

export interface ExportOption {
  id: string;
  label: string;
  ext: string;
  icon: LucideIcon;
}

export type ArtifactDockTab = "comments" | "versions" | "metadata";

export interface ApprovalStep {
  id: WorkflowStage;
  label: string;
  status: "done" | "current" | "upcoming";
}
