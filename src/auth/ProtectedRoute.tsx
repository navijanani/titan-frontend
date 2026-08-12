import type { FC, ReactNode } from "react";
import { useAuth } from "./AuthContext";

type Props = { children: ReactNode; fallback?: FC };

export function ProtectedRoute({ children, fallback }: Props) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      const Fallback = fallback;
      return <Fallback />;
    }
    return <LoginRedirect />;
  }

  return <>{children}</>;
}

function LoginRedirect() {
  window.location.hash = "#login";
  return null;
}
