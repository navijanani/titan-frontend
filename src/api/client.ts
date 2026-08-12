import type { Document, DocumentListResponse, DocumentStatusResponse, UploadResponse, DeleteResponse } from "../types/document";
import type { SearchRequest, SearchResponse, SearchResultItem } from "../types/search";
import type { Chunk } from "../types/document";
import type { KGEntity, KGRelationship, DocGraphResponse, KGPathRequest, KGPathResponse } from "../types/graph";
import type { Memory, MemoryCreate, MemoryUpdate, MemorySearchRequest, MemorySearchResponse, MemoryListResponse } from "../types/memory";
import type { DashboardResponse, TimeSeriesResponse, SearchAccuracyMetrics, MemoryRetrievalMetrics, EmbeddingMetrics } from "../types/metrics";
import type { TQLRequest, TQLResponse, RAGRequest, RAGResponse } from "../types/tql";
import type { DashboardStats } from "../types/dashboard";
import type { Collection, CollectionDetail, CollectionListResponse, CollectionCreate, CollectionUpdate, CollectionDocumentItem } from "../types/collection";
import type { AnalyticsGrowth, GrowthPoint, LatencyPoint } from "../types/analytics";
import type { OptimizerPlan, OptimizerExecuteResponse, TQLExplainResponse, ExecutorResult, ExecutionResponse } from "../types/optimizer";

export type { Document, DocumentListResponse, KGEntity, KGRelationship, Memory, DashboardResponse, TQLResponse, RAGResponse, Chunk, SearchRequest, SearchResultItem, DocGraphResponse, MemoryCreate, MemoryUpdate, TimeSeriesResponse, SearchAccuracyMetrics, MemoryRetrievalMetrics, DashboardStats, Collection, CollectionDetail, CollectionListResponse, CollectionCreate, CollectionUpdate, CollectionDocumentItem, AnalyticsGrowth, GrowthPoint, LatencyPoint, OptimizerPlan, OptimizerExecuteResponse, TQLExplainResponse, ExecutorResult, ExecutionResponse };

const BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

