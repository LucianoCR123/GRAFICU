import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { labelFor, CATEGORIES } from "../constants";

export default function AdminPolls() {
  const [polls, setPolls] = useState(null);
  const [error, setError] = useState("");

  function reload() {
    api.listPolls().then(setPolls).catch((err) => setError(err.message));
  }

  useEffect(reload, []);

  async function handleDelete(id, question) {
    if (!confirm(`¿Borrar la encuesta "${question}"? Esto borra también sus votos.`)) return;
    try {
      await api.adminDeletePoll(id);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="results-header">
        <h1 style={{ margin: 0 }}>Admin — Encuestas</h1>
        <Link to="/admin/nueva">
          <button>Nueva encuesta</button>
        </Link>
      </div>

      {error && <p className="error">{error}</p>}
      {!polls && <p className="muted">Cargando...</p>}

      {polls && (
        <div className="admin-table">
          {polls.map((p) => (
            <div className="admin-row" key={p.id}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.question}</div>
                <div className="muted small">
                  {labelFor(CATEGORIES, p.category)} · {p.totalVotes} votos
                  {p.hasCounterQuestion ? " · con pregunta de control" : ""}
                </div>
              </div>
              <div className="admin-row-actions">
                <Link to={`/admin/${p.id}/editar`}>
                  <button className="secondary">Editar</button>
                </Link>
                <button className="danger" onClick={() => handleDelete(p.id, p.question)}>
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
