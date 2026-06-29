// Forevue — Student view. Evidence on the table; the why behind a risk tier. Dignity, not labels.
function StudentView() {
  const { Card, CardHeader, Button, RiskMarker, ConsentTag, EvidenceCite, Callout, Badge } = window.ForevueDesignSystem_24f415;

  const signals = [
    { label: "Attendance", value: "61%", note: "below the 65% line · 4 weeks running", tier: "high", icon: "calendar-x" },
    { label: "Internal marks", value: "−18%", note: "vs personal baseline since wk 4", tier: "watch", icon: "trending-down" },
    { label: "Fees", value: "Overdue", note: "₹42,000 · since 12 Apr", tier: "watch", icon: "receipt" },
    { label: "Library / LMS", value: "Active", note: "no drop in engagement", tier: "low", icon: "book-open" },
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header card */}
      <Card padding="lg">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <span style={{
            width: 52, height: 52, borderRadius: "50%", background: "var(--color-teal-600)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 19, fontWeight: 700, flex: "none",
          }}>PN</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "var(--text-strong)" }}>P. Nair</h2>
              <RiskMarker tier="high" />
              <ConsentTag state="required" />
            </div>
            <div style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              21CSE-027 · Computer Science, Semester 3 · Mentor: Dr. Rao
            </div>
          </div>
          <Button variant="primary" iconLeft={<i data-lucide="message-square" style={{ width: 16, height: 16 }}></i>}>
            Draft outreach
          </Button>
        </div>
      </Card>

      {/* Why this tier */}
      <Card padding="lg">
        <CardHeader eyebrow="Why high risk" title="Three signals line up" />
        <p style={{ margin: "0 0 4px", fontSize: 15, lineHeight: 1.6, color: "var(--text-body)" }}>
          Attendance has been below the line for four weeks while internal marks fell from a steady baseline,
          and fees are overdue. Engagement on the LMS is still healthy — so this reads as a support need, not disengagement.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
          {signals.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 11, padding: 14,
              background: "var(--color-neutral-50)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
            }}>
              <i data-lucide={s.icon} style={{ width: 18, height: 18, color: "var(--color-neutral-600)", flex: "none", marginTop: 2 }}></i>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-strong)" }}>{s.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: "var(--color-deep-teal)" }}>{s.value}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.45 }}>{s.note}</div>
                <div style={{ marginTop: 8 }}><RiskMarker tier={s.tier} variant="glyph" size="sm" /></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <EvidenceCite
            label="Drawn from"
            sources={[
              { label: "Attendance register" },
              { label: "Internal marks" },
              { label: "Fee ledger" },
              { label: "LMS activity" },
            ]}
            onOpen={() => {}}
          />
        </div>
      </Card>

      <Callout tone="info" icon={<i data-lucide="info"></i>}>
        Forevue surfaces and shows the evidence. The decision — and the conversation with P. Nair — stays with the mentor.
      </Callout>
    </div>
  );
}

Object.assign(window, { StudentView });
