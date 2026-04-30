import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Upload from "./Upload";
import Reports from "./Reports";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>

      <button onClick={() => navigate("/")}>
        ⬅ Back
      </button>

      <h2>Patient #{id}</h2>

      <Upload
        patientId={id}
        onUploaded={() => setRefreshKey(k => k + 1)}
      />

      <Reports
        patientId={id}
        refreshKey={refreshKey}
      />

    </div>
  );
}