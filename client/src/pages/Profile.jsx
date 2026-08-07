import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import {
  GENDERS,
  EDUCATION,
  RELATIONSHIP_STATUS,
  SEXUALITY,
  POLITICAL_LEANING,
  RELIGION,
} from "../constants";
import { COUNTRIES } from "../countries";

const CURRENT_YEAR = new Date().getFullYear();

const OPTIONAL_FIELDS = [
  { key: "occupation", label: "Ocupación", type: "text" },
  { key: "education", label: "Educación", type: "select", options: EDUCATION },
  { key: "relationshipStatus", label: "Estado civil", type: "select", options: RELATIONSHIP_STATUS },
  { key: "sexuality", label: "Sexualidad", type: "select", options: SEXUALITY },
  { key: "politicalLeaning", label: "Orientación política", type: "select", options: POLITICAL_LEANING },
  { key: "religion", label: "Religión", type: "select", options: RELIGION },
];

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [core, setCore] = useState({ gender: user.gender, birthYear: user.birthYear, country: user.country });
  const [coreStatus, setCoreStatus] = useState("");
  const [coreError, setCoreError] = useState("");

  const [extra, setExtra] = useState(
    Object.fromEntries(OPTIONAL_FIELDS.map((f) => [f.key, user[f.key] || ""]))
  );
  const [extraStatus, setExtraStatus] = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwStatus, setPwStatus] = useState("");
  const [pwError, setPwError] = useState("");

  const [history, setHistory] = useState(null);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    api
      .myVotes()
      .then(setHistory)
      .catch((err) => setHistoryError(err.message));
  }, []);

  const completedCount = OPTIONAL_FIELDS.filter((f) => user[f.key]).length;

  async function saveCore(e) {
    e.preventDefault();
    setCoreError("");
    setCoreStatus("");
    try {
      const updated = await api.updateProfile({ ...core, birthYear: Number(core.birthYear) });
      setUser(updated);
      setCoreStatus("Guardado.");
    } catch (err) {
      setCoreError(err.message);
    }
  }

  async function saveExtraField(key, value) {
    setExtra((e) => ({ ...e, [key]: value }));
    const updated = await api.updateProfile({ [key]: value || null });
    setUser(updated);
    setExtraStatus("Guardado.");
    setTimeout(() => setExtraStatus(""), 1500);
  }

  async function changePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwStatus("");
    try {
      await api.changePassword(pwForm);
      setPwForm({ currentPassword: "", newPassword: "" });
      setPwStatus("Contraseña actualizada.");
    } catch (err) {
      setPwError(err.message);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="page-narrow">
      <h1>Tu perfil</h1>
      <p className="muted">{user.email}</p>

      {user.isAdmin && (
        <Link to="/admin">
          <button className="secondary" style={{ marginBottom: "1.4rem" }}>
            Panel de admin
          </button>
        </Link>
      )}

      <div className="profile-section card">
        <h2 style={{ marginTop: 0 }}>Tu información</h2>
        <form className="form" onSubmit={saveCore}>
          <div className="field">
            <label>Género</label>
            <select value={core.gender} onChange={(e) => setCore((c) => ({ ...c, gender: e.target.value }))}>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Año de nacimiento</label>
            <input
              type="number"
              min={1900}
              max={CURRENT_YEAR - 13}
              value={core.birthYear}
              onChange={(e) => setCore((c) => ({ ...c, birthYear: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>País</label>
            <select value={core.country} onChange={(e) => setCore((c) => ({ ...c, country: e.target.value }))}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {coreError && <p className="error">{coreError}</p>}
          {coreStatus && <p className="success">{coreStatus}</p>}
          <button type="submit">Guardar</button>
        </form>
      </div>

      <div className="profile-section card">
        <h2 style={{ marginTop: 0 }}>Agrega más info</h2>
        <p className="muted small">
          Toda esta información es privada — nadie más la ve, y tus votos siempre son anónimos (nunca se
          muestra tu nombre junto a lo que respondiste). Mientras más completes, más encuestas vas a poder
          responder y más insights vas a poder ver desagregados.
        </p>
        <div className="profile-progress">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(completedCount / OPTIONAL_FIELDS.length) * 100}%` }}
            />
          </div>
          <span className="small muted">
            {completedCount} de {OPTIONAL_FIELDS.length}
          </span>
        </div>
        <div className="form">
          {OPTIONAL_FIELDS.map((f) => (
            <div className="field" key={f.key}>
              <label>{f.label}</label>
              {f.type === "select" ? (
                <select value={extra[f.key]} onChange={(e) => saveExtraField(f.key, e.target.value)}>
                  <option value="">— No especificado —</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={extra[f.key]}
                  onChange={(e) => setExtra((x) => ({ ...x, [f.key]: e.target.value }))}
                  onBlur={(e) => saveExtraField(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
          {extraStatus && <p className="success">{extraStatus}</p>}
        </div>
      </div>

      <div className="profile-section card">
        <h2 style={{ marginTop: 0 }}>Cambiar contraseña</h2>
        <form className="form" onSubmit={changePassword}>
          <div className="field">
            <label>Contraseña actual</label>
            <input
              type="password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Nueva contraseña</label>
            <input
              type="password"
              minLength={6}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
            />
          </div>
          {pwError && <p className="error">{pwError}</p>}
          {pwStatus && <p className="success">{pwStatus}</p>}
          <button type="submit">Actualizar contraseña</button>
        </form>
      </div>

      <div className="profile-section card">
        <h2 style={{ marginTop: 0 }}>Tu historial</h2>
        {historyError && <p className="error">{historyError}</p>}
        {!history && !historyError && <p className="muted small">Cargando...</p>}
        {history && history.length === 0 && (
          <p className="muted small">Todavía no has votado en ninguna encuesta.</p>
        )}
        {history && history.length > 0 && (
          <div className="history-list">
            {history.map((h) => (
              <Link to={`/encuestas/${h.pollId}`} key={h.pollId} className="history-row">
                <div className="history-row-question">{h.question}</div>
                <div className="muted small">Tu respuesta: {h.myAnswer}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <button className="secondary" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}
