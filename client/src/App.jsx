import { Routes, Route, Navigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import { RequireAuth, RequireAdmin } from "./components/RouteGuards";
import Home from "./pages/Home";
import Trending from "./pages/Trending";
import PollDetail from "./pages/PollDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import AdminPolls from "./pages/AdminPolls";
import AdminPollForm from "./pages/AdminPollForm";

// A diferencia de LockIn, GRAFICU permite navegar y ver resultados sin
// cuenta — por eso las rutas se renderizan siempre, y la proteccion es por
// ruta (RequireAuth/RequireAdmin) en vez de un redirect global a /login. El
// bottom nav (Inicio/Tendencias/Perfil) se muestra siempre, como una app de
// celular real, en vez del nav superior tipo sitio web de la v1.
export default function App() {
  return (
    <div className="app-frame">
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
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
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPolls />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/nueva"
            element={
              <RequireAdmin>
                <AdminPollForm />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/:id/editar"
            element={
              <RequireAdmin>
                <AdminPollForm />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
