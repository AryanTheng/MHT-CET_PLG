// ── Design tokens ─────────────────────────────────────────────────────────────
export const C = {
  bg:      "#020817",
  surface: "#0f172a",
  surfaceHover: "#131f35",
  border:  "#1e293b",
  input:   "#1e293b",
  orange:  "#f97316",
  orangeDim:"#f9731620",
  text:    "#f8fafc",
  muted:   "#94a3b8",
  faint:   "#475569",
  emerald: "#34d399",
  red:     "#f87171",
};

export const s = {
  page:       { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" },
  nav:        { borderBottom: `1px solid ${C.border}`, background: "#0f172acc", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 20 },
  navInner:   { maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  main:       { maxWidth: 1200, margin: "0 auto", padding: "36px 24px" },
  card:       { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 24 },
  cardHdr:    { padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardBody:   { padding: 24 },
  input:      { width: "100%", background: C.input, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none" },
  label:      { display: "block", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  btnOrange:  { background: C.orange, color: "#fff", fontWeight: 700, border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 14, cursor: "pointer", boxShadow: "0 4px 20px #f9731630", transition: "opacity .15s" },
  btnGhost:   { background: "transparent", color: C.text, fontWeight: 600, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 22px", fontSize: 14, cursor: "pointer", transition: "border-color .15s" },
  btnDanger:  { background: "#f8717120", color: C.red, fontWeight: 600, border: `1px solid #f8717130`, borderRadius: 10, padding: "10px 22px", fontSize: 14, cursor: "pointer" },
  badge:      { borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700 },
  grid2:      { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 },
};

export const GLOBAL_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #020817; }
  input::placeholder, select option { color: #64748b; }
  input:focus, select:focus { outline: 2px solid #f97316 !important; outline-offset: 0; }
  select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px !important; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #0f172a; }
  ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
  .drag-item { cursor: grab; user-select: none; }
  .drag-item:active { cursor: grabbing; }
  .hover-orange:hover { border-color: #f9731660 !important; }
  .btn-orange:hover { opacity: 0.88; }
  .btn-ghost:hover { border-color: #f9731660 !important; }
`;
