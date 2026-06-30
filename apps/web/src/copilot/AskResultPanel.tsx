import type { AskResponse } from "../api/ai";

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  return String(value);
}

function metricLabel(metric: string): string {
  return metric
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function AskResultPanel({ response }: { response: AskResponse }) {
  const hasTable = response.columns.length > 0 && response.rows.length > 0;

  return (
    <div className="card" style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".07em",
            textTransform: "uppercase",
            color: response.abstained ? "#8A6A22" : "#0A656D",
          }}
        >
          {response.abstained ? "Abstained" : "Answer"}
        </span>
        {response.metric && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#6B7686",
              background: "#F4F7F9",
              border: "1px solid #E1E7EC",
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            {metricLabel(response.metric)}
          </span>
        )}
        {response.cached && (
          <span style={{ fontSize: 11, color: "#9AA4B1", fontWeight: 600 }}>cached</span>
        )}
        {response.evidence_sources.length > 0 && (
          <span style={{ fontSize: 11, color: "#6B7686", fontWeight: 600 }}>
            · grounded on {response.evidence_sources.length} source
            {response.evidence_sources.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: "#16202C", fontWeight: 500 }}>
        {response.narration ?? "No narration returned."}
      </p>

      {hasTable && (
        <div style={{ marginTop: 18, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
            <thead>
              <tr>
                {response.columns.map((col) => (
                  <th
                    key={col}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderBottom: "2px solid #E1E7EC",
                      fontSize: 11.5,
                      fontWeight: 700,
                      letterSpacing: ".03em",
                      color: "#6B7686",
                      textTransform: "capitalize",
                    }}
                  >
                    {col.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {response.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {response.columns.map((col) => (
                    <td
                      key={col}
                      className="tnum"
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid #EDF1F4",
                        color: "#16202C",
                        fontWeight: 600,
                      }}
                    >
                      {formatCell(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {response.interpretation && (
        <div
          style={{
            marginTop: 16,
            padding: "10px 12px",
            background: "#F8FAFB",
            border: "1px solid #EDF1F4",
            borderRadius: 8,
            fontSize: 12.5,
            color: "#6B7686",
            lineHeight: 1.5,
          }}
        >
          <span style={{ fontWeight: 700, color: "#5A6573" }}>Grounded query · </span>
          {response.interpretation}
        </div>
      )}

      {response.evidence_sources.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {response.evidence_sources.map((source) => (
            <span
              key={source}
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "#5A6573",
                background: "#F4F7F9",
                border: "1px solid #E1E7EC",
                borderRadius: 6,
                padding: "3px 8px",
              }}
            >
              {source}
            </span>
          ))}
        </div>
      )}

      {!response.abstained && (
        <p style={{ margin: "14px 0 0", fontSize: 12, color: "#9AA4B1", fontWeight: 500, lineHeight: 1.5 }}>
          Advisory only — every figure traces to your governed data. You decide what to do next.
        </p>
      )}
    </div>
  );
}
