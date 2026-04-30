import React, { useState } from "react";
import API from "./api";

export default function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const form = new URLSearchParams();
      form.append("grant_type", "password");
      form.append("username", email);
      form.append("password", password);

      const res = await API.post("/login", form, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const token = res.data.access_token;

      // ✅ Store token
      localStorage.setItem("token", token);

      // ✅ Decode role
      const payload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("role", payload.role);

      alert("Login success ✅");
      onLogin();

    } catch (err) {
      console.error(err);
      alert("Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* LEFT PANEL */}
      <div style={styles.left}>
        <h1 style={styles.logo}>🏥 Medical AI</h1>
        <p style={styles.subtitle}>
          Smart Radiology Assistant System
        </p>
      </div>

      {/* RIGHT LOGIN CARD */}
      <div style={styles.right}>
        <div style={styles.card}>

          <h2 style={styles.title}>Doctor Login</h2>

          <input
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button
            style={styles.button}
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* 🔥 REGISTER SWITCH */}
          <p style={styles.switchText}>
            Don’t have an account?{" "}
            <span style={styles.link} onClick={onSwitch}>
              Register
            </span>
          </p>

        </div>
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif"
  },

  left: {
    flex: 1,
    background: "linear-gradient(135deg, #0f4c81, #1976d2)",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },

  logo: {
    fontSize: "40px",
    marginBottom: "10px"
  },

  subtitle: {
    fontSize: "16px",
    opacity: 0.9
  },

  right: {
    flex: 1,
    background: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  card: {
    background: "white",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    width: "300px"
  },

  title: {
    marginBottom: "20px",
    textAlign: "center",
    color: "#333"
  },

  input: {
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "14px"
  },

  button: {
    padding: "12px",
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px"
  },

  switchText: {
    marginTop: "15px",
    textAlign: "center",
    fontSize: "14px"
  },

  link: {
    color: "#1976d2",
    cursor: "pointer",
    fontWeight: "bold"
  }
};