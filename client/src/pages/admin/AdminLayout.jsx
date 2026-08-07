import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <Link to="/admin" className="brand-mark">
          GRAFICU Admin
        </Link>
        <div className="admin-topbar-links">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? "active" : "")}>
            Encuestas
          </NavLink>
          <NavLink to="/admin/casos" className={({ isActive }) => (isActive ? "active" : "")}>
            Casos
          </NavLink>
          <Link to="/">Ver la app</Link>
          <span className="muted small">{user?.email}</span>
          <button className="secondary" onClick={logout}>
            Salir
          </button>
        </div>
      </div>
      <div className="admin-container">
        <Outlet />
      </div>
    </div>
  );
}
