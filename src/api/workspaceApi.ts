import type { Workspace, WorkspaceCreate, WorkspaceUpdate, WorkspaceListResponse, WorkspaceStats, ActivityListResponse, WorkspaceMemberListResponse } from "../types/workspace";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(body.detail ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function listWorkspaces(params?: {
  skip?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: string;
  archived?: boolean;
  orgId?: number;
}): Promise<WorkspaceListResponse> {
  const q = new URLSearchParams();
  if (params?.skip) q.set("skip", String(params.skip));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.search) q.set("search", params.search);
  if (params?.sort) q.set("sort", params.sort);
  if (params?.order) q.set("order", params.order);
  if (params?.archived !== undefined) q.set("archived", String(params.archived));
  q.set("org_id", String(params?.orgId ?? 1));
  const res = await fetch(`${BASE}/workspaces?${q}`, { headers: authHeaders() });
  return handleResponse<WorkspaceListResponse>(res);
}

export async function getWorkspace(id: number): Promise<Workspace> {
  const res = await fetch(`${BASE}/workspaces/${id}`, { headers: authHeaders() });
  return handleResponse<Workspace>(res);
}

export async function createWorkspace(data: WorkspaceCreate, orgId = 1): Promise<Workspace> {
  const res = await fetch(`${BASE}/workspaces?org_id=${orgId}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Workspace>(res);
}

export async function updateWorkspace(id: number, data: WorkspaceUpdate): Promise<Workspace> {
  const res = await fetch(`${BASE}/workspaces/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Workspace>(res);
}

export async function deleteWorkspace(id: number): Promise<void> {
  await fetch(`${BASE}/workspaces/${id}`, { method: "DELETE", headers: authHeaders() });
}

export async function toggleFavorite(id: number): Promise<Workspace> {
  const res = await fetch(`${BASE}/workspaces/${id}/favorite`, { method: "PATCH", headers: authHeaders() });
  return handleResponse<Workspace>(res);
}

export async function toggleArchive(id: number): Promise<Workspace> {
  const res = await fetch(`${BASE}/workspaces/${id}/archive`, { method: "PATCH", headers: authHeaders() });
  return handleResponse<Workspace>(res);
}

export async function getWorkspaceStats(id: number): Promise<WorkspaceStats> {
  const res = await fetch(`${BASE}/workspaces/${id}/stats`, { headers: authHeaders() });
  return handleResponse<WorkspaceStats>(res);
}

export async function getWorkspaceActivity(id: number, skip = 0, limit = 50): Promise<ActivityListResponse> {
  const res = await fetch(`${BASE}/workspaces/${id}/activity?skip=${skip}&limit=${limit}`, { headers: authHeaders() });
  return handleResponse<ActivityListResponse>(res);
}

export async function getWorkspaceMembers(id: number): Promise<WorkspaceMemberListResponse> {
  const res = await fetch(`${BASE}/workspaces/${id}/members`, { headers: authHeaders() });
  return handleResponse<WorkspaceMemberListResponse>(res);
}
