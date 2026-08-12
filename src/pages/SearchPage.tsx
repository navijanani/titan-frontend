import { useState, useCallback } from "react";
import { IconSearch } from "@tabler/icons-react";
import { hybridSearch, semanticSearch } from "../api/client";
import type { SearchResultItem } from "../api/client";
import { useActiveWorkspace } from "../context/WorkspaceContext";

type SearchMode = "semantic" | "hybrid";

export function SearchPage() {
  const { activeWorkspaceId } = useActiveWorkspace();
  const [mode, setMode] = useState<SearchMode>("semantic");
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(10);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterDocId, setFilterDocId] = useState("");
  const [filterFilename, setFilterFilename] = useState("");
  const [filterFileType, setFilterFileType] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Detail
  const [detailResult, setDetailResult] = useState<SearchResultItem | null>(null);

  const buildPayload = useCallback(() => {
    const payload: Record<string, unknown> = { query: query.trim(), top_k: topK };
    if (filterDocId) payload.document_id = parseInt(filterDocId);
    const filters: Record<string, string> = {};
    if (filterFilename) filters.filename = filterFilename;
    if (filterFileType) filters.file_type = filterFileType;
    if (filterDateFrom) filters.upload_date_from = filterDateFrom;
    if (filterDateTo) filters.upload_date_to = filterDateTo;
    if (Object.keys(filters).length > 0) payload.filters = filters;
    return payload;
  }, [query, topK, filterDocId, filterFilename, filterFileType, filterDateFrom, filterDateTo, activeWorkspaceId]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setDetailResult(null);
    setSearched(true);
    try {
      const workspaceId = activeWorkspaceId || 1;
      const payload = buildPayload();
      if (mode === "hybrid") {
        const data = await hybridSearch(payload as any, workspaceId);
        setResults(data.results ?? []);
        setTotal(data.total ?? 0);
      } else {
        const data = await semanticSearch(payload as any, workspaceId);
        setResults(data.results);
        setTotal(data.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
      setTotal(0);
    } finally {
      setSearching(false);
    }
  };

  const clearFilters = () => {
    setFilterDocId("");
    setFilterFilename("");
    setFilterFileType("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  if (detailResult) {
    return (
      <div className="page">
        <div className="page-header">
          <button className="btn-ghost" onClick={() => setDetailResult(null)}>← Back to Results</button>
          <h2>Result Detail</h2>
        </div>

        <div className="detail-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="section">
            <h3>Document</h3>
            <table className="meta-table">
              <tbody>
                <tr><td>Document</td><td><strong>{detailResult.document_name}</strong></td></tr>
                <tr><td>Document ID</td><td>{detailResult.document_id}</td></tr>
                <tr><td>Chunk ID</td><td>{detailResult.chunk_id}</td></tr>
                <tr><td>Chunk Index</td><td>#{detailResult.chunk_index}</td></tr>
                <tr><td>Score</td><td>{(detailResult.score * 100).toFixed(1)}%</td></tr>
              </tbody>
            </table>
          </div>

          <div className="section">
            <h3>Content</h3>
            <p className="detail-content">{detailResult.content}</p>
          </div>

          <div className="section">
            <h3>Similarity</h3>
            <div className="score-bar-container">
              <div className="score-bar">
                <div className="score-fill" style={{ width: `${(detailResult.score * 100).toFixed(0)}%` }} />
              </div>
              <span className="score-label">{(detailResult.score * 100).toFixed(1)}% match</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasFilters = filterDocId || filterFilename || filterFileType || filterDateFrom || filterDateTo;

  return (
    <div className="studio-content">
      <div className="content-header">
        <div className="content-header-title">
          <div className="content-header-label">SEARCH ENGINE</div>
          <h1 className="content-header-name">Search</h1>
        </div>
        {searched && <div className="header-actions"><span className="result-count">{total} result{total !== 1 ? "s" : ""}</span></div>}
      </div>

      <div className="content-body">

      <div className="sub-tabs">
        {(["semantic", "hybrid"] as SearchMode[]).map((m) => (
          <button key={m} className={`sub-tab ${mode === m ? "active" : ""}`} onClick={() => { setMode(m); setSearched(false); setResults([]); }}>
            {m === "semantic" ? "Semantic Search" : "Hybrid Search"}
          </button>
        ))}
      </div>

      <div className="section search-section">
        <div className="search-row">
          <input
            className="search-input"
            placeholder={
              mode === "semantic"
                ? "Search by meaning across all documents..."
                : "Search by keywords + meaning..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            autoFocus
          />
          <button onClick={handleSearch} disabled={searching || !query.trim()}>
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="search-extra">
          <div className="search-extra-row">
            <label className="topk-label">
              Results:
              <select value={topK} onChange={(e) => setTopK(parseInt(e.target.value))}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </label>
            <button className="btn-ghost" onClick={() => setShowFilters(!showFilters)}>
              {showFilters ? "Hide Filters" : "Filters"} {hasFilters ? "●" : ""}
            </button>
            {hasFilters && <button className="btn-ghost-sm" onClick={clearFilters}>Clear All</button>}
          </div>

          {showFilters && (
            <div className="filter-panel">
              <div className="filter-row">
                <label>
                  Document ID
                  <input type="number" className="filter-input" placeholder="e.g. 1" value={filterDocId} onChange={(e) => setFilterDocId(e.target.value)} />
                </label>
                <label>
                  Filename
                  <input className="filter-input" placeholder="Partial match..." value={filterFilename} onChange={(e) => setFilterFilename(e.target.value)} />
                </label>
                <label>
                  File Type
                  <select className="filter-input" value={filterFileType} onChange={(e) => setFilterFileType(e.target.value)}>
                    <option value="">Any</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                    <option value="txt">TXT</option>
                  </select>
                </label>
              </div>
              <div className="filter-row">
                <label>
                  Upload From
                  <input type="date" className="filter-input" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
                </label>
                <label>
                  Upload To
                  <input type="date" className="filter-input" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
                </label>
              </div>
            </div>
          )}
        </div>

        {error && <div className="msg error">{error}</div>}
      </div>

      {/* Results */}
      {searched && (
        <div className="section">
          {results.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon"><IconSearch size={48} strokeWidth={1.5} /></span>
              <p className="empty-text">No results found.</p>
              <p className="empty-hint">Try a different query or adjust filters.</p>
            </div>
          ) : (
            <div className="results-list">
              {results.map((r, i) => (
                <div key={`${r.chunk_id}-${i}`} className="result-card" onClick={() => setDetailResult(r)}>
                  <div className="result-header">
                    <span className="result-rank">#{i + 1}</span>
                    <span className="result-doc">{r.document_name}</span>
                    <span className="result-score">{(r.score * 100).toFixed(1)}%</span>
                  </div>
                  <p className="result-content">{truncate(r.content, 300)}</p>
                  <div className="result-footer">
                    <span className="result-meta">Chunk #{r.chunk_index} · ID: {r.chunk_id}</span>
                    <span className="result-detail-link">View details →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}
