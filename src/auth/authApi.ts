import type {
  TokenResponse,
  User,
  LoginRequest,
  RegisterRequest,
  RefreshTokenResponse,
  ProfileUpdateRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from "../types/auth";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(body.detail ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginApi(req: LoginRequest): Promise<TokenResponse> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<TokenResponse>(res);
}

export async function registerApi(req: RegisterRequest): Promise<TokenResponse> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<TokenResponse>(res);
}

export async function refreshTokenApi(token: string): Promise<RefreshTokenResponse> {
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: token }),
  });
  return handleResponse<RefreshTokenResponse>(res);
}

export async function logoutApi(): Promise<void> {
  await fetch(`${BASE}/auth/logout`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function getMeApi(): Promise<User> {
  const res = await fetch(`${BASE}/auth/me`, { headers: authHeaders() });
  return handleResponse<User>(res);
}

export async function updateProfileApi(req: ProfileUpdateRequest): Promise<User> {
  const res = await fetch(`${BASE}/auth/profile`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<User>(res);
}

export async function changePasswordApi(req: ChangePasswordRequest): Promise<void> {
  const res = await fetch(`${BASE}/auth/change-password`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<void>(res);
}

export async function forgotPasswordApi(req: ForgotPasswordRequest): Promise<{ message: string; token?: string }> {
  const res = await fetch(`${BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<{ message: string; token?: string }>(res);
}

export async function resetPasswordApi(req: ResetPasswordRequest): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<{ message: string }>(res);
}
