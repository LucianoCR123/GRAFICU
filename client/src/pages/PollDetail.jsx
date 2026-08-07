import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext";
import { labelFor, CATEGORIES, PROFILE_FIELD_PHRASES } from "../constants";
import DemographicFilters from "../components/DemographicFilters";
import ResultsChart from "../components/ResultsChart";

export default function PollDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [poll, setPoll] = useState(null);
  const [error, setError] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedCounter, setSelectedCounter] = useState("");
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState("");

  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [resultsError, setResultsError] = useState("");
  const [filters, setFilters] = useState({ country: "", gender: "", ageBracket: "" });

  useEffect(() => {
    setPoll(null);
    setResults(null);
    setShowResults(false);
    api
      .getPoll(id)
      .then((p) => {
        setPoll(p);
        if (p.myVote) setShowResults(true);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (!showResults) return;
    setResults(null);
    api
      .getResults(id, filters)
      .then(setResults)
      .catch((err) => setResultsError(err.message));
  }, [id, showResults, filters]);

  async function handleVote(e) {
    e.preventDefault();
    setVoteError("");
    if (!selectedOption) {
      setVoteError("Elige una opción");
      return;
    }
    if (poll.counterQuestion && !selectedCounter) {
      setVoteError("Responde también la pregunta de control");
      return;
    }
    setVoting(true);
    try {
      const vote = await api.vote(id, { optionId: selectedOption, counterOptionId: selectedCounter || undefined });
      setPoll((p) => ({ ...p, myVote: vote }));
      setShowResults(true);
    } catch (err) {
      setVoteError(err.message);
    } finally {
      setVoting(false);
    }
  }

  if (error) return <div className="page error">{error}</div>;
  if (!poll) return <div className="page muted">Cargando...</div>;

  const alreadyVoted = Boolean(poll.myVote);
  const missingField = poll.requiredProfileField && user && !user[poll.requiredProfileField];

  return (
    <div className="page">
      <p>
        <Link to="/" className="muted small">
          ← Volver a encuestas
        </Link>
      </p>
      <span className="badge">{labelFor(CATEGORIES, poll.category)}</span>
      <h1>{poll.question}</h1>

      {!alreadyVoted && missingField && (
        <div className="card vote-locked-banner">
          <p className="muted small">
            Agrega {PROFILE_FIELD_PHRASES[poll.requiredProfileField]} en tu perfil para participar en
            esta encuesta.
          </p>
          <Link to="/perfil">
            <button type="button">Ir a perfil</button>
          </Link>
        </div>
      )}

      {!alreadyVoted && !missingField && (
        <form className="card" onSubmit={handleVote}>
          <div className="option-list">
            {poll.options.map((o) => (
              <label
                key={o.id}
                className={`option-row ${selectedOption === o.id ? "option-row-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="option"
                  value={o.id}
                  checked={selectedOption === o.id}
                  onChange={() => setSelectedOption(o.id)}
                />
                {o.label}
              </label>
            ))}
          </div>

          {poll.counterQuestion && (
            <div className="counter-question-box">
              <h2>{poll.counterQuestion}</h2>
              <div className="option-list">
                {poll.options.map((o) => (
                  <label
                    key={o.id}
                    className={`option-row ${selectedCounter === o.id ? "option-row-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="counter"
                      value={o.id}
                      checked={selectedCounter === o.id}
                      onChange={() => setSelectedCounter(o.id)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {voteError && <p className="error">{voteError}</p>}

          {user ? (
            <button type="submit" disabled={voting}>
              {voting ? "Votando..." : "Votar"}
            </button>
          ) : (
            <div className="vote-locked-banner">
              <p className="muted small">Necesitas una cuenta para votar.</p>
              <Link to="/registro">
                <button type="button">Crear cuenta</button>
              </Link>
            </div>
          )}
        </form>
      )}

      {alreadyVoted && <p className="success">Ya votaste en esta encuesta.</p>}

      {!showResults && (
        <button className="secondary" onClick={() => setShowResults(true)} style={{ marginTop: "1rem" }}>
          Ver resultados
        </button>
      )}

      {showResults && (
        <div style={{ marginTop: "1.6rem" }}>
          <div className="results-header">
            <h2 style={{ margin: 0 }}>Resultados</h2>
            {results && <span className="muted small">{results.totalVotes} votos totales</span>}
          </div>

          <DemographicFilters filters={filters} onChange={setFilters} />

          {resultsError && <p className="error">{resultsError}</p>}
          {!results && !resultsError && <p className="muted">Cargando resultados...</p>}

          {results && (
            <>
              <ResultsChart
                data={poll.options.map((o) => ({
                  id: o.id,
                  label: o.label,
                  percent: (results.filtered ?? results.overall).percent[o.id] ?? 0,
                }))}
                totalVotes={(results.filtered ?? results.overall).totalVotes}
              />

              {results.crosstab && (
                <div className="crosstab-stat">
                  <span className="big-number">{results.crosstab.consistencyRate}%</span>
                  <p className="muted small" style={{ margin: 0 }}>
                    de quienes respondieron ambas preguntas dieron la misma respuesta a la pregunta de
                    control ({results.crosstab.totalAnsweredBoth} personas)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
