import { C, s } from "../../utils/theme";
import { useDraggableList } from "../../hooks/useDraggableList";

export default function CollegeList({ colleges, onExport, exporting }) {
  const drag = useDraggableList(colleges);

  const handleExport = () => {
    const ordered = drag.items.map((c, i) => ({
      sr_no: i + 1,
      college_code: c.college_code,
      college_name: c.college_name,
      branch_code: c.branch_code,
      branch_name: c.branch_name,
      city: c.city || "",
      category: c.seat_type,
      cutoff_percentile: c.cutoff_percentile,
      cutoff_rank: c.cutoff_rank,
    }));
    onExport(ordered);
  };

  if (drag.items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 24px", color: C.muted }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
        <p style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>No colleges found</p>
        <p style={{ fontSize: 13 }}>Try adjusting your percentile, seat types, or branch preferences.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <p style={{ color: C.muted, fontSize: 13 }}>
          <strong style={{ color: C.text }}>{drag.items.length}</strong> colleges found · Drag to reorder · Click ✕ to remove
        </p>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.muted }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "#34d39930", border: "1px solid #34d39960", display: "inline-block" }} />
            Safe (cutoff ≤ your percentile)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "#f9731920", border: "1px solid #f9731940", display: "inline-block" }} />
            Reach (cutoff &gt; your percentile)
          </span>
        </div>
      </div>

      {/* Header row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "40px 1fr 1fr 100px 90px 90px 32px",
        gap: 8, padding: "8px 14px",
        borderBottom: `1px solid ${C.border}`,
        fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        <span>#</span>
        <span>College</span>
        <span>Branch</span>
        <span>City</span>
        <span>Seat Type</span>
        <span>Cutoff %ile</span>
        <span></span>
      </div>

      {/* Draggable rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
        {drag.items.map((college, i) => {
          // We need to know the student's percentile to colour-code — passed via college.student_percentile
          const isReach = college.student_percentile && college.cutoff_percentile > college.student_percentile;
          return (
            <div
              key={`${college.college_code}-${college.branch_code}-${college.seat_type}-${i}`}
              draggable
              className="drag-item hover-orange"
              onDragStart={() => drag.onDragStart(i)}
              onDragOver={(e) => drag.onDragOver(e, i)}
              onDragEnd={drag.onDragEnd}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 1fr 100px 90px 90px 32px",
                gap: 8, alignItems: "center",
                background: isReach ? "#f9731908" : "#34d39908",
                border: `1px solid ${isReach ? "#f9731920" : "#34d39920"}`,
                borderRadius: 10, padding: "10px 14px",
                transition: "border-color .15s",
              }}
            >
              {/* Rank number */}
              <span style={{
                width: 28, height: 28, borderRadius: 7,
                background: "#f9731620", color: C.orange,
                fontSize: 11, fontWeight: 900,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>{i + 1}</span>

              {/* College */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {college.college_name}
                </div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{college.college_code}</div>
              </div>

              {/* Branch */}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {college.branch_name}
                </div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{college.branch_code}</div>
              </div>

              {/* City */}
              <span style={{ fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {college.city || "—"}
              </span>

              {/* Seat type */}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                background: "#ffffff10", color: C.muted, width: "fit-content",
              }}>
                {college.seat_type}
              </span>

              {/* Cutoff */}
              <span style={{ fontSize: 12, fontWeight: 700, color: isReach ? C.orange : C.emerald }}>
                {college.cutoff_percentile.toFixed(4)}
              </span>

              {/* Remove */}
              <button
                onClick={() => drag.removeItem(i)}
                style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, width: 28, height: 28 }}
                title="Remove"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* Export button */}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button
          onClick={handleExport}
          disabled={exporting || drag.items.length === 0}
          style={{ ...s.btnOrange, opacity: exporting ? 0.7 : 1, display: "flex", alignItems: "center", gap: 8 }}
          className="btn-orange"
        >
          {exporting
            ? <><span style={{ width: 16, height: 16, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Generating PDF…</>
            : "⬇ Export Preference List PDF"
          }
        </button>
      </div>
    </div>
  );
}
