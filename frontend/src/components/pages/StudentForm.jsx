import { useState, useEffect, useRef } from "react";
import { C, s } from "../../utils/theme";
import { Spinner } from "../ui";
import { getDropdownOptions } from "../../api/colleges";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const DEFAULT_SEAT_TYPES = ["GOPENS","GSCS","GSTS","GVJS","GNT1S","GNT2S","GNT3S","LOBCS","LOPENS","LSCS","LSTS","GOBCS","TFWS"];

// ── Searchable MultiSelect ────────────────────────────────────────────────────
function MultiSelect({ label, options = [], selected = [], onChange, placeholder = "Select…" }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const inputRef          = useRef(null);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const toggle = (val) =>
    onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const display =
    selected.length === 0 ? placeholder
    : selected.length <= 2 ? selected.join(", ")
    : `${selected.slice(0, 2).join(", ")} +${selected.length - 2} more`;

  return (
    <div style={{ position: "relative" }}>
      {label && <label style={s.label}>{label}</label>}

      <div
        onClick={handleOpen}
        style={{
          ...s.input, cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          color: selected.length ? C.text : "#64748b",
        }}
      >
        <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {display}
        </span>
        <span style={{ color: C.muted, fontSize: 11, marginLeft: 8, flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={() => { setOpen(false); setQuery(""); }} />
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: "#0d1829", border: `1px solid ${C.border}`, borderRadius: 10,
            zIndex: 10, boxShadow: "0 8px 32px #00000060",
            display: "flex", flexDirection: "column", maxHeight: 264,
          }}>

            {/* Search bar */}
            <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                style={{
                  width: "100%", background: "#0f172a",
                  border: `1px solid ${C.border}`, borderRadius: 7,
                  padding: "7px 10px", color: C.text, fontSize: 13,
                  outline: "none", fontFamily: "'Inter', sans-serif",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setOpen(false); setQuery(""); }
                  if (e.key === "Enter" && filtered.length === 1) toggle(filtered[0]);
                }}
              />
            </div>

            {/* Options */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "12px 16px", color: C.muted, fontSize: 13 }}>
                  No results for "{query}"
                </div>
              ) : filtered.map((opt) => {
                const active = selected.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => toggle(opt)}
                    style={{
                      padding: "9px 14px", cursor: "pointer", fontSize: 13,
                      display: "flex", alignItems: "center", gap: 10,
                      background: active ? "#f9731610" : "transparent",
                      color: active ? C.orange : C.text,
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#ffffff08"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = active ? "#f9731610" : "transparent"; }}
                  >
                    <span style={{
                      width: 15, height: 15, borderRadius: 4, flexShrink: 0,
                      border: `2px solid ${active ? C.orange : C.faint}`,
                      background: active ? C.orange : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {active && <span style={{ color: "#fff", fontSize: 9, fontWeight: 900 }}>✓</span>}
                    </span>

                    {/* Highlight matched text */}
                    {query.trim() ? (() => {
                      const idx = opt.toLowerCase().indexOf(query.toLowerCase());
                      if (idx === -1) return opt;
                      return (
                        <>
                          {opt.slice(0, idx)}
                          <mark style={{ background: "#f9731440", color: C.orange, borderRadius: 2, padding: "0 1px", fontWeight: 700 }}>
                            {opt.slice(idx, idx + query.length)}
                          </mark>
                          {opt.slice(idx + query.length)}
                        </>
                      );
                    })() : opt}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {selected.length > 0 && (
              <div style={{
                padding: "7px 14px", borderTop: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
              }}>
                <span style={{ fontSize: 11, color: C.muted }}>{selected.length} selected</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onChange([]); }}
                  style={{ background: "none", border: "none", color: "#f87171", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function StudentForm({ initial = null, onSave, onCancel, saving }) {
  const isEdit = !!initial;

  const blank = {
    name: "", percentile: "", rank: "", counselling_id: "",
    home_city: "", preferred_cities: [], preferred_branches: [],
    seat_types: [], gender: "Male", category_label: "",
    application_rank: "", mobile: "", notes: "",
  };

  const [form, setForm] = useState(() =>
    initial ? {
      name:               initial.name || "",
      percentile:         String(initial.percentile || ""),
      rank:               String(initial.rank || ""),
      counselling_id:     initial.counselling_id || "",
      home_city:          initial.home_city || "",
      preferred_cities:   initial.preferred_cities || [],
      preferred_branches: initial.preferred_branches || [],
      seat_types:         initial.seat_types || [],
      gender:             initial.gender || "Male",
      category_label:     initial.category_label || "",
      application_rank:   initial.application_rank || "",
      mobile:             initial.mobile || "",
      notes:              initial.notes || "",
    } : blank
  );

  const [options, setOptions]       = useState({ cities: [], branches: [], seat_types: DEFAULT_SEAT_TYPES });
  const [optLoading, setOptLoading] = useState(true);

  useEffect(() => {
    getDropdownOptions()
      .then((data) => setOptions({
        cities:     data.cities,
        branches:   data.branches,
        seat_types: data.seat_types.length ? data.seat_types : DEFAULT_SEAT_TYPES,
      }))
      .catch(() => {})
      .finally(() => setOptLoading(false));
  }, []);

  const set      = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setMulti = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const mobileValid = !form.mobile || /^[6-9]\d{9}$/.test(form.mobile);

  const handleSubmit = () => {
    if (!form.name.trim())       return alert("Student name is required.");
    if (!form.percentile)        return alert("Percentile is required.");
    if (!form.rank)              return alert("Rank is required.");
    if (!form.home_city.trim())  return alert("Home city is required.");
    if (!form.seat_types.length) return alert("Select at least one seat type.");
    if (!mobileValid)            return alert("Enter a valid 10-digit mobile number.");

    onSave({
      name:               form.name.trim(),
      percentile:         parseFloat(form.percentile),
      rank:               parseInt(form.rank, 10),
      counselling_id:     form.counselling_id.trim() || null,
      home_city:          form.home_city.trim(),
      preferred_cities:   form.preferred_cities,
      preferred_branches: form.preferred_branches,
      seat_types:         form.seat_types,
      gender:             form.gender,
      category_label:     form.category_label.trim() || null,
      application_rank:   form.application_rank.trim() || null,
      mobile:             form.mobile.trim() || null,
      notes:              form.notes.trim() || null,
    });
  };

  const inp = s.input;
  const sel = { ...s.input, cursor: "pointer" };

  return (
    <div>

      {/* ── Section 1: Basic Info ──────────────────────────────────────────── */}
      <p style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
        Basic Information
      </p>
      <div style={{ ...s.grid2, marginBottom: 28 }}>

        <div>
          <label style={s.label}>Full Name *</label>
          <input style={inp} placeholder="e.g. Rahul Sharma" value={form.name} onChange={set("name")} />
        </div>

        <div>
          <label style={s.label}>Counselling ID</label>
          <input style={inp} placeholder="e.g. CET24-001" value={form.counselling_id} onChange={set("counselling_id")} />
        </div>

        <div>
          <label style={s.label}>Percentile *</label>
          <input style={inp} type="number" step="0.0001" placeholder="e.g. 98.4550679" value={form.percentile} onChange={set("percentile")} />
        </div>

        <div>
          <label style={s.label}>CET Rank *</label>
          <input style={inp} type="number" placeholder="e.g. 312" value={form.rank} onChange={set("rank")} />
        </div>

        <div>
          <label style={s.label}>Gender</label>
          <select style={sel} value={form.gender} onChange={set("gender")}>
            {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label style={s.label}>Category Label</label>
          <input style={inp} placeholder="e.g. OPEN, OBC, SC, ST" value={form.category_label} onChange={set("category_label")} />
        </div>

        {/* ── New field 1: Application Rank ── */}
        {/* <div>
          <label style={s.label}>Application Rank</label>
          <input
            style={inp}
            type="number"
            placeholder="Rank as printed on form"
            value={form.application_rank}
            onChange={set("application_rank")}
          />
        </div> */}

        {/* ── New field 2: Mobile Number ── */}
        <div>
          <label style={s.label}>Mobile Number</label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
              color: C.muted, fontSize: 13, fontWeight: 600, pointerEvents: "none",
              borderRight: `1px solid ${C.border}`, paddingRight: 10,
            }}>
              +91
            </span>
            <input
              style={{ ...inp, paddingLeft: 52 }}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="9876543210"
              value={form.mobile}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                setForm((f) => ({ ...f, mobile: v }));
              }}
            />
          </div>
          {form.mobile && !mobileValid && (
            <p style={{ fontSize: 11, color: "#f87171", marginTop: 5, fontWeight: 500 }}>
              Must be 10 digits starting with 6–9
            </p>
          )}
        </div>

      </div>

      {/* ── Section 2: Location & Preferences ─────────────────────────────── */}
      <p style={{ fontSize: 11, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
        Location &amp; Preferences
      </p>
      <div style={{ ...s.grid2, marginBottom: 28 }}>

        <div>
          <label style={s.label}>Home City *</label>
          <input style={inp} placeholder="e.g. Pune" value={form.home_city} onChange={set("home_city")} />
        </div>

        <div>
          {optLoading ? <Spinner /> : (
            <MultiSelect
              label="Preferred Cities"
              options={options.cities}
              selected={form.preferred_cities}
              onChange={setMulti("preferred_cities")}
              placeholder="Select cities…"
            />
          )}
        </div>

        <div>
          {optLoading ? <Spinner /> : (
            <MultiSelect
              label="Preferred Branches"
              options={options.branches}
              selected={form.preferred_branches}
              onChange={setMulti("preferred_branches")}
              placeholder="Select branches…"
            />
          )}
        </div>

        <div>
          {optLoading ? <Spinner /> : (
            <MultiSelect
              label="Seat Types *"
              options={options.seat_types}
              selected={form.seat_types}
              onChange={setMulti("seat_types")}
              placeholder="Select seat types…"
            />
          )}
        </div>

      </div>

      {/* ── Notes ──────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <label style={s.label}>Notes (optional)</label>
        <textarea
          style={{ ...inp, minHeight: 72, resize: "vertical" }}
          placeholder="Any additional notes…"
          value={form.notes}
          onChange={set("notes")}
        />
      </div>

      {/* ── Actions ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={s.btnGhost} className="btn-ghost">Cancel</button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ ...s.btnOrange, opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}
          className="btn-orange"
        >
          {saving
            ? <><Spinner size={15} color="#fff" /> Saving…</>
            : isEdit ? "Update Student" : "Save Student"
          }
        </button>
      </div>

    </div>
  );
}