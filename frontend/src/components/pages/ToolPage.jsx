import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { C, s } from "../../utils/theme";
import { NavBar, Spinner } from "../ui";
import StudentForm from "./StudentForm";
import CollegeList from "./CollegeList";
import { createStudent, updateStudent } from "../../api/students";
import { searchColleges } from "../../api/colleges";
import { exportPreferenceList } from "../../api/export";

// Steps: "form" → "list" → "done"
export default function ToolPage({ user, initialStudent = null, onBack, onLogout }) {
  const isEdit = !!initialStudent;

  const [step, setStep]           = useState("form"); // "form" | "list"
  const [student, setStudent]     = useState(initialStudent);
  const [colleges, setColleges]   = useState([]);
  const [saving, setSaving]       = useState(false);
  const [searching, setSearching] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported]   = useState(null); // { pdf_url }

  // If editing an existing student who already has a generated list, go straight to list step
  useEffect(() => {
    if (isEdit && initialStudent?.pdf_url) {
      // still start on form so they can tweak — just pre-fill
    }
  }, []);

  // ── Save student & fetch colleges ─────────────────────────────────────────
  const handleSaveStudent = async (formData) => {
    setSaving(true);
    try {
      let saved;
      if (isEdit && student?.id) {
        saved = await updateStudent(student.id, formData);
        toast.success("Student updated.");
      } else {
        saved = await createStudent(formData);
        toast.success("Student saved.");
      }
      setStudent(saved);

      // Auto-fetch colleges
      setSearching(true);
      try {
        const results = await searchColleges({
          percentile: saved.percentile,
          seatTypes: saved.seat_types,
          preferredCities: saved.preferred_cities,
          preferredBranches: saved.preferred_branches,
        });
        // Attach student percentile to each college for colour coding
        const tagged = results.map((c) => ({ ...c, student_percentile: saved.percentile }));
        setColleges(tagged);
        setStep("list");
        if (results.length === 0) {
          toast("No colleges found. Try relaxing your filters.", { icon: "ℹ️" });
        } else {
          toast.success(`${results.length} colleges found!`);
        }
      } catch {
        toast.error("Failed to fetch colleges.");
      } finally {
        setSearching(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save student.");
    } finally {
      setSaving(false);
    }
  };

  // ── Export PDF ────────────────────────────────────────────────────────────
  const handleExport = async (orderedList) => {
    if (!student?.id) { toast.error("Save student first."); return; }
    setExporting(true);
    try {
      const result = await exportPreferenceList(student.id, orderedList);
      setExported(result);

      // Auto-trigger download in browser
      const link = document.createElement("a");
      link.href = result.pdf_url;
      link.download = `${student.name.replace(/\s+/g, "_")}_preference_list.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("PDF exported and saved!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const navLinks = [
    { label: "← My Students", onClick: onBack },
    { label: "Logout", onClick: onLogout },
  ];

  return (
    <div style={s.page}>
      <NavBar user={user} links={navLinks} />
      <div style={s.main}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: "-0.3px" }}>
            {isEdit ? `Edit: ${initialStudent.name}` : "New Student"}
          </h1>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            {step === "form"
              ? "Fill student details, then save to auto-generate the college list"
              : "Drag to reorder, remove unwanted colleges, then export the PDF"}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
          {[
            { key: "form", label: "1. Student Details" },
            { key: "list", label: "2. Preference List" },
          ].map(({ key, label }) => (
            <div
              key={key}
              onClick={() => { if (key === "form" || (key === "list" && student)) setStep(key); }}
              style={{
                flex: 1, padding: "12px 20px", textAlign: "center",
                background: step === key ? C.orange : C.surface,
                color: step === key ? "#fff" : C.muted,
                fontSize: 13, fontWeight: 700,
                cursor: key === "list" && !student ? "not-allowed" : "pointer",
                transition: "background .2s",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Step 1: Student Form */}
        {step === "form" && (
          <div style={s.card}>
            <div style={s.cardHdr}>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Student Details</h2>
                <p style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                  Saving will automatically search matching colleges
                </p>
              </div>
              {(saving || searching) && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.muted, fontSize: 13 }}>
                  <Spinner size={14} />
                  {saving ? "Saving…" : "Searching colleges…"}
                </div>
              )}
            </div>
            <div style={s.cardBody}>
              <StudentForm
                initial={student}
                onSave={handleSaveStudent}
                onCancel={onBack}
                saving={saving || searching}
              />
            </div>
          </div>
        )}

        {/* Step 2: College List */}
        {step === "list" && (
          <>
            {/* Student summary bar */}
            {student && (
              <div style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: "14px 20px",
                display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20,
                alignItems: "center",
              }}>
                <span style={{ fontWeight: 700, color: C.text }}>{student.name}</span>
                {[
                  { label: "Percentile", value: student.percentile?.toFixed(4), color: C.emerald },
                  { label: "Rank",       value: `#${student.rank?.toLocaleString()}`, color: C.orange },
                  { label: "Gender",     value: student.gender },
                  { label: "Category",   value: student.category_label || student.seat_types?.[0] },
                ].map(({ label, value, color }) => value ? (
                  <span key={label} style={{ fontSize: 13, color: C.muted }}>
                    {label}:{" "}
                    <strong style={{ color: color || C.text }}>{value}</strong>
                  </span>
                ) : null)}
                <button
                  onClick={() => setStep("form")}
                  style={{ marginLeft: "auto", background: "none", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  ← Edit Details
                </button>
              </div>
            )}

            {/* Exported banner */}
            {exported && (
              <div style={{
                background: "#34d39915", border: "1px solid #34d39930",
                borderRadius: 12, padding: "14px 20px", marginBottom: 20,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ color: C.emerald, fontWeight: 600, fontSize: 14 }}>
                  ✓ PDF generated and saved to cloud
                </span>
                <a
                  href={exported.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: C.emerald, fontWeight: 700, fontSize: 13, textDecoration: "none", background: "#34d39920", padding: "6px 14px", borderRadius: 8 }}
                >
                  ↓ Download Again
                </a>
              </div>
            )}

            <div style={s.card}>
              <div style={s.cardHdr}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Preference List</h2>
                  <p style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                    Showing colleges within ±5 percentile of student · Sorted by best cutoff
                  </p>
                </div>
              </div>
              <div style={s.cardBody}>
                <CollegeList
                  colleges={colleges}
                  onExport={handleExport}
                  exporting={exporting}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
