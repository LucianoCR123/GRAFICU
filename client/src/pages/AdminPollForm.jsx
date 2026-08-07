import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { CATEGORIES, PROFILE_FIELDS } from "../constants";

export default function AdminPollForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [category, setCategory] = useState("general");
  const [question, setQuestion] = useState("");
  const [hasCounter, setHasCounter] = useState(false);
  const [counterQuestion, setCounterQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [requiredProfileField, setRequiredProfileField] = useState("");
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api
      .getPoll(id)
      .then((p) => {
        setCategory(p.category);
        setQuestion(p.question);
        setHasCounter(Boolean(p.counterQuestion));
        setCounterQuestion(p.counterQuestion || "");
        setOptions(p.options.map((o) => o.label));
        setRequiredProfileField(p.requiredProfileField || "");
        setTotalVotes(p.totalVotes);
        setLoading(false);
      })
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  const optionsLocked = isEdit && totalVotes > 0;

  function updateOption(index, value) {
    setOptions((opts) => opts.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    setOptions((opts) => [...opts, ""]);
  }

  function removeOption(index) {
    setOptions((opts) => opts.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!question.trim()) {
      setError("Falta la pregunta");
      return;
    }
    const cleanedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!optionsLocked && cleanedOptions.length < 2) {
      setError("Se necesitan al menos 2 opciones");
      return;
    }

    setSaving(true);
    const payload = {
      category,
      question: question.trim(),
      counterQuestion: hasCounter ? counterQuestion.trim() : "",
      requiredProfileField,
    };
    if (!optionsLocked) payload.options = cleanedOptions;

    try {
      if (isEdit) {
        await api.adminUpdatePoll(id, payload);
      } else {
        await api.adminCreatePoll(payload);
      }
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page muted">Cargando...</div>;

  return (
    <div className="page-narrow">
      <h1>{isEdit ? "Editar encuesta" : "Nueva encuesta"}</h1>

      <form className="card form" onSubmit={handleSubmit}>
        <div className="field">
          <label>Categoría</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Pregunta</label>
          <textarea rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} />
        </div>

        <div className="field">
          <label>Opciones {optionsLocked && "(bloqueadas, la encuesta ya tiene votos)"}</label>
          {options.map((opt, i) => (
            <div className="option-input-row" key={i} style={{ marginBottom: "0.5rem" }}>
              <input
                type="text"
                value={opt}
                disabled={optionsLocked}
                onChange={(e) => updateOption(i, e.target.value)}
              />
              {!optionsLocked && options.length > 2 && (
                <button type="button" className="secondary" onClick={() => removeOption(i)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          {!optionsLocked && (
            <button type="button" className="secondary" onClick={addOption}>
              + Agregar opción
            </button>
          )}
        </div>

        <div className="checkbox-row">
          <input
            type="checkbox"
            id="hasCounter"
            checked={hasCounter}
            onChange={(e) => setHasCounter(e.target.checked)}
          />
          <label htmlFor="hasCounter">¿Tiene pregunta de control?</label>
        </div>

        {hasCounter && (
          <div className="field">
            <label>Pregunta de control (usa las mismas opciones)</label>
            <textarea
              rows={2}
              value={counterQuestion}
              onChange={(e) => setCounterQuestion(e.target.value)}
              placeholder="Ej: ¿Qué le dices a tus amigos que eres?"
            />
          </div>
        )}

        <div className="field">
          <label>¿Requiere info adicional del perfil para votar?</label>
          <select value={requiredProfileField} onChange={(e) => setRequiredProfileField(e.target.value)}>
            <option value="">Ninguna</option>
            {PROFILE_FIELDS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}
