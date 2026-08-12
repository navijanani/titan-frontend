export type TQLRequest = {
  tql: string;
};

export type TQLResponse = {
  query: string;
  resource: string;
  items: Record<string, unknown>[];
  total: number;
  explanation: string;
};

export type RAGResponse = {
  query: string;
  answer: string;
  sources: { source: string; count: number; items: Record<string, unknown>[] }[];
  steps: { name: string; duration_ms: number; status: string; detail: string | null }[];
  total_duration_ms: number;
  llm_provider: string;
  llm_model: string;
  created_at: string;
};

export type RAGRequest = {
  query: string;
  top_k?: number;
  use_graph?: boolean;
  use_memory?: boolean;
  llm_provider?: string;
  llm_model?: string;
  temperature?: number;
  top_p?: number;
};
