import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

type WorkspaceContextValue = {
  activeWorkspaceId: number | null;
  setActiveWorkspaceId: (id: number | null) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem("active_workspace_id");
    return stored ? parseInt(stored, 10) : null;
  });

  const setActiveWorkspaceId = useCallback((id: number | null) => {
    setActiveWorkspaceIdState(id);
    if (id) {
      localStorage.setItem("active_workspace_id", String(id));
    } else {
      localStorage.removeItem("active_workspace_id");
    }
  }, []);

  return (
    <WorkspaceContext.Provider value={{ activeWorkspaceId, setActiveWorkspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useActiveWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useActiveWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
