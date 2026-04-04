import { useState } from "react";
import { C, s } from "../../utils/theme";

// ── Logo ──────────────────────────────────────────────────────────────────────
export function Logo({ size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28,
      background: C.orange, display: "flex", alignItems: "center",
      justifyContent: "center", boxShadow: "0 2px 12px #f9731640", flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.3, fontWeight: 900, color: "#fff" }}>MH</span>
    </div>
  );
}

// ── NavBar ────────────────────────────────────────────────────────────────────
export function NavBar({ user, links = [] }) {
  return (
    <nav style={s.nav}>
      <div style={s.navInner}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Logo />
          <div>
            <span style={{ fontWeight: 700, color: C.text, fontSize: 15 }}>MHTCET PLG</span>
            <span style={{ color: C.faint, fontSize: 11, marginLeft: 8 }}>Preference List Generator</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user && (
            <span style={{ color: C.muted, fontSize: 13 }}>
              Welcome, <strong style={{ color: C.orange }}>{user.full_name || user.username}</strong>
            </span>
          )}
          {links.map((l) => (
            <button key={l.label} onClick={l.onClick} style={{
              background: l.primary ? C.orange : "transparent",
              color: l.primary ? "#fff" : C.muted,
              border: l.primary ? "none" : `1px solid ${C.border}`,
              borderRadius: 8, padding: "7px 16px", fontSize: 13,
              fontWeight: 600, cursor: "pointer",
            }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = C.orange }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2px solid ${color}30`, borderTopColor: color,
      borderRadius: "50%", animation: "spin 0.7s linear infinite",
    }} />
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon = "📋", title, subtitle, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ color: C.text, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: action ? 24 : 0 }}>{subtitle}</p>
      {action && (
        <button onClick={action.onClick} style={s.btnOrange} className="btn-orange">
          {action.label}
        </button>
      )}
    </div>
  );
}

// ── MultiSelect dropdown ──────────────────────────────────────────────────────
export function MultiSelect({ label, options = [], selected = [], onChange, placeholder = "Select…" }) {
  const [open, setOpen] = useState(false);

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter((v) => v !== val));
    else onChange([...selected, val]);
  };

  const display = selected.length === 0
    ? placeholder
    : selected.length <= 2
      ? selected.join(", ")
      : `${selected.slice(0, 2).join(", ")} +${selected.length - 2} more`;

  return (
    <div style={{ position: "relative" }}>
      {label && <label style={s.label}>{label}</label>}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          ...s.input, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          color: selected.length ? C.text : "#64748b",
        }}
      >
        <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {display}
        </span>
        <span style={{ color: C.muted, fontSize: 12, marginLeft: 8, flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && (
        <>
          {/* Backdrop */}
          <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: "#0d1829", border: `1px solid ${C.border}`, borderRadius: 10,
            zIndex: 10, maxHeight: 220, overflowY: "auto",
            boxShadow: "0 8px 32px #00000060",
          }}>
            {options.length === 0 ? (
              <div style={{ padding: "12px 16px", color: C.muted, fontSize: 13 }}>No options</div>
            ) : options.map((opt) => {
              const active = selected.includes(opt);
              return (
                <div key={opt} onClick={() => toggle(opt)} style={{
                  padding: "10px 16px", cursor: "pointer", fontSize: 13,
                  display: "flex", alignItems: "center", gap: 10,
                  background: active ? "#f9731610" : "transparent",
                  color: active ? C.orange : C.text,
                  transition: "background .1s",
                }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#ffffff08"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${active ? C.orange : C.faint}`,
                    background: active ? C.orange : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {active && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
                  </span>
                  {opt}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── ConfirmModal ──────────────────────────────────────────────────────────────
export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000080",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: 32, maxWidth: 400, width: "90%",
      }}>
        <p style={{ color: C.text, fontSize: 16, fontWeight: 600, marginBottom: 24 }}>{message}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={s.btnGhost} className="btn-ghost">Cancel</button>
          <button onClick={onConfirm} style={s.btnDanger}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Tag badges for multi-selected values ──────────────────────────────────────
export function TagList({ items }) {
  if (!items?.length) return <span style={{ color: C.faint, fontSize: 12 }}>—</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {items.map((item) => (
        <span key={item} style={{
          ...s.badge, background: "#f9731615", color: C.orange,
          border: `1px solid #f9731625`,
        }}>
          {item}
        </span>
      ))}
    </div>
  );
}
