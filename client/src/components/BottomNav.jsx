import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", icon: "🏠", label: "Inicio", end: true },
  { to: "/tendencias", icon: "🔥", label: "Tendencias" },
  { to: "/perfil", icon: "👤", label: "Perfil" },
];

export default function BottomNav() {
  return (
    <div className="bottom-nav">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
