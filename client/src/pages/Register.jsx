import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { GENDERS } from "../constants";
import { COUNTRIES } from "../countries";

const CURRENT_YEAR = new Date().getFullYear();

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", gender: "", birthYear: "", country: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await api.register({ ...form, birthYear: Number(form.birthYear) });
      setUser(user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-narrow">
      <div className="card">
        <div className="brand-mark">GRAFICU</div>
        <h1>Crea tu cuenta</h1>
        <p className="muted">
          Perfil rápido y sencillo — solo lo necesario para poder votar. Después podrás agregar más
          información desde tu perfil para desbloquear más insights.
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="field">
            <label>Género</label>
            <select value={form.gender} onChange={(e) => update("gender", e.target.value)} required>
              <option value="" disabled>
                Selecciona...
              </option>
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
              value={form.birthYear}
              onChange={(e) => update("birthYear", e.target.value)}
              placeholder="1998"
              required
            />
          </div>
          <div className="field">
            <label>País</label>
            <select value={form.country} onChange={(e) => update("country", e.target.value)} required>
              <option value="" disabled>
                Selecciona...
              </option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>
        <p className="small muted">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
