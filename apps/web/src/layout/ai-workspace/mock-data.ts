import {
  BarChart3,
  BookOpen,
  CheckCheck,
  ClipboardList,
  FileEdit,
  Folder,
  Search,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import type {
  AiTurn,
  CapabilityItem,
  ConnectedTool,
  ContextItem,
  ConversationItem,
  ConversationTurn,
  MemoryItem,
  PromptHistoryItem,
  SkillItem,
  SlashCommand,
} from "./types";

export const MOCK_CONVERSATIONS: ConversationItem[] = [
  { id: "c1", title: "Sections slipping this week", time: "Active now", pinned: true },
  { id: "c2", title: "Attendance trend — CSE-3", time: "2h ago" },
  { id: "c3", title: "Draft mentor note", time: "Yesterday" },
  { id: "c4", title: "Compare sections, last term", time: "3 days ago" },
];

export const MOCK_PROMPT_HISTORY: PromptHistoryItem[] = [
  { id: "ph1", text: "Which of my sections are slipping this week, and why?" },
  { id: "ph2", text: "Draft a check-in note for CSE-3" },
  { id: "ph3", text: "Show attendance by week for CSE-3" },
];

export const MOCK_SLASH_COMMANDS: SlashCommand[] = [
  { id: "sc1", cmd: "/summarize", desc: "Summarize the current view", icon: Sparkles },
  { id: "sc2", cmd: "/draft", desc: "Draft an update or note", icon: FileEdit },
  { id: "sc3", cmd: "/evidence", desc: "Show sources for the last answer", icon: Shield },
  { id: "sc4", cmd: "/compare", desc: "Compare with a prior period", icon: BarChart3 },
];

export const MOCK_CONTEXT_ITEMS: ContextItem[] = [
  { id: "ctx1", label: "Assigned courses", meta: "3 sections · CSE", icon: BookOpen },
  { id: "ctx2", label: "Students", meta: "96 in scope", icon: Users, consentRequired: true },
  { id: "ctx3", label: "Department", meta: "Computer Science", icon: Folder },
  { id: "ctx4", label: "This term", meta: "Semester 4", icon: ClipboardList },
];

export const MOCK_CAPABILITIES: CapabilityItem[] = [
  { id: "cap1", label: "Summarize view", desc: "Grounded summary of records in scope", icon: Sparkles },
  { id: "cap2", label: "Draft update", desc: "Compose a note you own and approve", icon: FileEdit },
  { id: "cap3", label: "Run analysis", desc: "Compare trends across sections", icon: BarChart3 },
  { id: "cap4", label: "Write to ERP", desc: "Propose changes — always gated", icon: Zap, gated: true },
];

export const MOCK_CONNECTED_TOOLS: ConnectedTool[] = [
  { id: "t1", label: "ERP records", meta: "Read · scoped", icon: Folder, status: "connected" },
  { id: "t2", label: "Attendance register", meta: "Read · this term", icon: CheckCheck, status: "connected" },
  { id: "t3", label: "Internal marks", meta: "Read · Sem 4", icon: BarChart3, status: "degraded" },
  { id: "t4", label: "Messaging", meta: "Draft only", icon: FileEdit, status: "connected" },
];

export const MOCK_SKILLS: SkillItem[] = [
  { id: "sk1", label: "Attendance", icon: CheckCheck },
  { id: "sk2", label: "Risk flags", icon: Shield },
  { id: "sk3", label: "Drafting", icon: FileEdit },
  { id: "sk4", label: "Compare", icon: BarChart3 },
  { id: "sk5", label: "Search", icon: Search },
  { id: "sk6", label: "Summarize", icon: Sparkles },
];

export const MOCK_MEMORY_ITEMS: MemoryItem[] = [
  {
    id: "m1",
    tag: "Preference",
    text: "Prefers concise summaries with a table when comparing sections.",
    tone: "preference",
  },
  {
    id: "m2",
    tag: "Context",
    text: "Usually reviews CSE-3 first when attendance dips after mid-sem break.",
    tone: "context",
  },
  {
    id: "m3",
    tag: "Temporary",
    text: "Asked about mentor check-in drafts for two flagged students.",
    tone: "temporary",
  },
];

export const MOCK_SEEDED_TURNS: ConversationTurn[] = [
  {
    role: "user",
    id: "u1",
    text: "Which of my sections are slipping this week, and why?",
  },
  {
    role: "assistant",
    id: "a1",
    followups: ["Draft a check-in note to the mentor", "Compare with last term", "Show attendance by week"],
    blocks: [
      {
        type: "tool",
        title: "Resolved across the systems you run",
        state: "done",
        steps: [
          { id: "s1", label: "Reading ERP — section roster", status: "done", meta: "3 sections" },
          { id: "s2", label: "Fetching attendance register", status: "done", meta: "wk 6–9" },
          { id: "s3", label: "Fetching internal marks", status: "done", meta: "Sem 4" },
          { id: "s4", label: "Running analysis", status: "done", meta: "96 students" },
        ],
      },
      {
        type: "text",
        markdown:
          "Two of your three sections held steady. **CSE-3 is slipping** — attendance fell after the mid-sem break and two students are now below the line. Here is who, and what it is based on.",
      },
      {
        type: "evidence",
        confidence: "watch",
        updated: "12 min ago",
        sources: [
          { label: "Attendance register", meta: "wk 6–9" },
          { label: "Internal marks" },
          { label: "Section roster" },
        ],
        reasoning: [
          "Compared weekly attendance for each section against the section baseline.",
          "Flagged students who crossed below the attendance line in the last two weeks.",
          "Cross-checked against internal marks; abstained where data was incomplete.",
        ],
      },
      {
        type: "approval",
        id: "ap1",
        title: "Send check-in note to mentor",
        summary:
          "This would notify the section mentor with the draft above. Forevue will not send it on its own.",
        changes: [
          { label: "Recipient", value: "Section mentor · CSE-3" },
          { label: "Channel", value: "In-app + email" },
        ],
        status: "pending",
      },
    ],
  },
];

export function buildMockAnswerTurn(isDraft: boolean): AiTurn {
  if (isDraft) {
    return {
      role: "assistant",
      id: `a-${Date.now()}`,
      followups: ["Change the tone", "Add attendance figures"],
      blocks: [
        {
          type: "tool",
          title: "Preparing a draft",
          state: "done",
          steps: [
            { id: "d1", label: "Reading ERP — mentor + student", status: "done", meta: "CSE-3" },
            { id: "d2", label: "Fetching attendance context", status: "done", meta: "wk 6–9" },
            { id: "d3", label: "Composing draft", status: "done" },
          ],
        },
        {
          type: "text",
          markdown:
            "I have prepared a draft mentor note for the two CSE-3 students below the line. It is a **draft you own** — review it in the artifact, and nothing is sent until you approve.",
        },
        {
          type: "approval",
          id: `ap-${Date.now()}`,
          title: "Send check-in note to mentor",
          summary:
            "This would notify the section mentor with the draft above. Forevue will not send it on its own.",
          changes: [
            { label: "Recipient", value: "Section mentor · CSE-3" },
            { label: "Channel", value: "In-app + email" },
          ],
          status: "pending",
        },
        {
          type: "evidence",
          confidence: "low",
          updated: "just now",
          sources: [{ label: "Attendance register", meta: "wk 6–9" }, { label: "Mentor directory" }],
          reasoning: [
            "Drafted from the two flagged students and their recent attendance.",
            "Held back any figure that was not directly supported.",
          ],
        },
      ],
    };
  }

  return {
    role: "assistant",
    id: `a-${Date.now()}`,
    followups: ["Show the evidence", "Compare with last term"],
    blocks: [
      {
        type: "tool",
        title: "Resolved across the systems you run",
        state: "done",
        steps: [
          { id: "s1", label: "Reading ERP", status: "done" },
          { id: "s2", label: "Fetching data in scope", status: "done" },
          { id: "s3", label: "Running analysis", status: "done" },
        ],
      },
      {
        type: "text",
        markdown:
          "Here is what I found, scoped to this view. Activity is steady overall, with a small number of items that may need attention. This is advisory — nothing is written back until you approve it.",
      },
      {
        type: "evidence",
        confidence: "watch",
        updated: "just now",
        sources: [{ label: "Records in scope" }, { label: "Selected period" }],
        reasoning: [
          "Summarised the records currently in context.",
          "Abstained on anything not directly supported by the data.",
        ],
      },
    ],
  };
}
