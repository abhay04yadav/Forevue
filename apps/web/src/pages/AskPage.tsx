import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { isAxiosError } from "axios";

import { askQuestion, type AskResponse } from "../api/ai";
import { AskResultPanel } from "../copilot/AskResultPanel";
import { ErrorState } from "../design/States";

const SUGGESTIONS = [
  "How many students do we have by department?",
  "Show risk tier distribution",
  "What is the average risk score?",
  "How many students have attendance risk?",
];

const MAX_QUESTION_LENGTH = 2000;

interface Turn {
  id: string;
  question: string;
  response: AskResponse;
}

function turnId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AskPage() {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const askMutation = useMutation({
    mutationFn: (question: string) => askQuestion(question, sessionId),
    onSuccess: (response, question) => {
      setSessionId(response.session_id);
      setTurns((prev) => [...prev, { id: turnId(), question, response }]);
      setInput("");
      requestAnimationFrame(() => {
        threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    },
    onError: (error, question) => {
      if (isAxiosError(error) && error.response?.status === 403) {
        setFatalError("Your role cannot use the AI plane yet.");
        return;
      }
      const detail =
        isAxiosError(error) && typeof error.response?.data?.detail === "string"
          ? error.response.data.detail
          : "The AI service didn't respond. Try again in a moment.";
      setTurns((prev) => [
        ...prev,
        {
          id: turnId(),
          question,
          response: {
            abstained: true,
            interpretation: null,
            metric: null,
            columns: [],
            rows: [],
            narration: detail,
            cached: false,
          },
        },
      ]);
    },
  });

  const submit = useCallback(
    (raw?: string) => {
      const question = (raw ?? input).trim();
      if (!question || askMutation.isPending) return;
      if (question.length > MAX_QUESTION_LENGTH) return;
      setFatalError(null);
      askMutation.mutate(question);
    },
    [askMutation, input],
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  if (fatalError) {
    return (
      <div className="main-pad" style={{ padding: "30px 36px 60px", maxWidth: 880, width: "100%" }}>
        <ErrorState title="Ask isn't available" message={fatalError} />
      </div>
    );
  }

  return (
    <div className="main-pad" style={{ padding: "30px 36px 60px", maxWidth: 880, width: "100%" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", color: "#A2ACB8", marginBottom: 7 }}>
        COPILOT · GOVERNED SEMANTIC LAYER
      </div>
      <h1 style={{ margin: 0, fontSize: 25, fontWeight: 800, letterSpacing: "-.02em" }}>Ask Forevue</h1>
      <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#6B7686", fontWeight: 500, lineHeight: 1.5 }}>
        Plain-English questions over your institution's data — grounded, cited, and advisory.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 22 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, padding: "14px 16px" }}>
            <span
              aria-hidden
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "#E3F1F2",
                color: "#0A656D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flex: "none",
                marginBottom: 2,
              }}
            >
              ✦
            </span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your students, in plain English…"
              rows={1}
              maxLength={MAX_QUESTION_LENGTH}
              disabled={askMutation.isPending}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 15.5,
                lineHeight: 1.5,
                color: "#16202C",
                resize: "none",
                minHeight: 24,
                maxHeight: 120,
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={!input.trim() || askMutation.isPending}
              style={{ flex: "none", padding: "9px 16px" }}
            >
              {askMutation.isPending ? "Asking…" : "Ask"}
            </button>
          </div>

          {turns.length === 0 && !askMutation.isPending && (
            <div
              style={{
                borderTop: "1px solid #EDF1F4",
                padding: "12px 16px 14px",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submit(suggestion)}
                  style={{
                    fontSize: 13,
                    color: "#5A6573",
                    background: "#F8FAFB",
                    border: "1px solid #E1E7EC",
                    borderRadius: 999,
                    padding: "6px 12px",
                    fontWeight: 600,
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 20 }}>
        {turns.map((turn) => (
          <div key={turn.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  maxWidth: "85%",
                  background: "#E3F1F2",
                  color: "#0A3D42",
                  borderRadius: "14px 14px 4px 14px",
                  padding: "11px 15px",
                  fontSize: 14.5,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                {turn.question}
              </div>
            </div>
            <AskResultPanel response={turn.response} />
          </div>
        ))}

        {askMutation.isPending && (
          <div className="card" style={{ padding: "18px 22px", color: "#8A95A2", fontSize: 14, fontWeight: 500 }}>
            Grounding your question against governed data…
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      <div
        className="card"
        style={{
          marginTop: 28,
          padding: "14px 18px",
          background: "#FBF8F0",
          borderColor: "#E8DFC8",
        }}
      >
        <p style={{ margin: 0, fontSize: 13, color: "#6B5E3A", lineHeight: 1.55, fontWeight: 500 }}>
          <strong style={{ fontWeight: 700 }}>Advisory posture.</strong> Forevue surfaces and explains — it never
          writes back to your ERP or acts on its own. When the data cannot support an answer, it abstains rather
          than guessing.
        </p>
      </div>
    </div>
  );
}
