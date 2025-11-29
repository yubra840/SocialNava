import React, { useState } from "react";
import { account } from "../../appwrite/config";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState(false); // NEW

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );

      setMsg("A password reset link has been sent to your email.");
      setError(false);   // success → green
    } catch (error) {
      setMsg("Failed to send reset link. Check your email address and try again.");
      setError(true);    // error → red
    }
  };

  return (
    <div className="forget-container">
      <form className="forget-box" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Send Reset Link</button>

        {msg && (
          <p className={`message ${error ? "error" : "success"}`}>
            {msg}
          </p>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
