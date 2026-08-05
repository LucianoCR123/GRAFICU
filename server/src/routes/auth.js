import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { signToken, requireAuth } from "../middleware/auth.js";
import {
  GENDERS,
  EDUCATION,
  RELATIONSHIP_STATUS,
  SEXUALITY,
  POLITICAL_LEANING,
  RELIGION,
} from "../utils/constants.js";

const router = Router();

const isProd = process.env.NODE_ENV === "production";
const CURRENT_YEAR = new Date().getFullYear();

function setAuthCookie(res, userId) {
  const token = signToken(userId);
  res.cookie("token", token, {
    httpOnly: true,
    // El frontend le habla a Vercel, que reenvia /api/* a Render por detras
    // (ver client/vercel.json) — para el navegador todo es el mismo dominio,
    // asi que "lax" alcanza y evita que Safari/ITP bloquee la cookie como
    // si fuera de un tercero. "secure" solo en produccion (todo por https).
    sameSite: "lax",
    secure: isProd,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
    gender: user.gender,
    birthYear: user.birthYear,
    country: user.country,
    occupation: user.occupation,
    education: user.education,
    relationshipStatus: user.relationshipStatus,
    sexuality: user.sexuality,
    politicalLeaning: user.politicalLeaning,
    religion: user.religion,
    createdAt: user.createdAt,
  };
}

router.post("/register", async (req, res) => {
  const { email, password, gender, birthYear, country } = req.body || {};

  if (!email || !password || !gender || !birthYear || !country) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }
  if (!GENDERS.includes(gender)) {
    return res.status(400).json({ error: "Género inválido" });
  }
  const year = Number(birthYear);
  if (!Number.isInteger(year) || year < 1900 || year > CURRENT_YEAR - 13) {
    return res.status(400).json({ error: "Año de nacimiento inválido" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Ese email ya está registrado" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, gender, birthYear: year, country },
  });

  setAuthCookie(res, user.id);
  res.status(201).json(serializeUser(user));
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Faltan credenciales" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

  setAuthCookie(res, user.id);
  res.json(serializeUser(user));
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json(serializeUser(req.user));
});

router.patch("/profile", requireAuth, async (req, res) => {
  const {
    gender,
    birthYear,
    country,
    occupation,
    education,
    relationshipStatus,
    sexuality,
    politicalLeaning,
    religion,
  } = req.body || {};

  const data = {};

  if (gender !== undefined) {
    if (!GENDERS.includes(gender)) return res.status(400).json({ error: "Género inválido" });
    data.gender = gender;
  }
  if (birthYear !== undefined) {
    const year = Number(birthYear);
    if (!Number.isInteger(year) || year < 1900 || year > CURRENT_YEAR - 13) {
      return res.status(400).json({ error: "Año de nacimiento inválido" });
    }
    data.birthYear = year;
  }
  if (typeof country === "string" && country) data.country = country;

  const optionalFields = [
    ["occupation", null], // texto libre, sin lista de valores
    ["education", EDUCATION],
    ["relationshipStatus", RELATIONSHIP_STATUS],
    ["sexuality", SEXUALITY],
    ["politicalLeaning", POLITICAL_LEANING],
    ["religion", RELIGION],
  ];
  const body = { occupation, education, relationshipStatus, sexuality, politicalLeaning, religion };
  for (const [field, validValues] of optionalFields) {
    const value = body[field];
    if (value === undefined) continue;
    if (value === null || value === "") {
      data[field] = null;
      continue;
    }
    if (validValues && !validValues.includes(value)) {
      return res.status(400).json({ error: `Valor inválido para ${field}` });
    }
    data[field] = value;
  }

  const user = await prisma.user.update({ where: { id: req.user.id }, data });
  res.json(serializeUser(user));
});

router.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Faltan campos" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
  }

  const ok = await bcrypt.compare(currentPassword, req.user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Contraseña actual incorrecta" });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
  res.json({ ok: true });
});

router.delete("/me", requireAuth, async (req, res) => {
  await prisma.user.delete({ where: { id: req.user.id } });
  res.clearCookie("token");
  res.json({ ok: true });
});

export default router;
