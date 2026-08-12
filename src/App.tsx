import { useState, useEffect, type FC } from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { WorkspaceProvider, useActiveWorkspace } from "./context/WorkspaceContext";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { CollectionsPage } from "./pages/CollectionsPage";
import { GraphExplorer } from "./pages/GraphExplorer";
import { MemoryExplorer } from "./pages/MemoryExplorer";
import { QueryPlayground } from "./pages/QueryPlayground";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { MetricsDashboard } from "./pages/MetricsDashboard";
import { SearchPage } from "./pages/SearchPage";
import { WorkspacesPage } from "./pages/WorkspacesPage";
import { WorkspaceHome } from "./pages/WorkspaceHome";
import { ProfilePage } from "./pages/ProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import type { StudioTab } from "./components/Sidebar";

const STUDIO_PAGES: Record<string, FC> = {
  dashboard: DashboardPage,
  documents: DocumentsPage,
  collections: CollectionsPage,
  graph: GraphExplorer,
  search: SearchPage,
  memory: MemoryExplorer,
  query: QueryPlayground,
  analytics: AnalyticsPage,
  metrics: MetricsDashboard,
  workspaces: WorkspacesPage,
  profile: ProfilePage,
};

type AuthRoute = "login" | "register" | "forgot-password" | "reset-password";

function StudioShell() {
  const { user, isLoading } = useAuth();
  const { activeWorkspaceId, setActiveWorkspaceId } = useActiveWorkspace();
  const [active, setActive] = useState<StudioTab>("workspaces");

  const syncFromHash = () => {
    const hash = window.location.hash.replace("#", "");
    if (hash && hash in STUDIO_PAGES) {
      setActive(hash as StudioTab);
      return;
    }
    setActive("workspaces");
  };

  // On mount, determine initial tab
  useEffect(() => {
    syncFromHash();
  }, []);

  useEffect(() => {
    const onHashChange = () => syncFromHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    window.location.hash = active === "workspaces" && activeWorkspaceId
      ? "#"
      : active === "workspaces"
      ? "#workspaces"
      : `#${active}`;
  }, [active, activeWorkspaceId]);

  // When clicking "workspaces" tab and there's an active workspace, show that workspace's home
  const handleTabSelect = (tab: StudioTab) => {
    if (tab === "workspaces" && activeWorkspaceId) {
      setActive("workspaces");
      return;
    }
    setActive(tab);
  };

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Loading Titan Studio…</p>
      </div>
    );
  }

  // If on workspaces tab and there's an active workspace, show the workspace home
  const showWorkspaceHome = active === "workspaces" && activeWorkspaceId;

  return (
    <div className="studio-shell">
      <Sidebar
        active={active}
        onSelect={handleTabSelect}
        userDisplayName={user?.display_name}
        userEmail={user?.email}
      />
      <main className="studio-content">
        {showWorkspaceHome ? (
          <WorkspaceHome />
        ) : active === "workspaces" ? (
          <WorkspacesPage />
        ) : (() => {
          const Page = STUDIO_PAGES[active];
          return Page ? <Page /> : <WorkspacesPage />;
        })()}
      </main>
    </div>
  );
}

function AuthShell() {
  const [route, setRoute] = useState<AuthRoute>(() => {
    const hash = window.location.hash.replace("#", "");
    if (["login", "register", "forgot-password", "reset-password"].includes(hash)) {
      return hash as AuthRoute;
    }
    return "login";
  });

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["login", "register", "forgot-password", "reset-password"].includes(hash)) {
        setRoute(hash as AuthRoute);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    window.location.hash = `#${route}`;
  }, [route]);

  switch (route) {
    case "register":
      return <RegisterPage />;
    case "forgot-password":
      return <ForgotPasswordPage />;
    case "reset-password":
      return <ResetPasswordPage />;
    default:
      return <LoginPage />;
  }
}

function Root() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <StudioShell />;
  }

  return <AuthShell />;
}

export function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <Root />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
