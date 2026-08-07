import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";

export default function AdminCases() {
  const [cases, setCases] = useState(null);
  const [error, setError] = useState("");

  function reload() {
    api.listCases().then(setCases).catch((err) => setError(err.message));
  }

  useEffect(reload, []);

  async function handleDelete(id, title) {
    if (!confirm(`¿Borrar el caso "${title}"? Sus preguntas quedan sueltas, no se borran.`)) return;
    try {
      await api.adminDeleteCase(id);
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="results-header">
        <h1 style={{ margin: 0 }}>Casos</h1>
        <Link to="/admin/casos/nuevo">
          <button>Nuevo caso</button>
        </Link>
      </div>

      {error && <p className="error">{error}</p>}
      {!cases && <p className="muted">Cargando...</p>}

      {cases && cases.length === 0 && (
        <div className="empty-state">Todavía no hay casos. Un caso agrupa varias preguntas bajo una misma narrativa.</div>
      )}

      {cases && cases.length > 0 && (
        <div className="admin-table">
          {cases.map((c) => (
            <div className="admin-row" key={c.id}>
              <div>
                <div style={{ fontWeight: 600 }}>{c.title}</div>
                <div className="muted small">{c.pollCount} pregunta(s) ligada(s)</div>
              </div>
              <div className="admin-row-actions">
                <Link to={`/admin/casos/${c.id}/editar`}>
                  <button className="secondary">Editar</button>
                </Link>
                <button className="danger" onClick={() => handleDelete(c.id, c.title)}>
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
