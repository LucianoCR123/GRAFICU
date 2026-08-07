import { useEffect, useState } from "react";
import FeedCard from "./FeedCard";
import { api } from "../api";

// mode: "home" (mas recientes) | "trending" (mas votadas en los ultimos 7 dias)
// Sin filtro de categoria aqui a proposito — eso vive en la pestana
// Categorias (con buscador). Este feed siempre mezcla todas las categorias.
export default function SwipeFeed({ mode }) {
  const [polls, setPolls] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPolls(null);
    api
      .listPolls({ sort: mode === "trending" ? "trending" : undefined })
      .then(setPolls)
      .catch((err) => setError(err.message));
  }, [mode]);

  return (
    <div className="swipe-feed-scroll">
      {error && (
        <div className="feed-card">
          <p className="error">{error}</p>
        </div>
      )}

      {!polls && !error && (
        <div className="feed-card">
          <p className="muted">Cargando...</p>
        </div>
      )}

      {polls && polls.length === 0 && (
        <div className="feed-card">
          <div className="empty-state">Todavía no hay encuestas.</div>
        </div>
      )}

      {polls?.map((poll) => (
        <FeedCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
}
