import React, { useEffect, useState } from "react";
import API from "./api";

export default function Reports({ patientId, refreshKey }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMap, setEditMap] = useState({});

  const role = localStorage.getItem("role");

  // -----------------------
  // Load Reports
  // -----------------------
  const load = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/patients/${patientId}/reports`);
      setReports(res.data);

      const map = {};
      res.data.forEach(r => {
        map[r.id] = r.final_report || "";
      });
      setEditMap(map);

    } catch (err) {
      console.error(err);
      alert("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, refreshKey]);

  // -----------------------
  // Save Final Report
  // -----------------------
  const saveFinal = async (id) => {
    try {
      await API.put(`/reports/${id}/final`, {
        final_report: editMap[id]
      });

      alert("Final report saved ✅");
      load();

    } catch (err) {
      console.error(err);
      alert("Save failed ❌");
    }
  };

  // -----------------------
  // Delete Report
  // -----------------------
  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;

    try {
      await API.delete(`/reports/${id}`);
      alert("Deleted ✅");
      load();
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    }
  };

  // -----------------------
  // Download PDF
  // -----------------------
  

  const downloadPDF = (id) => {
  const token = localStorage.getItem("token");

  window.open(
    `http://127.0.0.1:8020/reports/${id}/pdf?token=${token}`,
    "_blank"
  );
};

  // -----------------------
  // UI
  // -----------------------
  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 10 }}>📊 Reports</h3>

      {loading && <p>Loading reports...</p>}

      {!loading && reports.length === 0 && (
        <p>No reports yet</p>
      )}

      {reports.map(r => (
        <div
          key={r.id}
          style={{
            background: "white",
            padding: 18,
            marginBottom: 15,
            borderRadius: 12,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}
        >

          <h4 style={{ marginBottom: 8 }}>
            📝 Report #{r.id}
          </h4>

          {/* 🖼 IMAGE */}
          {r.image_path && (
            <img
              src={`http://127.0.0.1:8020/${r.image_path}`}
              alt="report"
              style={{
                width: 220,
                borderRadius: 8,
                marginBottom: 10
              }}
            />
          )}

          {/* 📌 FINDINGS */}
          <div style={{ marginBottom: 10 }}>
            <strong>Findings:</strong>
            <p style={{ whiteSpace: "pre-line", marginTop: 4 }}>
              {r.findings}
            </p>
          </div>

          {/* 📌 IMPRESSION */}
          <div style={{ marginBottom: 10 }}>
            <strong>Impression:</strong>
            <p style={{ whiteSpace: "pre-line", marginTop: 4 }}>
              {r.impression}
            </p>
          </div>

          {/* 🩺 FINAL REPORT */}
          <div style={{ marginBottom: 6 }}>
            <strong>Doctor Final Report:</strong>
          </div>

          <textarea
            value={editMap[r.id] || ""}
            onChange={e =>
              setEditMap({
                ...editMap,
                [r.id]: e.target.value
              })
            }
            rows={4}
            disabled={role !== "doctor"}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ccc",
              marginBottom: 10
            }}
          />

          {/* 🔘 ACTION BUTTONS */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

            {role === "doctor" && (
              <button
                onClick={() => saveFinal(r.id)}
                style={{
                  padding: "6px 14px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                Save
              </button>
            )}

            <button
              onClick={() => downloadPDF(r.id)}
              style={{
                padding: "6px 14px",
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              📥 PDF
            </button>

            <button
              onClick={() => deleteReport(r.id)}
              style={{
                padding: "6px 14px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              Delete
            </button>

          </div>

        </div>
      ))}

    </div>
  );
}