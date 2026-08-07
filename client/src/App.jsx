import { Routes, Route } from "react-router-dom";
import { RequireAdmin } from "./components/RouteGuards";
import ConsumerShell from "./ConsumerShell";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminPolls from "./pages/admin/AdminPolls";
import AdminPollForm from "./pages/admin/AdminPollForm";
import AdminCases from "./pages/admin/AdminCases";
import AdminCaseForm from "./pages/admin/AdminCaseForm";

// Dos shells separados a nivel de ruta: /admin/* es una pagina de
// escritorio (AdminLayout, sin frame de telefono ni bottom nav) porque es
// la herramienta de control de Luciano, no algo pensado para el feed movil.
// Todo lo demas vive en ConsumerShell (el shell tipo app que ya existia).
export default function App() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminPolls />} />
        <Route path="nueva" element={<AdminPollForm />} />
        <Route path=":id/editar" element={<AdminPollForm />} />
        <Route path="casos" element={<AdminCases />} />
        <Route path="casos/nuevo" element={<AdminCaseForm />} />
        <Route path="casos/:id/editar" element={<AdminCaseForm />} />
      </Route>
      <Route path="/*" element={<ConsumerShell />} />
    </Routes>
  );
}
