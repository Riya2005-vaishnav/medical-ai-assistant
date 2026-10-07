import React, { useState } from "react";
import API from "./api";

export default function Upload({ patientId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", text: string }

  const send = async () => {
    if (!file) {
      setStatus({ type: "error", text: "Select a file first" });
      return;
    }

    const form = new FormData();
    form.append("file", file);

    try {
      setLoading(true);
      setStatus(null);

      await API.post(`/upload-image/${patientId}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus({ type: "success", text: "Upload complete. AI report created." });
      setFile(null);

      if (onUploaded) {
        onUploaded();
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <label
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
          file
            ? "border-blue-400 bg-blue-50"
            : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            setFile(e.target.files[0] || null);
            setStatus(null);
          }}
        />

        {file ? (
          <>
            <img
              src={URL.createObjectURL(file)}
              alt="Selected scan preview"
              className="max-h-56 rounded-lg shadow-sm mb-3"
            />
            <p className="text-sm font-medium text-slate-700">{file.name}</p>
            <p className="text-xs text-slate-500 mt-1">Click to choose a different image</p>
          </>
        ) : (
          <>
            <p className="text-slate-700 font-medium">
              Click to select an X-ray or scan image
            </p>
            <p className="text-xs text-slate-400 mt-1">PNG or JPG</p>
          </>
        )}
      </label>

      {/* Upload button */}
      <button
        onClick={send}
        disabled={!file || loading}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg px-6 py-2.5 text-sm font-medium transition"
      >
        {loading ? "Uploading and generating report..." : "Upload & Generate Report"}
      </button>

      {/* Status message */}
      {status && (
        <div
          className={`text-sm rounded-lg px-4 py-3 ${
            status.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {status.text}
        </div>
      )}
    </div>
  );
}