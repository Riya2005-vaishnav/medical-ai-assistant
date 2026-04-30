import React, { useState } from "react";
import API from "./api";

export default function Upload({ patientId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!file) {
      alert("Select file first");
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);

      await API.post(`/upload-image/${patientId}`, form, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Upload + AI report created ✅");

      setFile(null);

      if (onUploaded) {
        onUploaded();
      }

    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "white",
        padding: 15,
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginTop: 15
      }}
    >

      <h3 style={{ marginBottom: 10 }}>📤 Upload X-ray / Image</h3>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          style={{
            padding: 6,
            border: "1px solid #ccc",
            borderRadius: 6
          }}
        />

        <button
          onClick={send}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

      </div>

      {/* ✅ Show selected file */}
      {file && (
        <p style={{ marginTop: 10, color: "#555" }}>
          Selected: {file.name}
        </p>
      )}

    </div>
  );
}