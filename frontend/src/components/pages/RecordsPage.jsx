import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { C, s } from "../../utils/theme";
import { NavBar, Spinner, EmptyState, TagList, ConfirmModal } from "../ui";

export default function RecordsPage({ user, onNewStudent, onEditStudent, onLogout }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [confirm, setConfirm]   = useState(null); // { id, name }

  useEffect(() => {
    import("../../api/students").then(({ listStudents }) =>
      listStudents()
        .then(setStudents)
        .catch(() => toast.error("Failed to load students."))
        .finally(() => setLoading(false))
    );
  }, []);

  const handleDelete = async (id) => {
    try {
      await import("../../api/students").then(({ deleteStudent }) => deleteStudent(id));
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success("Student deleted.");
    } catch {
      toast.error("Delete failed.");
    } finally {
      setConfirm(null);
    }
  };

  const navLinks = [
    { label: "+ New Student", onClick: onNewStudent, primary: true },
    { label: "Logout", onClick: onLogout },
  ];

  return (
    <div style={s.page}>
      <NavBar user={user} links={navLinks} />
      <div style={s.main}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: "-0.3px" }}>My Students</h1>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>
            All preference lists generated under your account
          </p>
        </div>

        {/* Stats row */}
        {!loading && students.length > 0 && (
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { label: "Total Students", value: students.length },
              { label: "Lists Exported", value: students.filter((s) => s.pdf_url).length },
              { label: "Pending Export",  value: students.filter((s) => !s.pdf_url).length },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: "16px 24px", flex: "1 1 140px",
              }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.orange }}>{value}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Table card */}
        <div style={s.card}>
          <div style={s.cardHdr}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: C.text }}>Student Records</h2>
              <p style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Click a student to edit or generate their preference list</p>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
              <Spinner size={32} />
            </div>
          ) : students.length === 0 ? (
            <EmptyState
              icon="🎓"
              title="No students yet"
              subtitle="Create your first student to get started"
              action={{ label: "+ New Student", onClick: onNewStudent }}
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Name", "Percentile", "Rank", "Home City", "Preferred Branches", "Seat Types", "Date", "PDF", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => (
                    <tr
                      key={student.id}
                      style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : "#ffffff03" }}
                    >
                      <td style={{ padding: "13px 16px", fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>
                        {student.name}
                      </td>
                      <td style={{ padding: "13px 16px", color: "#34d399", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {student.percentile.toFixed(4)}
                      </td>
                      <td style={{ padding: "13px 16px", color: C.orange, fontWeight: 700, whiteSpace: "nowrap" }}>
                        #{student.rank.toLocaleString()}
                      </td>
                      <td style={{ padding: "13px 16px", color: C.muted, whiteSpace: "nowrap" }}>
                        {student.home_city}
                      </td>
                      <td style={{ padding: "13px 16px", maxWidth: 200 }}>
                        <TagList items={student.preferred_branches?.slice(0, 3)} />
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <TagList items={student.seat_types?.slice(0, 2)} />
                      </td>
                      <td style={{ padding: "13px 16px", color: C.faint, fontSize: 12, whiteSpace: "nowrap" }}>
                        {new Date(student.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                        {student.pdf_url ? (
                          <a
                            href={student.pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: C.emerald, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                          >
                            ↓ Download
                          </a>
                        ) : (
                          <span style={{ color: C.faint, fontSize: 12 }}>Not generated</span>
                        )}
                      </td>
                      <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => onEditStudent(student)}
                            style={{ background: "none", border: "none", color: C.orange, fontWeight: 600, fontSize: 12, cursor: "pointer", padding: "4px 8px", borderRadius: 6, background: "#f9731615" }}
                          >
                            Edit / Generate
                          </button>
                          <button
                            onClick={() => setConfirm({ id: student.id, name: student.name })}
                            style={{ background: "none", border: "none", color: C.red, fontWeight: 600, fontSize: 12, cursor: "pointer", padding: "4px 8px", borderRadius: 6, background: "#f8717115" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {confirm && (
        <ConfirmModal
          message={`Delete "${confirm.name}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
