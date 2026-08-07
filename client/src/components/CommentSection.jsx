import { useEffect, useState } from "react";
import { api } from "../api";

export default function CommentSection({ pollId, canComment }) {
  const [comments, setComments] = useState(null);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  function reload() {
    api
      .getComments(pollId)
      .then(setComments)
      .catch((err) => setError(err.message));
  }

  useEffect(reload, [pollId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    setError("");
    try {
      await api.postComment(pollId, text.trim());
      setText("");
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div style={{ marginTop: "1.6rem" }}>
      <h2>Comentarios</h2>
      <p className="muted small">
        Anónimos: se muestra un código, no tu perfil — solo tú sabes que ese eres tú.
      </p>

      {canComment ? (
        <form className="comment-form" onSubmit={handleSubmit} style={{ margin: "1rem 0" }}>
          <textarea
            rows={2}
            placeholder="Comparte tu opinión..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
          />
          <button type="submit" disabled={posting || !text.trim()}>
            {posting ? "..." : "Comentar"}
          </button>
        </form>
      ) : (
        <p className="muted small">Vota para poder comentar.</p>
      )}

      {error && <p className="error">{error}</p>}
      {!comments && !error && <p className="muted small">Cargando comentarios...</p>}
      {comments && comments.length === 0 && <p className="muted small">Todavía no hay comentarios.</p>}

      {comments && comments.length > 0 && (
        <div className="comment-list">
          {comments.map((c) => (
            <div className="comment-row" key={c.id}>
              <div className="comment-meta">
                {c.code} {c.votedFor && `· votó "${c.votedFor}"`}
              </div>
              <p className="comment-body">{c.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
