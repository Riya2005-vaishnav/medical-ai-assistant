import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Upload from "./Upload";
import Reports from "./Reports";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-500 hover:text-blue-600 transition mb-2"
          >
            ← Back to patients
          </button>
          <h1 className="text-2xl font-semibold text-slate-800">
            Patient #{id}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload a scan to generate a report and review previous reports.
          </p>
        </div>
      </div>

      {/* Upload section */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Upload Scan
        </h2>
        <Upload
          patientId={id}
          onUploaded={() => setRefreshKey((k) => k + 1)}
        />
      </section>

      {/* Reports section */}
      <section>
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Reports
        </h2>
        <Reports patientId={id} refreshKey={refreshKey} />
      </section>
    </div>
  );
}