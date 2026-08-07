import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api";

export default function AdminCaseForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [links, setLinks] = useState([{ label: "", url: "" }]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api
      .listCases()
      .then((cases) => {
        const found = cases.find((c) => c.id === id);
        if (!found) throw new Error("Caso no encontrado");
        setTitle(found.title);
        setBody(found.body);
        setLinks(found.sourceLinks?.length ? found.sourceLinks : [{ label: "", url: "" }]);
        setLoading(false);
      })
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  function updateLink(index, field, value) {
    setLinks((ls) => ls.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  function addLink() {
    setLinks((ls) => [...ls, { label: "", url: "" }]);
  }

  function removeLink(index) {
    setLinks((ls) => ls.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !body.trim()) {
      setError("Falta el título o la narrativa");
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      body: body.trim(),
      sourceLinks: links.filter((l) => l.label.trim() && l.url.trim()),
    };

    try {
      if (isEdit) {
        await api.adminUpdateCase(id, payload);
      } else {
        await api.adminCreateCase(payload);
      }
      navigate("/admin/casos");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="muted">Cargando...</p>;

  return (
    <div>
      <h1>{isEdit ? "Editar caso" : "Nuevo caso"}</h1>

      <form className="card form" onSubmit={handleSubmit} style={{ maxWidth: 640 }}>
        <div className="field">
          <label>Título</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="field">
          <label>Narrativa del caso</label>
          <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>

        <div className="field">
          <label>Fuentes (opcional)</label>
          {links.map((link, i) => (
            <div className="option-input-row" key={i} style={{ marginBottom: "0.5rem" }}>
              <input
                type="text"
                placeholder="Texto del link (ej: Artículo en El Tiempo)"
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
              />
              <input
                type="text"
                placeholder="https://..."
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
              />
              {links.length > 1 && (
                <button type="button" className="secondary" onClick={() => removeLink(i)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="secondary" onClick={addLink}>
            + Agregar fuente
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}