function getToken(): string | null {
  return localStorage.getItem("access_token");
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(body.detail ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Documents ──
export async function uploadFile(file: File, workspaceId = 1, orgId = 1): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const params = new URLSearchParams({ workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/documents/upload?${params}`, { method: "POST", body: form, headers: authHeaders() });
  return handleResponse<UploadResponse>(res);
}

export async function listDocuments(skip = 0, limit = 100, workspaceId = 1, orgId = 1): Promise<DocumentListResponse> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit), workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/documents?${params}`, { headers: authHeaders() });
  return handleResponse<DocumentListResponse>(res);
}

export async function getDocument(id: number): Promise<Document> {
  const res = await fetch(`${BASE}/documents/${id}`, { headers: authHeaders() });
  return handleResponse<Document>(res);
}

export async function deleteDocument(id: number): Promise<DeleteResponse> {
  const res = await fetch(`${BASE}/documents/${id}`, { method: "DELETE", headers: authHeaders() });
  return handleResponse<DeleteResponse>(res);
}

export async function getDocumentStatus(id: number): Promise<DocumentStatusResponse> {
  const res = await fetch(`${BASE}/documents/${id}/status`, { headers: authHeaders() });
  return handleResponse<DocumentStatusResponse>(res);
}

export async function getDocumentChunks(id: number, skip = 0, limit = 500): Promise<Chunk[]> {
  const res = await fetch(`${BASE}/documents/${id}/chunks?skip=${skip}&limit=${limit}`, { headers: authHeaders() });
  return handleResponse<Chunk[]>(res);
}

// ── Search ──
export async function semanticSearch(req: SearchRequest, workspaceId = 1, orgId = 1): Promise<SearchResponse> {
  const params = new URLSearchParams({ workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/search/semantic?${params}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<SearchResponse>(res);
}

export async function hybridSearch(req: SearchRequest, workspaceId = 1, orgId = 1): Promise<SearchResponse> {
  const params = new URLSearchParams({ workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/search/hybrid?${params}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<SearchResponse>(res);
}

// ── Knowledge Graph ──
export async function listKGEntities(workspaceId = 1, orgId = 1): Promise<KGEntity[]> {
  const params = new URLSearchParams({ workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/kg/entities?${params}`, { headers: authHeaders() });
  return handleResponse<KGEntity[]>(res);
}

export async function getKGGraph(workspaceId = 1, orgId = 1): Promise<{ entities: KGEntity[]; relationships: KGRelationship[]; total_entities: number; total_relationships: number }> {
  const params = new URLSearchParams({ workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/kg/graph?${params}`, { headers: authHeaders() });
  return handleResponse<{ entities: KGEntity[]; relationships: KGRelationship[]; total_entities: number; total_relationships: number }>(res);
}

export async function getKGEntity(id: number): Promise<KGEntity> {
  const res = await fetch(`${BASE}/kg/entities/${id}`, { headers: authHeaders() });
  return handleResponse<KGEntity>(res);
}

export async function searchKGEntities(query: string, workspaceId = 1, orgId = 1): Promise<KGEntity[]> {
  const params = new URLSearchParams({ q: query, workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/kg/entities/search?${params}`, { headers: authHeaders() });
  return handleResponse<KGEntity[]>(res);
}

export async function createKGEntity(data: { name: string; entity_type: string; properties?: Record<string, unknown> }, workspaceId = 1, orgId = 1): Promise<KGEntity> {
  const params = new URLSearchParams({ workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/kg/entities?${params}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<KGEntity>(res);
}

export async function deleteKGEntity(id: number): Promise<void> {
  await fetch(`${BASE}/kg/entities/${id}`, { method: "DELETE", headers: authHeaders() });
}

export async function listKGRelationships(): Promise<KGRelationship[]> {
  const res = await fetch(`${BASE}/kg/relationships`, { headers: authHeaders() });
  return handleResponse<KGRelationship[]>(res);
}

export async function getKGEntityRelationships(id: number): Promise<KGRelationship[]> {
  const res = await fetch(`${BASE}/kg/entities/${id}/neighbors`, { headers: authHeaders() });
  const data = await handleResponse<{ neighbors: { relationship: KGRelationship }[] }>(res);
  return data.neighbors.map((item) => item.relationship);
}

export async function createKGRelationship(data: { source_entity_id: number; target_entity_id: number; relationship_type: string; properties?: Record<string, unknown> }): Promise<KGRelationship> {
  const res = await fetch(`${BASE}/kg/relationships`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<KGRelationship>(res);
}

export async function deleteKGRelationship(id: number): Promise<void> {
  await fetch(`${BASE}/kg/relationships/${id}`, { method: "DELETE", headers: authHeaders() });
}

export async function findKGPaths(req: KGPathRequest): Promise<KGPathResponse> {
  const params = new URLSearchParams({
    source: String(req.source_entity_id),
    target: String(req.target_entity_id),
    max_depth: String(req.max_depth ?? 5),
  });
  const res = await fetch(`${BASE}/kg/path?${params}`, { headers: authHeaders() });
  const data = await handleResponse<{ path: KGEntity[]; relationships: KGRelationship[]; found: boolean }>(res);
  if (!data.found || data.path.length === 0) {
    return { paths: [] };
  }
  return {
    paths: [
      {
        path: data.path.map((entity, index) => ({
          entity_id: entity.id,
          name: entity.name,
          relationship_type: data.relationships[index]?.relationship_type ?? "",
        })),
        total_weight: data.relationships.length,
      },
    ],
  };
}

export async function getDocGraph(): Promise<DocGraphResponse> {
  const res = await fetch(`${BASE}/graph`, { headers: authHeaders() });
  return handleResponse<DocGraphResponse>(res);
}

// ── Memory ──
export async function listMemories(skip = 0, limit = 100, workspaceId = 1, orgId = 1): Promise<MemoryListResponse> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit), workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/memories?${params}`, { headers: authHeaders() });
  return handleResponse<MemoryListResponse>(res);
}

export async function getMemory(id: number): Promise<Memory> {
  const res = await fetch(`${BASE}/memories/${id}`, { headers: authHeaders() });
  return handleResponse<Memory>(res);
}

export async function createMemory(data: MemoryCreate, workspaceId = 1, orgId = 1): Promise<Memory> {
  const params = new URLSearchParams({ workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/memories?${params}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Memory>(res);
}

export async function updateMemory(id: number, data: MemoryUpdate): Promise<Memory> {
  const res = await fetch(`${BASE}/memories/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Memory>(res);
}

export async function deleteMemory(id: number): Promise<void> {
  await fetch(`${BASE}/memories/${id}`, { method: "DELETE", headers: authHeaders() });
}

export async function searchMemories(req: MemorySearchRequest, workspaceId = 1, orgId = 1): Promise<MemorySearchResponse> {
  const params = new URLSearchParams({
    q: req.query,
    workspace_id: String(workspaceId),
    org_id: String(orgId),
  });
  if (req.limit !== undefined) params.set("limit", String(req.limit));
  if (req.min_importance !== undefined) params.set("min_importance", String(req.min_importance));

  const res = await fetch(`${BASE}/memories/search?${params}`, { headers: authHeaders() });
  const data = await handleResponse<MemoryListResponse>(res);
  return {
    query: req.query,
    total: data.total,
    results: data.memories,
  };
}

export async function searchMemoriesRanked(req: MemorySearchRequest): Promise<MemorySearchResponse> {
  const res = await fetch(`${BASE}/memories/search-ranked`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<MemorySearchResponse>(res);
}

export async function getImportantMemories(limit = 20, minImportance = 0.5, workspaceId = 1, orgId = 1): Promise<Memory[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    min_score: String(minImportance),
    workspace_id: String(workspaceId),
    org_id: String(orgId),
  });
  const res = await fetch(`${BASE}/memories/important?${params}`, { headers: authHeaders() });
  const data = await handleResponse<MemoryListResponse>(res);
  return data.memories;
}

// ── Optimizer ──
export async function getOptimizerPlan(query: string, topK = 10, graphDepth = 5, workspaceId = 1, orgId = 1): Promise<OptimizerPlan> {
  const params = new URLSearchParams({ workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/optimizer/plan?${params}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK, graph_depth: graphDepth }),
  });
  return handleResponse<OptimizerPlan>(res);
}

export async function executeOptimizedQuery(query: string, topK = 10, graphDepth = 5, workspaceId = 1, orgId = 1): Promise<OptimizerExecuteResponse> {
  const params = new URLSearchParams({ workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/optimizer/execute?${params}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK, graph_depth: graphDepth }),
  });
  return handleResponse<OptimizerExecuteResponse>(res);
}

export async function explainTQL(tql: string): Promise<TQLExplainResponse> {
  const res = await fetch(`${BASE}/tql/explain`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ tql }),
  });
  return handleResponse<TQLExplainResponse>(res);
}

// ── TQL ──
export async function executeTQL(req: TQLRequest): Promise<TQLResponse> {
  const res = await fetch(`${BASE}/tql/query`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<TQLResponse>(res);
}

// ── RAG ──
export async function executeRAG(req: RAGRequest): Promise<RAGResponse> {
  const res = await fetch(`${BASE}/rag/query`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  return handleResponse<RAGResponse>(res);
}

// ── Collections ──
export async function createCollection(data: CollectionCreate, workspaceId = 1, orgId = 1): Promise<Collection> {
  const params = new URLSearchParams({ workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/collections?${params}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Collection>(res);
}

export async function listCollections(skip = 0, limit = 100, workspaceId = 1, orgId = 1): Promise<CollectionListResponse> {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit), workspace_id: String(workspaceId), org_id: String(orgId) });
  const res = await fetch(`${BASE}/collections?${params}`, { headers: authHeaders() });
  return handleResponse<CollectionListResponse>(res);
}

export async function getCollection(id: number): Promise<CollectionDetail> {
  const res = await fetch(`${BASE}/collections/${id}`, { headers: authHeaders() });
  return handleResponse<CollectionDetail>(res);
}

export async function updateCollection(id: number, data: CollectionUpdate): Promise<Collection> {
  const res = await fetch(`${BASE}/collections/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Collection>(res);
}

export async function deleteCollection(id: number): Promise<void> {
  await fetch(`${BASE}/collections/${id}`, { method: "DELETE", headers: authHeaders() });
}

export async function addDocumentToCollection(collectionId: number, documentId: number): Promise<{ added: boolean; message: string }> {
  const res = await fetch(`${BASE}/collections/${collectionId}/documents`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ document_id: documentId }),
  });
  return handleResponse<{ added: boolean; message: string }>(res);
}

export async function removeDocumentFromCollection(collectionId: number, documentId: number): Promise<void> {
  await fetch(`${BASE}/collections/${collectionId}/documents/${documentId}`, { method: "DELETE", headers: authHeaders() });
}

export async function searchCollection(collectionId: number, query: string, topK = 10): Promise<SearchResponse> {
  const res = await fetch(`${BASE}/collections/${collectionId}/search`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK }),
  });
  return handleResponse<SearchResponse>(res);
}

// ── Analytics ──
export async function getAnalyticsGrowth(days = 30, workspaceId = 1, orgId = 1): Promise<AnalyticsGrowth> {
  const res = await fetch(`${BASE}/analytics/growth?days=${days}&workspace_id=${workspaceId}&org_id=${orgId}`, { headers: authHeaders() });
  return handleResponse<AnalyticsGrowth>(res);
}

// ── Dashboard ──
export async function getDashboardStats(workspaceId = 1, orgId = 1): Promise<DashboardStats> {
  const res = await fetch(`${BASE}/dashboard?workspace_id=${workspaceId}&org_id=${orgId}`, { headers: authHeaders() });
  return handleResponse<DashboardStats>(res);
}

// ── Metrics ──
export async function getMetricsDashboard(): Promise<DashboardResponse> {
  const res = await fetch(`${BASE}/metrics/dashboard`, { headers: authHeaders() });
  return handleResponse<DashboardResponse>(res);
}

export async function getQueryLatencyTimeSeries(windowMinutes = 60): Promise<TimeSeriesResponse> {
  const res = await fetch(`${BASE}/metrics/query-latency?window_minutes=${windowMinutes}`, { headers: authHeaders() });
  return handleResponse<TimeSeriesResponse>(res);
}

export async function getEmbeddingTimeSeries(windowMinutes = 60): Promise<TimeSeriesResponse> {
  const res = await fetch(`${BASE}/metrics/embeddings?window_minutes=${windowMinutes}`, { headers: authHeaders() });
  return handleResponse<TimeSeriesResponse>(res);
}

export async function getSearchMetrics(): Promise<SearchAccuracyMetrics> {
  const res = await fetch(`${BASE}/metrics/search`, { headers: authHeaders() });
  return handleResponse<SearchAccuracyMetrics>(res);
}

export async function getMemoryMetrics(): Promise<MemoryRetrievalMetrics> {
  const res = await fetch(`${BASE}/metrics/memory`, { headers: authHeaders() });
  return handleResponse<MemoryRetrievalMetrics>(res);
}
