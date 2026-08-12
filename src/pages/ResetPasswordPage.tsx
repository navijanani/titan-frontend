import { useState, type FC, type FormEvent } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { resetPasswordApi } from "../auth/authApi";

export const ResetPasswordPage: FC = () => {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPasswordApi({ token, new_password: password });
      setMessage(res.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="Enter the token from your email and a new password">
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="msg error">{error}</div>}
        {message && <div className="msg success">{message} — <a href="#login">Sign in</a></div>}
        <div className="form-group">
          <label htmlFor="token">Reset token</label>
          <input
            id="token"
            type="text"
            className="form-input"
            placeholder="Paste your reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm">Confirm new password</label>
          <input
            id="confirm"
            type="password"
            className="form-input"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </div>
        <div className="auth-links">
          <a href="#login">Back to sign in</a>
        </div>
      </form>
    </AuthLayout>
  );
};
