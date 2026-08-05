// En produccion, el navegador solo le habla a Vercel (mismo dominio) y
// vercel.json reenvia /api/* al backend de Render por detras — asi la
// cookie de sesion queda "same-site" y no la bloquea Safari/ITP. En
// local/LAN usa el mismo host con el que se cargo la pagina.
const API_BASE = import.meta.env.PROD ? "/api" : `${window.location.protocol}//${window.location.hostname}:4010/api`;

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    throw new Error(data?.error || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),
  updateProfile: (payload) => request("/auth/profile", { method: "PATCH", body: payload }),
  changePassword: (payload) => request("/auth/change-password", { method: "POST", body: payload }),
  deleteAccount: () => request("/auth/me", { method: "DELETE" }),

  listPolls: (category) => request(`/polls${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  getPoll: (id) => request(`/polls/${id}`),
  getResults: (id, filters = {}) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    const qs = new URLSearchParams(params).toString();
    return request(`/polls/${id}/results${qs ? `?${qs}` : ""}`);
  },
  vote: (id, payload) => request(`/polls/${id}/votes`, { method: "POST", body: payload }),

  adminCreatePoll: (payload) => request("/admin/polls", { method: "POST", body: payload }),
  adminUpdatePoll: (id, payload) => request(`/admin/polls/${id}`, { method: "PATCH", body: payload }),
  adminDeletePoll: (id) => request(`/admin/polls/${id}`, { method: "DELETE" }),
};
