import { Routes, Route, Navigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import { RequireAuth } from "./components/RouteGuards";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import Trending from "./pages/Trending";
import PollDetail from "./pages/PollDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// Shell tipo app movil: frame del ancho de un telefono + bottom nav fijo.
// Todo lo de /admin vive FUERA de este shell (ver App.jsx) porque es una
// herramienta de escritorio para Luciano, no parte de la experiencia movil.
export default function ConsumerShell() {
  return (
    <div className="app-frame">
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<Categories />} />
          <Route path="/tendencias" element={<Trending />} />
          <Route path="/encuestas/:id" element={<PollDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
