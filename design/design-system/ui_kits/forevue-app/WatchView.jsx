// Forevue — Watchlist view. Students who need attention. Risk = colour + shape + label.
const { useState: useWatchState } = React;

function WatchView() {
  const { Card, Tabs, Tag, Button, IconButton, RiskMarker, ConsentTag } = window.ForevueDesignSystem_24f415;
  const [tab, setTab] = useWatchState("watch");

  const rows = [
    { name: "P. Nair", roll: "21CSE-027", dept: "CSE-3", tier: "high", att: "61%", marks: "−18%", fees: "Overdue", minor: true },
    { name: "A. Sharma", roll: "21CSE-014", dept: "CSE-3", tier: "high", att: "58%", marks: "−9%", fees: "Clear", minor: false },
    { name: "S. Iqbal", roll: "21CSE-031", dept: "CSE-3", tier: "watch", att: "72%", marks: "−14%", fees: "Clear", minor: false },
    { name: "M. Reddy", roll: "21ECE-008", dept: "ECE-1", tier: "watch", att: "75%", marks: "−6%", fees: "Partial", minor: true },
    { name: "K. Bose", roll: "20CSE-112", dept: "CSE-5", tier: "low", att: "88%", marks: "+2%", fees: "Clear", minor: false },
  ];

  const th = { textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", padding: "0 14px 10px" };
  const td = { fontSize: 14, color: "var(--text-body)", padding: "13px 14px", borderTop: "1px solid var(--border-subtle)", fontVariantNumeric: "tabular-nums" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Tag onRemove={() => {}}>CSE-3</Tag>
        <Tag onRemove={() => {}}>This week</Tag>
        <Button variant="ghost" size="sm" iconLeft={<i data-lucide="plus" style={{ width: 15, height: 15 }}></i>}>Add filter</Button>
      </div>

      <Card padding="none" style={{ overflow: "hidden" }}>
        <div style={{ padding: "6px 14px 0" }}>
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { id: "watch", label: "Needs attention", count: 18 },
              { id: "all", label: "All students", count: 1240 },
              { id: "minors", label: "Consent-gated", count: 213 },
            ]}
          />
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", padding: "0 4px" }}>
          <thead>
            <tr>
              <th style={{ ...th, paddingTop: 14 }}>Student</th>
              <th style={{ ...th, paddingTop: 14 }}>Dept</th>
              <th style={{ ...th, paddingTop: 14 }}>Risk</th>
              <th style={{ ...th, paddingTop: 14 }}>Attendance</th>
              <th style={{ ...th, paddingTop: 14 }}>Marks Δ</th>
              <th style={{ ...th, paddingTop: 14 }}>Fees</th>
              <th style={{ ...th, paddingTop: 14, width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{r.name}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: 12.5 }}>{r.roll}</span>
                    {r.minor && <ConsentTag state="required" size="sm" />}
                  </div>
                </td>
                <td style={td}>{r.dept}</td>
                <td style={td}><RiskMarker tier={r.tier} size="sm" /></td>
                <td style={{ ...td, color: parseInt(r.att) < 65 ? "var(--color-risk-high)" : "var(--text-body)", fontWeight: parseInt(r.att) < 65 ? 600 : 400 }}>{r.att}</td>
                <td style={{ ...td, color: r.marks.startsWith("−") ? "var(--color-risk-high)" : "var(--color-risk-low)" }}>{r.marks}</td>
                <td style={td}>{r.fees}</td>
                <td style={td}><IconButton aria-label="Open"><i data-lucide="chevron-right" style={{ width: 16, height: 16 }}></i></IconButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

Object.assign(window, { WatchView });
