import { useEffect, useState } from "react";
import CategoryChips from "../components/CategoryChips";
import PollCard from "../components/PollCard";
import { api } from "../api";

export default function Feed() {
  const [category, setCategory] = useState("");
  const [polls, setPolls] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setPolls(null);
    api
      .listPolls(category)
      .then(setPolls)
      .catch((err) => setError(err.message));
  }, [category]);

  return (
    <div className="page">
      <h1>Encuestas</h1>
      <p className="muted">Vota qué opina la gente en el mundo — sin cuenta puedes explorar, para votar sí la necesitas.</p>
      <CategoryChips value={category} onChange={setCategory} />
      {error && <p className="error">{error}</p>}
      {!polls && !error && <p className="muted">Cargando...</p>}
      {polls && polls.length === 0 && <div className="empty-state">Todavía no hay encuestas en esta categoría.</div>}
      {polls && polls.length > 0 && (
        <div className="poll-list">
          {polls.map((p) => (
            <PollCard key={p.id} poll={p} />
          ))}
        </div>
      )}
    </div>
  );
}
