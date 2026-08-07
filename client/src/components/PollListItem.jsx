import { Link } from "react-router-dom";
import { labelFor, CATEGORIES } from "../constants";

export default function PollListItem({ poll }) {
  return (
    <Link to={`/encuestas/${poll.id}`} className="poll-list-item">
      <div className="poll-list-item-question">{poll.question}</div>
      <div className="poll-list-item-meta">
        <span className="badge">{labelFor(CATEGORIES, poll.category)}</span>
        {poll.hasCounterQuestion && <span className="badge badge-counter">Pregunta de control</span>}
        {poll.case && <span className="badge badge-case">Caso: {poll.case.title}</span>}
        <span className="muted small">{poll.totalVotes} votos</span>
      </div>
    </Link>
  );
}
