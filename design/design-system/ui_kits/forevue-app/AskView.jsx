// Forevue — Ask view. Plain-English query → grounded answer with evidence + a human-owned draft.
const { useState: useAskState } = React;

function AskView() {
  const { Card, Button, EvidenceCite, RiskMarker, Callout, ConsentTag, DataStat } = window.ForevueDesignSystem_24f415;
  const [asked, setAsked] = useAskState(true);
  const [query, setQuery] = useAskState("Which students in CSE-3 are slipping, and why?");

  const suggestions = [
    "Who is at risk in first-year ECE this week?",
    "Show fee defaulters with low attendance",
    "What evidence supports the NAAC criteria 2 report?",
  ];

  const students = [
    { name: "A. Sharma", roll: "21CSE-014", tier: "high", reason: "Attendance 58% · 2 internals missed", minor: false },
    { name: "P. Nair", roll: "21CSE-027", tier: "high", reason: "Attendance 61% · fees overdue", minor: true },
    { name: "S. Iqbal", roll: "21CSE-031", tier: "watch", reason: "Marks down 14% since wk 4", minor: false },
  ];

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Ask bar */}
      <Card padding="none" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
          <i data-lucide="sparkles" style={{ width: 19, height: 19, color: "var(--color-deep-teal)", flex: "none" }}></i>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setAsked(true); }}
            placeholder="Ask anything about your students, in plain English…"
            style={{
              flex: 1, border: "none", outline: "none", background: "transparent",
              fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--text-strong)",
            }}
          />
          <Button variant="primary" onClick={() => setAsked(true)} iconRight={<i data-lucide="arrow-up" style={{ width: 16, height: 16 }}></i>}>
            Ask
          </Button>
        </div>
        {!asked && (
          <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => { setQuery(s); setAsked(true); }} style={{
                fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-neutral-700)",
                background: "var(--color-neutral-50)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-pill)", padding: "6px 12px", cursor: "pointer",
              }}>{s}</button>
            ))}
          </div>
        )}
      </Card>

      {asked && (
        <>
          {/* Answer */}
          <Card padding="lg">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "var(--tracking-eyebrow)", textTransform: "uppercase",
                color: "var(--color-deep-teal)",
              }}>Answer</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>· grounded on 3 sources</span>
            </div>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--text-strong)" }}>
              Three students in CSE-3 have slipped below the attendance line this week, and two of them
              also have internals missing. Here's who, and what each is based on.
            </p>

            <div style={{ display: "flex", gap: 28, margin: "18px 0 6px" }}>
              <DataStat label="Below the line" value="3" delta="1" deltaDir="down" sub="vs last week" />
              <DataStat label="Avg. attendance" value="60%" sub="CSE-3 watchlist" />
              <DataStat label="Earliest signal" value="wk 4" sub="marks dip" />
            </div>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column" }}>
              {students.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "12px 0",
                  borderTop: "1px solid var(--border-subtle)",
                }}>
                  <RiskMarker tier={s.tier} size="sm" />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-strong)" }}>{s.name}</span>
                      <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{s.roll}</span>
                      {s.minor && <ConsentTag state="required" size="sm" />}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-body)", marginTop: 2 }}>{s.reason}</div>
                  </div>
                  <Button variant="secondary" size="sm">Open</Button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <EvidenceCite
                label="Based on"
                sources={[
                  { label: "Attendance register", meta: "wk 6–9" },
                  { label: "Internal marks", meta: "CSE-3" },
                  { label: "Fee status", meta: "Apr" },
                ]}
                onOpen={() => {}}
              />
            </div>
          </Card>

          {/* Draft */}
          <Callout tone="draft" title="Draft — for you to review" icon={<i data-lucide="pencil-line"></i>}>
            A short note to the three students' mentor, naming each student and the specific signal.
            Nothing is sent and nothing is written back to the ERP until you approve it.
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <Button variant="primary" size="sm">Review draft</Button>
              <Button variant="ghost" size="sm">Discard</Button>
            </div>
          </Callout>
        </>
      )}
    </div>
  );
}

Object.assign(window, { AskView });
