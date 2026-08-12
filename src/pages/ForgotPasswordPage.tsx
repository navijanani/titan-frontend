import { useState, type FC, type FormEvent } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { forgotPasswordApi } from "../auth/authApi";

export const ForgotPasswordPage: FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await forgotPasswordApi({ email });
      setMessage(res.token ? `Reset token (dev): ${res.token}` : res.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="Enter your email to receive a reset link">
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="msg error">{error}</div>}
        {message && <div className="msg success">{message}</div>}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </div>
        <div className="auth-links">
          <a href="#login">Back to sign in</a>
        </div>
      </form>
    </AuthLayout>
  );
};
