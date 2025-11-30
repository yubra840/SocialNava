// src/pages/Login.jsx
import React, { useState } from "react";
import { account } from "../../appwrite/config";
import "../Signup/signup.css";
import { useNavigate, Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
const [searchParams] = useSearchParams();
const redirectTo = searchParams.get("redirectTo") || "/";

  const validateEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const validatePassword = (value) => value.length >= 8;

  const formIsValid = () => {
    const validationErrors = {};

    if (!validateEmail(email)) validationErrors.email = "Enter a valid email.";
    if (!validatePassword(password))
      validationErrors.password = "Password must be at least 8 characters.";

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!formIsValid()) return;

    setBusy(true);

    try {
      // 1️⃣ Login the user
      await account.createEmailPasswordSession(email.trim(), password);

      // 2️⃣ Fetch logged-in user data (contains name/username)
      const userData = await account.get();

      // 3️⃣ Store username in localStorage (kept until user logs out)
      localStorage.setItem("currentUsername", userData.name);

      setMessage("Login successful! Redirecting...");

      // Clear inputs
      setEmail("");
      setPassword("");

      // 4️⃣ Navigate after short delay
setTimeout(() => {
        if (redirectTo.startsWith("/profile")) {
          // Always redirect with correct username
          navigate(`/profile/${userData.name}`);
        }else {
          navigate(redirectTo);
        }
      }, 1500);
    }catch (error) {
      console.error("Login error:", error);

      const friendlyMessage =
        error?.message ===
        "Invalid credentials. Please check the email and password."
          ? "Incorrect email or password."
          : error?.message || "Failed to log in.";

      setMessage(friendlyMessage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="signup-wrapper">
      <form className="signup-card" onSubmit={handleSubmit} noValidate>
        <h2>Login to your account</h2>

        {/* EMAIL */}
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => {
            if (!validateEmail(email))
              setErrors((prev) => ({ ...prev, email: "Enter a valid email." }));
            else
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.email;
                return newErrors;
              });
          }}
          required
        />
        {errors.email && <div className="error">{errors.email}</div>}

        {/* PASSWORD */}
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => {
            if (!validatePassword(password))
              setErrors((prev) => ({
                ...prev,
                password: "Password must be at least 8 characters.",
              }));
            else
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.password;
                return newErrors;
              });
          }}
          required
        />
        {errors.password && <div className="error">{errors.password}</div>}

        {/* LOGIN BUTTON */}
        <button
          className="btn"
          type="submit"
          disabled={
            busy || Object.keys(errors).length > 0 || !email || !password
          }
        >
          {busy ? "Logging in..." : "Login"}
        </button>

        {/* Message */}
        {message && <div className="message">{message}</div>}

        {/* SIGNUP LINK */}
        <p className="login-link">
          Don’t have an account?{" "}
          <Link to="/signup" className="link-text">
            Sign up
          </Link>
        </p>
          <Link to="/forgot-password" className="forget-password">Forgot Password?</Link>

      </form>
    </div>
  );
}

export default Login;
