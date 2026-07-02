import { ChevronRight, MessageSquare, PanelLeft, PanelRight, BookOpen, Users, AlertTriangle, Calendar } from "lucide-react";
import * as React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { askQuestion } from "@/api/ai";
import { useAuth } from "@/auth";
import { useFacultyDashboard } from "@/hooks/useFacultyDashboard";
import {
  Composer,
  ContextDock,
  ConversationHistory,
  ConversationUI,
  MOCK_CAPABILITIES,
  MOCK_CONNECTED_TOOLS,
  MOCK_CONTEXT_ITEMS,
  MOCK_CONVERSATIONS,
  MOCK_MEMORY_ITEMS,
  MOCK_PROMPT_HISTORY,
  MOCK_SEEDED_TURNS,
  MOCK_SKILLS,
  MOCK_SLASH_COMMANDS,
  useAiWorkspaceLayout,
  useMockStreaming,
  type AiTurn,
  type ConversationItem,
  type ConversationTurn,
  type DockTab,
  type MemoryItem,
} from "@/layout/ai-workspace";
import { iconDefaults } from "@/design/tokens/icons";
import { cn } from "@/lib/utils";

/** AI Workspace page — mock conversation, streaming, and context dock */
export function AiWorkspacePage() {
  const layout = useAiWorkspaceLayout();
  const { user } = useAuth();
  const navigate = useNavigate();
  const facultyDash = useFacultyDashboard();
  const isFaculty = user?.role === "faculty";
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = React.useState<string | undefined>();
  const [conversations, setConversations] = React.useState(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = React.useState("c1");
  const [turns, setTurns] = React.useState<ConversationTurn[]>(isFaculty ? [] : MOCK_SEEDED_TURNS);
  const [composer, setComposer] = React.useState("");
  const [dockOpen, setDockOpen] = React.useState(layout.showContextDock);
  const [dockTab, setDockTab] = React.useState<DockTab>("context");
  const [memoryItems, setMemoryItems] = React.useState<MemoryItem[]>(MOCK_MEMORY_ITEMS);
  const [railOpen, setRailOpen] = React.useState(layout.showConversationRail);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const { stream, stop, isStreaming: mockStreaming } = useMockStreaming(setTurns);
  const [apiStreaming, setApiStreaming] = React.useState(false);
  const isStreaming = mockStreaming || apiStreaming;

  React.useEffect(() => {
    const prompt = searchParams.get("prompt");
    const context = searchParams.get("context");
    const coach = searchParams.get("coach");
    const assignmentId = searchParams.get("assignmentId");
    if (prompt) {
      setComposer(prompt);
    } else if (context === "assignment") {
      setComposer("Help me plan my next assignment submission.");
    } else if (context === "attendance") {
      setComposer("How is my attendance standing this term?");
    } else if (context === "career") {
      setComposer("What should I focus on for placement readiness?");
    } else if (coach === "attendance") {
      setComposer("Help me plan catch-up for subjects below the attendance line.");
    } else if (coach === "exam") {
      setComposer("Create a short revision plan for my weakest exam subject.");
    } else if (assignmentId) {
      setComposer("Help me make progress on this assignment without writing the submission for me.");
    }
  }, [searchParams]);

  const sendWithApi = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    if (isFaculty) {
      if (lower.includes("quiz") || lower.includes("question paper") || lower.includes("assessment")) {
        navigate("/create/assessment");
        return;
      }
      if (lower.includes("notice")) {
        navigate("/create/notice");
        return;
      }
      if (lower.includes("assignment")) {
        navigate("/create/assignment");
        return;
      }
    }

    setTurns((prev) => [...prev, { role: "user", id: `u-${Date.now()}`, text: trimmed }]);
    setApiStreaming(true);

    try {
      const res = await askQuestion({ question: trimmed, session_id: sessionId });
      setSessionId(res.session_id);

      const markdown = res.abstained
        ? "I don't have enough governed data in scope to answer that confidently."
        : res.narration ?? res.interpretation ?? "Here's what I found in your data.";

      const blocks: AiTurn["blocks"] = [
        { type: "text", markdown },
        ...(res.evidence_sources.length > 0
          ? [
              {
                type: "evidence" as const,
                confidence: "low" as const,
                updated: "just now",
                sources: res.evidence_sources.map((label) => ({ label })),
                reasoning: res.interpretation ? [res.interpretation] : [],
              },
            ]
          : []),
      ];

      setTurns((prev) => [
        ...prev,
        {
          role: "assistant",
          id: `a-${Date.now()}`,
          blocks,
          followups: [],
        },
      ]);
    } catch {
      if (!isFaculty) stream(trimmed);
      else {
        setTurns((prev) => [
          ...prev,
          {
            role: "assistant",
            id: `a-err-${Date.now()}`,
            blocks: [{ type: "text", markdown: "I could not reach the analytics service. Try again shortly." }],
            followups: [],
          },
        ]);
      }
    } finally {
      setApiStreaming(false);
    }
  };

  const send = () => {
    if (!composer.trim() || isStreaming) return;
    const text = composer;
    setComposer("");
    void sendWithApi(text);
  };

  React.useEffect(() => {
    setDockOpen(layout.showContextDock);
    setRailOpen(layout.showConversationRail);
  }, [layout.showContextDock, layout.showConversationRail]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns]);

  const activeConv =
    conversations.find((c) => c.id === activeConvId) ?? conversations[0];

  const handleApprove = (id: string) => {
    setTurns((prev) =>
      prev.map((turn) =>
        turn.role === "assistant"
          ? {
              ...turn,
              blocks: turn.blocks.map((block) =>
                block.type === "approval" && block.id === id
                  ? { ...block, status: "approved" as const }
                  : block,
              ),
            }
          : turn,
      ),
    );
  };

  const handleReject = (id: string) => {
    setTurns((prev) =>
      prev.map((turn) =>
        turn.role === "assistant"
          ? {
              ...turn,
              blocks: turn.blocks.map((block) =>
                block.type === "approval" && block.id === id
                  ? { ...block, status: "rejected" as const }
                  : block,
              ),
            }
          : turn,
      ),
    );
  };

  const newConversation = () => {
    const item: ConversationItem = {
      id: `c-${Date.now()}`,
      title: "New conversation",
      time: "Just now",
    };
    setConversations((prev) => [item, ...prev]);
    setActiveConvId(item.id);
    setTurns([]);
    setComposer("");
  };

  const facultyContextItems = React.useMemo(() => {
    if (!isFaculty || !facultyDash.data?.has_scope) return MOCK_CONTEXT_ITEMS;
    const d = facultyDash.data;
    return [
      { id: "courses", label: "Assigned courses", meta: `${d.course_progress.length} courses`, icon: BookOpen },
      { id: "students", label: "Students", meta: `${d.kpis.find((k) => k.id === "cohort")?.value ?? "—"} in scope`, icon: Users },
      { id: "attention", label: "Needs attention", meta: d.kpis.find((k) => k.id === "attention")?.value ?? "—", icon: AlertTriangle },
      { id: "term", label: "This term", meta: "Current semester", icon: Calendar },
    ];
  }, [isFaculty, facultyDash.data]);

  const facultyEmptyBrief =
    isFaculty && facultyDash.data?.has_scope
      ? facultyDash.data.daily_brief.text
      : undefined;

  return (
    <div className="-mx-6 -mt-6 flex h-[calc(100vh-52px)] min-h-0 overflow-hidden border-t border-[var(--border-subtle)]">
      {railOpen && layout.showConversationRail && (
        <ConversationHistory
          conversations={conversations}
          activeId={activeConvId}
          onSelect={setActiveConvId}
          onNew={newConversation}
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--surface-page)]">
        <header className="shrink-0 border-b border-[var(--border-subtle)] bg-[var(--surface-card)]">
          <div className="flex items-center gap-2.5 px-4 py-2.5">
            {layout.isMobile && (
              <button
                type="button"
                aria-label="Conversations"
                onClick={() => setRailOpen(true)}
                className="inline-flex size-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)]"
              >
                <MessageSquare size={17} strokeWidth={iconDefaults.strokeWidth} />
              </button>
            )}
            {!layout.isMobile && (
              <button
                type="button"
                aria-label="Toggle conversation list"
                onClick={() => setRailOpen((v) => !v)}
                className="inline-flex size-[34px] items-center justify-center rounded-[var(--radius-md)] border-none bg-transparent text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
              >
                <PanelLeft size={17} strokeWidth={iconDefaults.strokeWidth} />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1 text-[11.5px] text-[var(--text-muted)]"
              >
                <span>AI workspace</span>
                <ChevronRight size={12} strokeWidth={iconDefaults.strokeWidth} />
                <span className="text-[var(--text-body)]">{activeConv?.title}</span>
              </nav>
              <h1 className="m-0 truncate text-base font-bold tracking-tight text-[var(--text-strong)]">
                {activeConv?.title}
              </h1>
            </div>
            <button
              type="button"
              aria-label="Toggle context panel"
              onClick={() => setDockOpen((v) => !v)}
              className={cn(
                "inline-flex size-[34px] items-center justify-center rounded-[var(--radius-md)] border-none",
                dockOpen
                  ? "bg-[var(--color-teal-50)] text-[var(--color-deep-teal)]"
                  : "bg-transparent text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]",
              )}
            >
              <PanelRight size={17} strokeWidth={iconDefaults.strokeWidth} />
            </button>
          </div>
        </header>

        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          className="flex-1 overflow-y-auto"
        >
          <div className="mx-auto max-w-[780px] px-5 py-5">
            <ConversationUI
              turns={turns}
              emptyBrief={facultyEmptyBrief}
              suggestedPrompts={
                isFaculty
                  ? [
                      "Which students are below the attendance line?",
                      "Summarize watch-tier movement in my cohort",
                      "Draft a mentor check-in note",
                    ]
                  : undefined
              }
              onFollowup={(text) => {
                if (user?.role === "student") {
                  stream(text);
                  return;
                }
                void sendWithApi(text);
              }}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        </div>

        <div className="shrink-0 border-t border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3">
          <div className="mx-auto max-w-[780px]">
            <Composer
              value={composer}
              onChange={setComposer}
              onSend={send}
              onStop={stop}
              isStreaming={isStreaming}
              slashCommands={MOCK_SLASH_COMMANDS}
              promptHistory={MOCK_PROMPT_HISTORY}
            />
          </div>
        </div>
      </main>

      {dockOpen && (
        <ContextDock
          tab={dockTab}
          onTabChange={setDockTab}
          onClose={layout.isMobile ? () => setDockOpen(false) : undefined}
          contextItems={isFaculty ? facultyContextItems : MOCK_CONTEXT_ITEMS}
          capabilities={MOCK_CAPABILITIES}
          connectedTools={MOCK_CONNECTED_TOOLS}
          skills={MOCK_SKILLS}
          memoryItems={memoryItems}
          roleLabel="Faculty"
          onClearMemory={() => setMemoryItems([])}
          onForgetMemory={(id) => setMemoryItems((prev) => prev.filter((m) => m.id !== id))}
        />
      )}
    </div>
  );
}
