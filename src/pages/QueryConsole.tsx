import { useState } from "react";
import { executeTQL, executeRAG } from "../api/client";
import type { TQLResponse, RAGResponse } from "../api/client";

type QueryMode = "tql" | "rag";

export function QueryConsole() {
  const [mode, setMode] = useState<QueryMode>("tql");
  return (
    <div className="page">
      <div className="page-header">
        <h2>Query Console</h2>
      </div>
      <div className="sub-tabs">
        {(["tql", "rag"] as QueryMode[]).map((m) => (
          <button key={m} className={`sub-tab ${mode === m ? "active" : ""}`} onClick={() => setMode(m)}>
            {m === "tql" ? "TQL Query" : "RAG Query"}
          </button>
        ))}
      </div>
      {mode === "tql" ? <TQLPanel /> : <RAGPanel />}
    </div>
  );
}

function TQLPanel() {
  const [input, setInput] = useState("FIND documents ABOUT artificial intelligence LIMIT 10");
  const [result, setResult] = useState<TQLResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  const handleExecute = async () => {
    if (!input.trim()) return;
    setExecuting(true);
    setError(null);
    setResult(null);
    try {
      const resp = await executeTQL({ tql: input.trim() });
      setResult(resp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Query execution failed");
    } finally {
      setExecuting(false);
    }
  };

  const examples = [
    "FIND documents ABOUT artificial intelligence LIMIT 10",
    "FIND memories ABOUT machine learning ORDER BY importance",
    "FIND entities WHERE type=technology",
    "FIND documents RELATED TO 1",
  ];

  return (
    <div className="section query-section">
      <h3>Titan Query Language</h3>
      <div className="examples-row">
        {examples.map((ex, i) => (
          <button key={i} className="example-chip" onClick={() => setInput(ex)}>{ex}</button>
        ))}
      </div>
      <div className="query-editor">
        <textarea
          className="tql-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          spellCheck={false}
        />
        <button onClick={handleExecute} disabled={executing || !input.trim()} className="execute-btn">
          {executing ? "Executing..." : "Execute"}
        </button>
      </div>

      {error && <div className="msg error">{error}</div>}

      {result && (
        <div className="query-result">
          <div className="result-summary">
            <span className="result-summary-item"><strong>Resource:</strong> {result.resource}</span>
            <span className="result-summary-item"><strong>Total:</strong> {result.total}</span>
            <span className="result-summary-item"><strong>Explanation:</strong> {result.explanation}</span>
          </div>
          {result.items.length > 0 ? (
            <table className="doc-table result-table">
              <thead>
                <tr>
                  {Object.keys(result.items[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.items.map((item, i) => (
                  <tr key={i}>
                    {Object.values(item).map((val, j) => (
                      <td key={j}>{typeof val === "object" ? JSON.stringify(val) : String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-text">No results returned.</p>
          )}
        </div>
      )}
    </div>
  );
}

function RAGPanel() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<RAGResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [useGraph, setUseGraph] = useState(true);
  const [useMemory, setUseMemory] = useState(true);

  const handleExecute = async () => {
    if (!input.trim()) return;
    setExecuting(true);
    setError(null);
    setResult(null);
    try {
      const resp = await executeRAG({
        query: input.trim(),
        use_graph: useGraph,
        use_memory: useMemory,
      });
      setResult(resp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "RAG query failed");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="section query-section">
      <h3>RAG Pipeline</h3>
      <p className="section-desc">Query the LLM with context from documents, knowledge graph, and memory.</p>
      <div className="query-editor">
        <textarea
          className="tql-input"
          placeholder="Ask a question about your documents..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
        />
        <div className="rag-options">
          <label className="checkbox-label">
            <input type="checkbox" checked={useGraph} onChange={(e) => setUseGraph(e.target.checked)} /> Use Knowledge Graph
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={useMemory} onChange={(e) => setUseMemory(e.target.checked)} /> Use Memory
          </label>
          <button onClick={handleExecute} disabled={executing || !input.trim()} className="execute-btn">
            {executing ? "Running..." : "Ask"}
          </button>
        </div>
      </div>

      {error && <div className="msg error">{error}</div>}

      {result && (
        <div className="query-result">
          <div className="rag-answer">
            <h4>Answer</h4>
            <p>{result.answer}</p>
          </div>
          <div className="rag-meta">
            <span>LLM: {result.llm_provider}/{result.llm_model}</span>
            <span>Duration: {result.total_duration_ms.toFixed(0)}ms</span>
          </div>
          {result.steps.length > 0 && (
            <div className="rag-steps">
              <h4>Pipeline Steps</h4>
              {result.steps.map((step, i) => (
                <div key={i} className="step-row">
                  <span className="step-name">{step.name}</span>
                  <span className={`step-status ${step.status}`}>{step.status}</span>
                  <span className="step-time">{step.duration_ms.toFixed(0)}ms</span>
                </div>
              ))}
            </div>
          )}
          {result.sources.length > 0 && (
            <div className="rag-sources">
              <h4>Sources ({result.sources.reduce((a, s) => a + s.count, 0)} total)</h4>
              {result.sources.map((src, i) => (
                <div key={i} className="source-section">
                  <strong>{src.source}</strong> ({src.count} items)
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
