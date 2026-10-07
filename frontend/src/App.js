import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Patients from "./Patients";
import PatientDetail from "./PatientDetail";

function App() {
  const [logged, setLogged] = useState(!!localStorage.getItem("token"));
  const [isRegister, setIsRegister] = useState(false);

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

  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setLogged(false);
    setIsRegister(false);
  };

  // 🏥 MAIN APP
  return (
    <BrowserRouter>
      <div className="min-h-screen flex bg-slate-50">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col">
          <div className="px-6 py-5 border-b border-slate-800">
            <h1 className="text-xl font-semibold text-white">🏥 Medical AI</h1>
            <p className="text-xs text-slate-400 mt-1">Smart Healthcare System</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              Patients
            </NavLink>
          </nav>

          <div className="p-4 border-t border-slate-800 space-y-3">
            {role && (
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 capitalize">
                {role}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Patients />} />
              <Route path="/patient/:id" element={<PatientDetail />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;