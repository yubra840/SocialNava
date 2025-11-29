import React, { useState } from "react";
import { account } from "../../appwrite/config";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const userId = params.get("userId");
  const secret = params.get("secret");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  // SAME VALIDATION HELPERS AS SIGNUP
  const validatePasswordStrength = (p) =>
    p.length >= 8 &&
    /[a-z]/.test(p) &&
    /[A-Z]/.test(p) &&
    /[0-9]/.test(p) &&
    /[^A-Za-z0-9]/.test(p);

  const formIsValid = () => {
    const e = {};

    if (!validatePasswordStrength(password))
      e.password =
        "Password must be ≥8 chars and include upper, lower, number and symbol.";

    if (password !== confirm)
      e.confirm = "Passwords do not match.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!formIsValid()) {
      setIsError(true);
      return;
    }

    try {
      await account.updateRecovery(userId, secret, password, confirm);
      setMsg("Password successfully reset! Redirecting...");
      setIsError(false);

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.log(error);
      setMsg("Failed to reset password.");
      setIsError(true);
    }
  };

  return (
    <div className="reset-container">
      <form className="reset-box" onSubmit={handleReset}>
        <h2>Set New Password</h2>

        {/* PASSWORD INPUT */}
        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => {
            if (!validatePasswordStrength(password))
              setErrors((p) => ({
                ...p,
                password:
                  "Password must be ≥8 chars and include upper, lower, number and symbol.",
              }));
            else
              setErrors((p) => {
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

        {/* CONFIRM PASSWORD INPUT */}
        <label>Confirm New Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          onBlur={() => {
            if (password !== confirm)
              setErrors((p) => ({
                ...p,
                confirm: "Passwords do not match.",
              }));
            else
              setErrors((p) => {
                const n = { ...p };
                delete n.confirm;
                return n;
              });
          }}
          required
        />
        {errors.confirm && <div className="error">{errors.confirm}</div>}

        <button type="submit">Reset Password</button>

        {msg && (
          <p className={`message ${isError ? "error" : "success"}`}>
            {msg}
          </p>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
