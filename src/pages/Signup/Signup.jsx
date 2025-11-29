// src/pages/Signup.jsx
import React, { useState } from "react";
import { account, databases, ID } from "../../appwrite/config";
import "./signup.css";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // Validation helpers
  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  const validateUsername = (u) => /^[a-zA-Z0-9_.-]{3,20}$/.test(u.trim());
  const validatePasswordStrength = (p) =>
    p.length >= 8 &&
    /[a-z]/.test(p) &&
    /[A-Z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[^A-Za-z0-9]/.test(p);

  const formIsValid = () => {
    const e = {};
    if (!validateEmail(email)) e.email = "Enter a valid email.";
    if (!validateUsername(username))
      e.username =
        "Username: 3–20 chars, letters/numbers and ._- allowed.";
    if (!validatePasswordStrength(password))
      e.password =
        "Password must be ≥8 chars and include upper, lower, number and symbol.";
    if (password !== confirm) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    if (!formIsValid()) return;

    setBusy(true);
    try {
      // Create Appwrite account
      const created = await account.create({
        userId: ID.unique(),
        email: email.trim(),
        password,
        name: username.trim(),
      });

      // Optional: Create profile document
      const DB = import.meta.env.VITE_APPWRITE_DATABASE_ID;
      const USERS_COL = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

      if (DB && USERS_COL) {
        await databases.createDocument(DB, USERS_COL, created.$id, {
          username: username.trim(),
          email: email.trim(),
          createdAt: new Date().toISOString(),
        });
      }

      // Success message
      setMessage("Account created successfully! Redirecting to login...");

      // Clear inputs
      setEmail("");
      setUsername("");
      setPassword("");
      setConfirm("");

      // Redirect after short delay (e.g. 2.5 seconds)
      setTimeout(() => {
        navigate("/login");
      }, 1700);
    } catch (err) {
      console.error("Signup error", err);
      const friendly = err?.message || "Failed to create account.";
      setMessage(friendly);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="signup-wrapper">
      <form className="signup-card" onSubmit={handleSubmit} noValidate>
        <h2>Create an account</h2>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => {
            if (!validateEmail(email))
              setErrors((p) => ({ ...p, email: "Enter a valid email." }));
            else setErrors((p) => {
              const n = { ...p };
              delete n.email;
              return n;
            });
          }}
          required
        />
        {errors.email && <div className="error">{errors.email}</div>}

        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onBlur={() => {
            if (!validateUsername(username))
              setErrors((p) => ({
                ...p,
                username: "3–20 chars: letters, numbers, . _ -",
              }));
            else setErrors((p) => {
              const n = { ...p };
              delete n.username;
              return n;
            });
          }}
          required
        />
        {errors.username && <div className="error">{errors.username}</div>}

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => {
            if (!validatePasswordStrength(password))
              setErrors((p) => ({
                ...p,
                password:
                  "Password must be ≥8 chars and include upper, lower, number and symbol.",
              }));
            else setErrors((p) => {
              const n = { ...p };
              delete n.password;
              return n;
            });
          }}
          required
        />
        <small className="hint">
          At least 8 characters, includes uppercase, lowercase, number & symbol.
        </small>
        {errors.password && <div className="error">{errors.password}</div>}

        <label>Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => {
            if (password !== confirm)
              setErrors((p) => ({
                ...p,
                confirm: "Passwords do not match.",
              }));
            else setErrors((p) => {
              const n = { ...p };
              delete n.confirm;
              return n;
            });
          }}
          required
        />
        {errors.confirm && <div className="error">{errors.confirm}</div>}

        <button
          className="btn"
          type="submit"
          disabled={
            busy ||
            Object.keys(errors).length > 0 ||
            !email ||
            !username ||
            !password ||
            !confirm
          }
        >
          {busy ? "Creating account..." : "Sign up"}
        </button>

        {message && <div className="message">{message}</div>}

        <p className="login-link">
          Already have an account?{" "}
          <Link to="/login" className="link-text">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
