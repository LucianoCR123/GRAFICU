import { useEffect, useState } from "react";
import { api } from "../api";
import { CATEGORIES, CATEGORY_EMOJI } from "../constants";
import PollListItem from "../components/PollListItem";

export default function Categories() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const active = Boolean(search.trim() || category);

  useEffect(() => {
    if (!active) {
      setResults(null);
      return;
    }
    const timeout = setTimeout(() => {
      api
        .listPolls({ category, search: search.trim() })
        .then(setResults)
        .catch((err) => setError(err.message));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, category, active]);

  return (
    <div className="page">
      <h1>Categorías</h1>

      <div className="field">
        <input
          type="text"
          placeholder="Buscar una encuesta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {!active && (
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <button key={c.value} className="category-card" onClick={() => setCategory(c.value)}>
              <span className="category-card-emoji">{CATEGORY_EMOJI[c.value]}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      )}

      {active && (
        <>
          <div className="results-header">
            <span className="muted small">
              {category ? `Categoría: ${CATEGORIES.find((c) => c.value === category)?.label}` : "Resultados"}
            </span>
            <button
              className="link"
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
            >
              ← Volver a categorías
            </button>
          </div>

          {error && <p className="error">{error}</p>}
          {!results && !error && <p className="muted">Buscando...</p>}
          {results && results.length === 0 && (
            <div className="empty-state">No encontramos ninguna encuesta.</div>
          )}
          {results && results.length > 0 && (
            <div className="poll-list">
              {results.map((p) => (
                <PollListItem key={p.id} poll={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
