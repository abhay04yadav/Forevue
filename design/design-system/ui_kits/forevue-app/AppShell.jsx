// Forevue product app — shell (sidebar + topbar). Cool neutral, calm, utilitarian.
const { useState } = React;

function NavItem({ icon, label, active, count, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        padding: "9px 11px", border: "none", borderRadius: "var(--radius-md)",
        background: active ? "var(--color-teal-50)" : "transparent",
        color: active ? "var(--color-deep-teal)" : "var(--color-neutral-700)",
        fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: active ? 600 : 500,
        cursor: "pointer", textAlign: "left", transition: "background var(--duration-fast) var(--ease-standard)",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--color-neutral-100)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <i data-lucide={icon} style={{ width: 17, height: 17, flex: "none" }}></i>
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && (
        <span style={{
          fontVariantNumeric: "tabular-nums", fontSize: 12, fontWeight: 600,
          color: active ? "var(--color-deep-teal)" : "var(--color-neutral-500)",
          background: active ? "#fff" : "var(--color-neutral-100)",
          borderRadius: 999, padding: "1px 8px",
        }}>{count}</span>
      )}
    </button>
  );
}

function AppShell({ nav, active, onNav, title, subtitle, actions, children }) {
  return (
    <div style={{ display: "flex", height: "100%", background: "var(--surface-page)", fontFamily: "var(--font-sans)" }}>
      {/* Sidebar */}
      <aside style={{
        width: "var(--app-sidebar)", flex: "none", background: "#fff",
        borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column",
        padding: "16px 12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 8px 18px" }}>
          <img src="../../assets/forevue-icon-on-light.svg" alt="" style={{ width: 26, height: 26 }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color-ink)", letterSpacing: "-0.01em" }}>
            Forevue
          </span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {nav.map((n) => (
            <NavItem key={n.id} {...n} active={active === n.id} onClick={() => onNav(n.id)} />
          ))}
        </nav>
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          <NavItem icon="settings" label="Settings" />
          <div style={{
            display: "flex", alignItems: "center", gap: 9, padding: "10px 8px 2px",
            borderTop: "1px solid var(--border-subtle)", marginTop: 8,
          }}>
            <span style={{
              width: 30, height: 30, borderRadius: "50%", background: "var(--color-teal-600)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, flex: "none",
            }}>RM</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>R. Menon</div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Dean, Academics</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{
          display: "flex", alignItems: "center", gap: 16, padding: "16px 28px",
          borderBottom: "1px solid var(--border-subtle)", background: "#fff",
        }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600, color: "var(--text-strong)", letterSpacing: "-0.01em" }}>{title}</h1>
            {subtitle && <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-muted)" }}>{subtitle}</p>}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>{actions}</div>
        </header>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>{children}</div>
      </main>
    </div>
  );
}

Object.assign(window, { AppShell, NavItem });
