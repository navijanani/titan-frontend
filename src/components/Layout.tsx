import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <main className="app-shell">
      <h1>Titan Intelligence Engine</h1>
      {children}
    </main>
  );
}
