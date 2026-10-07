import React, { useEffect, useState } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";

export default function Patients() {
  const [patients, setPatients] = useState([]);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // -------------------------
  // Load Patients
  // -------------------------
  const load = async () => {
    try {
      const res = await API.get("/patients");
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load patients");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // -------------------------
  // Add Patient
  // -------------------------
  const add = async () => {
    if (!name || !age || !gender) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      await API.post("/patients", {
        name,
        age: parseInt(age),
        gender,
      });

      setName("");
      setAge("");
      setGender("");

      await load();
    } catch (err) {
      console.error(err);
      alert("Add patient failed");
    } finally {
      setLoading(false);
    }
  };

  // Search filter (frontend only)
  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Patients</h1>
        <p className="text-sm text-slate-500 mt-1">
          Add new patients and open their records and reports.
        </p>
      </div>

      {/* ADD PATIENT CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">
          Add Patient
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={inputClass}
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className={inputClass}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <button
            onClick={add}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 text-sm font-medium transition"
          >
            {loading ? "Adding..." : "+ Add Patient"}
          </button>
        </div>
      </div>

      {/* PATIENT LIST */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-800">
              All Patients
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {filtered.length}
            </span>
          </div>

          <input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 text-sm">
            No patients found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-blue-300 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold uppercase">
                    {p.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {p.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {p.age} yrs · {p.gender}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/patient/${p.id}`)}
                  className="shrink-0 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg px-3.5 py-2 text-sm font-medium transition"
                >
                  View →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}