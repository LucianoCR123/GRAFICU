import crypto from "crypto";

// Codigo anonimo estable por (usuario, encuesta) — permite reconocer al
// mismo comentarista dentro del hilo de UNA encuesta sin exponer su
// identidad, y sin poder correlacionarlo con sus comentarios en otras
// encuestas. No es reversible sin JWT_SECRET.
export function anonCode(userId, pollId) {
  return crypto
    .createHash("sha256")
    .update(`${userId}:${pollId}:${process.env.JWT_SECRET}`)
    .digest("hex")
    .slice(0, 10)
    .toUpperCase();
}
