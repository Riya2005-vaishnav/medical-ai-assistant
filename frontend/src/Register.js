import React, { useState } from "react";
import API from "./api";

export default function Register({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor");

  const submit = async () => {
    try {
      await API.post("/register", {
        email,
        password,
        role
      });

      alert("Account created ✅");
      onSwitch(); // go to login

    } catch (err) {
      console.error(err);
      alert("Register failed ❌");
    }
  };

  return (
    <div style={styles.container}>

      {/* LEFT PANEL */}
      <div style={styles.left}>
        <h1 style={styles.logo}>🏥 Medical AI</h1>
        <p>Join the Smart Healthcare System</p>
      </div>

      {/* RIGHT CARD */}
      <div style={styles.right}>
        <div style={styles.card}>

          <h2>Create Account</h2>

          <input
            style={styles.input}
            placeholder="Email"
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

          {/* ROLE SELECT */}
          <select
            style={styles.input}
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>

          <button style={styles.button} onClick={submit}>
            Register
          </button>

          <p style={{ marginTop: 10 }}>
            Already have an account?{" "}
            <span
              style={styles.link}
              onClick={onSwitch}
            >
              Login
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
    height: "100vh"
  },
  left: {
    flex: 1,
    background: "linear-gradient(135deg, #0f4c81, #1976d2)",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column"
  },
  logo: {
    fontSize: "36px"
  },
  right: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8"
  },
  card: {
    background: "white",
    padding: 30,
    borderRadius: 10,
    width: 300
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: 10,
    background: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: 6
  },
  link: {
    color: "#1976d2",
    cursor: "pointer",
    fontWeight: "bold"
  }
};