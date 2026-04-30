import React, { useEffect, useState } from "react";
import API from "./api";
import { useNavigate } from "react-router-dom";

export default function Patients() {
  const [patients, setPatients] = useState([]);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const [loading, setLoading] = useState(false);

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
        gender
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

  // -------------------------
  // UI
  // -------------------------
  return (
    <div>

      {/* 🔥 ADD PATIENT CARD */}
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: 20
        }}
      >
        <h2 style={{ marginBottom: 10 }}>➕ Add Patient</h2>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

          <input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc"
            }}
          />

          <input
            placeholder="Age"
            value={age}
            onChange={e => setAge(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc"
            }}
          />

          <input
            placeholder="Gender"
            value={gender}
            onChange={e => setGender(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={add}
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
            {loading ? "Adding..." : "Add"}
          </button>

        </div>
      </div>

      {/* 🔥 PATIENT LIST */}
      <h2 style={{ marginBottom: 10 }}>👤 Patients</h2>

      {patients.length === 0 && (
        <p>No patients found</p>
      )}

      {patients.map(p => (
        <div
          key={p.id}
          style={{
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: 10,
            padding: 15,
            marginBottom: 15,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >

          <div>
            <b style={{ fontSize: 16 }}>{p.name}</b>
            <div style={{ color: "#555" }}>
              Age: {p.age} | Gender: {p.gender}
            </div>
          </div>

          <button
            onClick={() => navigate(`/patient/${p.id}`)}
            style={{
              padding: "6px 14px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            View →
          </button>

        </div>
      ))}

    </div>
  );
}