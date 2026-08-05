import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, attachUserIfPresent } from "../middleware/auth.js";
import { CATEGORIES } from "../utils/constants.js";
import { aggregatePollResults } from "../utils/results.js";

const router = Router();

function serializePollSummary(poll) {
  return {
    id: poll.id,
    category: poll.category,
    question: poll.question,
    hasCounterQuestion: Boolean(poll.counterQuestion),
    totalVotes: poll._count.votes,
    createdAt: poll.createdAt,
  };
}

router.get("/", async (req, res) => {
  const { category } = req.query;
  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Categoría inválida" });
  }

  const polls = await prisma.poll.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { votes: true } } },
  });

  res.json(polls.map(serializePollSummary));
});

router.get("/:id", attachUserIfPresent, async (req, res) => {
  const poll = await prisma.poll.findUnique({
    where: { id: req.params.id },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      _count: { select: { votes: true } },
    },
  });
  if (!poll) return res.status(404).json({ error: "Encuesta no encontrada" });

  let myVote = null;
  if (req.user) {
    const vote = await prisma.vote.findUnique({
      where: { pollId_userId: { pollId: poll.id, userId: req.user.id } },
    });
    if (vote) myVote = { optionId: vote.optionId, counterOptionId: vote.counterOptionId };
  }

  res.json({
    id: poll.id,
    category: poll.category,
    question: poll.question,
    counterQuestion: poll.counterQuestion,
    createdAt: poll.createdAt,
    totalVotes: poll._count.votes,
    options: poll.options.map((o) => ({ id: o.id, label: o.label })),
    myVote,
  });
});

router.get("/:id/results", async (req, res) => {
  const poll = await prisma.poll.findUnique({
    where: { id: req.params.id },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });
  if (!poll) return res.status(404).json({ error: "Encuesta no encontrada" });

  // ANONIMATO: solo seleccionamos atributos demograficos del usuario, nunca
  // id/email/passwordHash — este query nunca debe exponer identidad.
  const votes = await prisma.vote.findMany({
    where: { pollId: poll.id },
    select: {
      optionId: true,
      counterOptionId: true,
      user: { select: { gender: true, birthYear: true, country: true } },
    },
  });

  const { country, gender, ageBracket } = req.query;
  const results = aggregatePollResults(poll, votes, { country, gender, ageBracket });

  res.json({
    poll: {
      id: poll.id,
      question: poll.question,
      category: poll.category,
      counterQuestion: poll.counterQuestion,
      options: poll.options.map((o) => ({ id: o.id, label: o.label })),
    },
    ...results,
  });
});

router.post("/:id/votes", requireAuth, async (req, res) => {
  const { optionId, counterOptionId } = req.body || {};
  if (!optionId) return res.status(400).json({ error: "Falta la opción elegida" });

  if (!req.user.gender || !req.user.birthYear || !req.user.country) {
    return res.status(403).json({ error: "Completa tu perfil antes de votar" });
  }

  const poll = await prisma.poll.findUnique({
    where: { id: req.params.id },
    include: { options: true },
  });
  if (!poll) return res.status(404).json({ error: "Encuesta no encontrada" });

  const validOptionIds = new Set(poll.options.map((o) => o.id));
  if (!validOptionIds.has(optionId)) {
    return res.status(400).json({ error: "Opción inválida" });
  }
  if (poll.counterQuestion) {
    if (!counterOptionId || !validOptionIds.has(counterOptionId)) {
      return res.status(400).json({ error: "Falta la respuesta a la pregunta de control" });
    }
  }

  try {
    const vote = await prisma.vote.create({
      data: {
        pollId: poll.id,
        userId: req.user.id,
        optionId,
        counterOptionId: poll.counterQuestion ? counterOptionId : null,
      },
    });
    res.status(201).json({ optionId: vote.optionId, counterOptionId: vote.counterOptionId });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Ya votaste en esta encuesta" });
    }
    throw err;
  }
});

export default router;
