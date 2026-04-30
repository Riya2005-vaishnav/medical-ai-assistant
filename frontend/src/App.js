import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";   // ⭐ NEW
import Patients from "./Patients";
import PatientDetail from "./PatientDetail";

function App() {
  const [logged, setLogged] = useState(
    !!localStorage.getItem("token")
  );

  const [isRegister, setIsRegister] = useState(false); // ⭐ NEW

  // 🔐 AUTH SCREENS
  if (!logged) {
    return isRegister ? (
      <Register onSwitch={() => setIsRegister(false)} />
    ) : (
      <Login
        onLogin={() => setLogged(true)}
        onSwitch={() => setIsRegister(true)}
      />
    );
  }

  // 🏥 MAIN APP
  return (
    <BrowserRouter>
      <div
        style={{
          padding: 30,
          fontFamily: "Arial, sans-serif",
          background: "#f4f6f8",
          minHeight: "100vh"
        }}
      >

        {/* 🔥 HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20
          }}
        >
          <h1 style={{ margin: 0 }}>
            🏥 Medical AI Assistant
          </h1>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              setLogged(false);
              setIsRegister(false); // reset UI
            }}
            style={{
              padding: "8px 14px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Logout
          </button>
        </div>

        {/* 🔥 CONTENT BOX */}
        <div
          style={{
            background: "white",
            padding: 20,
            borderRadius: 10,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}
        >
          <Routes>
            <Route path="/" element={<Patients />} />
            <Route path="/patient/:id" element={<PatientDetail />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;