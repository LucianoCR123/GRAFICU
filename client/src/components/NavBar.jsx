import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <div className="top-nav">
      <Link to="/" className="brand-mark">
        GRAFICU
      </Link>
      <div className="top-nav-links">
        {user?.isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            Admin
          </NavLink>
        )}
        {user ? (
          <>
            <NavLink to="/perfil" className={({ isActive }) => (isActive ? "active" : "")}>
              Perfil
            </NavLink>
            <button className="secondary" onClick={logout}>
              Salir
            </button>
          </>
        ) : (
          <Link to="/login">
            <button>Entrar</button>
          </Link>
        )}
      </div>
    </div>
  );
}
