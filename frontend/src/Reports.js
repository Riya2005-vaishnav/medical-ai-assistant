import React, { useEffect, useState } from "react";
import API from "./api";

const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8020";

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
      res.data.forEach((r) => {
        map[r.id] = r.final_report || "";
      });
      setEditMap(map);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) {
        alert("Failed to load reports");
      }
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
        final_report: editMap[id],
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
  // Download PDF (token sent in the header, not in the URL)
  // -----------------------
  const downloadPDF = async (id) => {
    try {
      const res = await API.get(`/reports/${id}/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      if (err.response?.status !== 401) {
        alert("PDF download failed ❌");
      }
    }
  };

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="space-y-5">
      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        </div>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          No reports yet. Upload a scan above to generate the first one.
        </div>
      )}

      {/* Report cards */}
      {reports.map((r) => (
        <div
          key={r.id}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-800">Report #{r.id}</h3>
            {r.final_report ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Reviewed
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                Awaiting doctor review
              </span>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image */}
            {r.image_path && (
              <div className="lg:col-span-1">
                <img
                  src={`${BASE_URL}/${r.image_path}`}
                  alt={`Scan for report ${r.id}`}
                  className="w-full rounded-lg border border-slate-200 bg-black object-contain max-h-80"
                />
              </div>
            )}

            {/* Text */}
            <div
              className={`space-y-5 ${
                r.image_path ? "lg:col-span-2" : "lg:col-span-3"
              }`}
            >
              {/* AI draft notice */}
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2">
                AI-generated draft. Must be reviewed by a qualified physician.
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Findings
                </h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {r.findings}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Impression
                </h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {r.impression}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Doctor Final Report
                </h4>
                <textarea
                  value={editMap[r.id] || ""}
                  onChange={(e) =>
                    setEditMap({
                      ...editMap,
                      [r.id]: e.target.value,
                    })
                  }
                  rows={4}
                  disabled={role !== "doctor"}
                  placeholder={
                    role === "doctor"
                      ? "Write or edit the final report here..."
                      : "Only a doctor can edit the final report"
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-1">
                {role === "doctor" && (
                  <button
                    onClick={() => saveFinal(r.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition"
                  >
                    Save Final Report
                  </button>
                )}

                <button
                  onClick={() => downloadPDF(r.id)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium transition"
                >
                  Download PDF
                </button>

                {role === "doctor" && (
                  <button
                    onClick={() => deleteReport(r.id)}
                    className="bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}