import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, AuthState } from "../types/auth";
import { loginApi, registerApi, logoutApi, getMeApi, refreshTokenApi } from "./authApi";
import type { LoginRequest, RegisterRequest } from "../types/auth";

type AuthContextValue = AuthState & {
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadTokens(): { token: string | null; refreshToken: string | null } {
  return {
    token: localStorage.getItem("access_token"),
    refreshToken: localStorage.getItem("refresh_token"),
  };
}

function saveTokens(access: string, refresh: string | null) {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({ ...prev, user, isAuthenticated: !!user }));
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    }
    clearTokens();
    setState({ user: null, token: null, refreshToken: null, isLoading: false, isAuthenticated: false });
  }, []);

  const login = useCallback(async (req: LoginRequest) => {
    const res = await loginApi(req);
    saveTokens(res.access_token, res.refresh_token);
    setState({ user: res.user, token: res.access_token, refreshToken: res.refresh_token, isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (req: RegisterRequest) => {
    const res = await registerApi(req);
    saveTokens(res.access_token, res.refresh_token);
    setState({ user: res.user, token: res.access_token, refreshToken: res.refresh_token, isLoading: false, isAuthenticated: true });
  }, []);

  const refreshSession = useCallback(async () => {
    const { refreshToken } = loadTokens();
    if (!refreshToken) {
      clearTokens();
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }
    try {
      const res = await refreshTokenApi(refreshToken);
      saveTokens(res.access_token, res.refresh_token);
      const user = await getMeApi();
      setState({ user, token: res.access_token, refreshToken: res.refresh_token, isLoading: false, isAuthenticated: true });
    } catch {
      clearTokens();
      setState({ user: null, token: null, refreshToken: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  // Bootstrap on mount
  useEffect(() => {
    const { token } = loadTokens();
    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }
    getMeApi()
      .then((user) => {
        const tokens = loadTokens();
        setState({ user, token: tokens.token, refreshToken: tokens.refreshToken, isLoading: false, isAuthenticated: true });
      })
      .catch(() => {
        // token expired — try refresh
        refreshSession();
      });
  }, [refreshSession]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshSession, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
