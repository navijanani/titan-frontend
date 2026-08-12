import type { FC, ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export const AuthLayout: FC<Props> = ({ title, subtitle, children }) => (
  <div className="auth-page">
    <div className="auth-card">
      <div className="auth-header">
        <h1 className="auth-logo">Titan Studio</h1>
        <h2 className="auth-title">{title}</h2>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
      </div>
      {children}
    </div>
  </div>
);
