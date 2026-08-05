import { Link } from "react-router-dom";
import { labelFor, CATEGORIES } from "../constants";

export default function PollCard({ poll }) {
  return (
    <Link to={`/encuestas/${poll.id}`} className="poll-card">
      <div className="poll-card-question">{poll.question}</div>
      <div className="poll-card-meta">
        <span className="badge">{labelFor(CATEGORIES, poll.category)}</span>
        {poll.hasCounterQuestion && <span className="badge badge-counter">Pregunta de control</span>}
        <span className="muted small">{poll.totalVotes} votos</span>
      </div>
    </Link>
  );
}
