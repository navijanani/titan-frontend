import { useState, type FC, type FormEvent } from "react";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../auth/AuthContext";

export const LoginPage: FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password, remember_me: true });
      window.location.hash = "#";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in to your account" subtitle="Enter your credentials to access Titan Studio">
      <form onSubmit={handleSubmit} className="auth-form">
        {error && <div className="msg error">{error}</div>}
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
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
        <div className="auth-links">
          <a href="#forgot-password">Forgot password?</a>
          <a href="#register">Create an account</a>
        </div>
      </form>
    </AuthLayout>
  );
};
