import { useEffect, useState } from "react";
import CategoryChips from "./CategoryChips";
import FeedCard from "./FeedCard";
import { api } from "../api";

// mode: "home" (mas recientes) | "trending" (mas votadas en los ultimos 7 dias)
export default function SwipeFeed({ mode }) {
  const [category, setCategory] = useState("");
  const [polls, setPolls] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPolls(null);
    api
      .listPolls({ category, sort: mode === "trending" ? "trending" : undefined })
      .then(setPolls)
      .catch((err) => setError(err.message));
  }, [category, mode]);

  return (
    <div className="swipe-feed">
      <div className="swipe-feed-chips">
        <CategoryChips value={category} onChange={setCategory} />
      </div>

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
            <div className="empty-state">Todavía no hay encuestas en esta categoría.</div>
          </div>
        )}

        {polls?.map((poll) => (
          <FeedCard key={poll.id} poll={poll} />
        ))}
      </div>
    </div>
  );
}
