import type { LucideIcon } from "lucide-react";
import type * as React from "react";

export type ToolStepStatus = "pending" | "active" | "done";
export type ToolRunState = "running" | "done" | "error";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type EvidenceConfidence = "low" | "watch" | "high";
export type DockTab = "context" | "capabilities" | "tools" | "memory";

export interface ConversationItem {
  id: string;
  title: string;
  time: string;
  pinned?: boolean;
}

export interface ToolStep {
  id: string;
  label: string;
  status: ToolStepStatus;
  meta?: string;
}

export interface ToolRunBlock {
  type: "tool";
  title: string;
  state: ToolRunState;
  steps: ToolStep[];
}

export interface TextBlock {
  type: "text";
  markdown: string;
  streaming?: boolean;
}

export interface ThinkingBlock {
  type: "thinking";
}

export interface EvidenceSource {
  label: string;
  meta?: string;
}

export interface EvidenceBlock {
  type: "evidence";
  confidence: EvidenceConfidence;
  updated: string;
  sources: EvidenceSource[];
  reasoning: string[];
  expanded?: boolean;
}

export interface ApprovalChange {
  label: string;
  value: string;
}

export interface ApprovalBlock {
  type: "approval";
  id: string;
  title: string;
  summary: string;
  changes: ApprovalChange[];
  status: ApprovalStatus;
}

export type AiBlock =
  | ToolRunBlock
  | TextBlock
  | ThinkingBlock
  | EvidenceBlock
  | ApprovalBlock;

export interface UserTurn {
  role: "user";
  id: string;
  text: string;
}

export interface AiTurn {
  role: "assistant";
  id: string;
  blocks: AiBlock[];
  followups?: string[];
  streaming?: boolean;
}

export type ConversationTurn = UserTurn | AiTurn;

export interface MemoryItem {
  id: string;
  tag: string;
  text: string;
  tone?: "preference" | "context" | "temporary";
}

export interface ContextItem {
  id: string;
  label: string;
  meta: string;
  icon: LucideIcon;
  consentRequired?: boolean;
}

export interface PromptHistoryItem {
  id: string;
  text: string;
}

export interface SlashCommand {
  id: string;
  cmd: string;
  desc: string;
  icon: LucideIcon;
}

export interface CapabilityItem {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
  gated?: boolean;
}

export interface ConnectedTool {
  id: string;
  label: string;
  meta: string;
  icon: LucideIcon;
  status: "connected" | "degraded" | "offline";
}

export interface SkillItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export type StreamingPhase = "tools" | "thinking" | "text" | "done";

export interface StreamingState {
  phase: StreamingPhase;
  steps: ToolStep[];
  partialText?: string;
}
