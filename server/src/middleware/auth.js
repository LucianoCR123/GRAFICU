import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET;

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: "No autenticado" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "No autenticado" });
  }
}

// Igual que requireAuth pero no falla si no hay sesion — solo adjunta
// req.user cuando hay una cookie valida. Usado en rutas publicas que
// devuelven un extra ("myVote") cuando el visitante esta logueado.
export async function attachUserIfPresent(req, _res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return next();
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ error: "Solo administradores" });
  next();
}
