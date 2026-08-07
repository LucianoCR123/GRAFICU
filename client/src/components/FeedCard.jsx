import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { labelFor, CATEGORIES, CATEGORY_EMOJI, PROFILE_FIELD_PHRASES } from "../constants";
import ResultsChart from "./ResultsChart";

export default function FeedCard({ poll }) {
  const { user } = useAuth();
  const [myVote, setMyVote] = useState(poll.myVote);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [results, setResults] = useState(null);

  const hasVoted = Boolean(myVote);
  const missingField = poll.requiredProfileField && user && !user[poll.requiredProfileField];
  const canVoteInline = user && !poll.hasCounterQuestion && !missingField;

  useEffect(() => {
    if (!hasVoted) return;
    api
      .getResults(poll.id)
      .then(setResults)
      .catch(() => {});
  }, [hasVoted, poll.id]);

  async function handleVote(optionId) {
    setVoteError("");
    setVoting(true);
    try {
      const vote = await api.vote(poll.id, { optionId });
      setMyVote(vote);
    } catch (err) {
      setVoteError(err.message);
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="feed-card">
      <div className="feed-card-emoji-bg" aria-hidden="true">
        {CATEGORY_EMOJI[poll.category]}
      </div>

      <div className="feed-card-badges">
        <span className="badge">{labelFor(CATEGORIES, poll.category)}</span>
        {poll.hasCounterQuestion && <span className="badge badge-counter">Pregunta de control</span>}
      </div>

      <div className="feed-card-question">{poll.question}</div>

      {!hasVoted && !user && (
        <div className="vote-locked-banner">
          <p className="muted small">Inicia sesión para votar.</p>
          <Link to="/login">
            <button type="button">Entrar</button>
          </Link>
        </div>
      )}

      {!hasVoted && user && missingField && (
        <div className="vote-locked-banner">
          <p className="muted small">
            Agrega {PROFILE_FIELD_PHRASES[poll.requiredProfileField]} en tu perfil para participar.
          </p>
          <Link to="/perfil">
            <button type="button">Ir a perfil</button>
          </Link>
        </div>
      )}

      {!hasVoted && canVoteInline && (
        <div className="option-list">
          {poll.options.map((o) => (
            <button
              key={o.id}
              type="button"
              className="option-row"
              disabled={voting}
              onClick={() => handleVote(o.id)}
              style={{ textAlign: "left", background: "var(--surface)", color: "var(--text)" }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      {!hasVoted && user && !missingField && poll.hasCounterQuestion && (
        <Link to={`/encuestas/${poll.id}`}>
          <button type="button">Responder (tiene pregunta de control)</button>
        </Link>
      )}

      {voteError && <p className="error">{voteError}</p>}

      {hasVoted && (
        <div>
          <ResultsChart
            compact
            data={poll.options.map((o) => ({
              id: o.id,
              label: o.label,
              percent: results?.overall.percent[o.id] ?? 0,
            }))}
            totalVotes={results?.totalVotes ?? poll.totalVotes}
          />
          <div className="feed-card-footer">
            <span className="muted small">{results?.totalVotes ?? poll.totalVotes} votos</span>
            <Link to={`/encuestas/${poll.id}`} className="small">
              Ver detalle completo →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
