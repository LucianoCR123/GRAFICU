import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, attachUserIfPresent } from "../middleware/auth.js";
import { CATEGORIES } from "../utils/constants.js";
import { aggregatePollResults } from "../utils/results.js";

const router = Router();

function serializePoll(poll, { myVote } = {}) {
  return {
    id: poll.id,
    category: poll.category,
    question: poll.question,
    counterQuestion: poll.counterQuestion,
    requiredProfileField: poll.requiredProfileField,
    hasCounterQuestion: Boolean(poll.counterQuestion),
    totalVotes: poll._count.votes,
    createdAt: poll.createdAt,
    options: poll.options.map((o) => ({ id: o.id, label: o.label })),
    myVote: myVote ?? null,
  };
}

router.get("/", attachUserIfPresent, async (req, res) => {
  const { category, sort } = req.query;
  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Categoría inválida" });
  }

  const polls = await prisma.poll.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      _count: { select: { votes: true } },
    },
  });

  if (sort === "trending") {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentVotes = await prisma.vote.groupBy({
      by: ["pollId"],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: true,
    });
    const trendCount = Object.fromEntries(recentVotes.map((v) => [v.pollId, v._count]));
    polls.sort((a, b) => (trendCount[b.id] || 0) - (trendCount[a.id] || 0));
  }

  let myVotes = {};
  if (req.user) {
    const votes = await prisma.vote.findMany({
      where: { userId: req.user.id, pollId: { in: polls.map((p) => p.id) } },
    });
    myVotes = Object.fromEntries(
      votes.map((v) => [v.pollId, { optionId: v.optionId, counterOptionId: v.counterOptionId }])
    );
  }

  res.json(polls.map((p) => serializePoll(p, { myVote: myVotes[p.id] })));
});

router.get("/mine", requireAuth, async (req, res) => {
  const votes = await prisma.vote.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      poll: { select: { id: true, question: true, category: true, counterQuestion: true } },
      option: { select: { label: true } },
      counterOption: { select: { label: true } },
    },
  });

  res.json(
    votes.map((v) => ({
      pollId: v.poll.id,
      question: v.poll.question,
      category: v.poll.category,
      myAnswer: v.option.label,
      myCounterAnswer: v.counterOption?.label ?? null,
      votedAt: v.createdAt,
    }))
  );
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

  res.json(serializePoll(poll, { myVote }));
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

  if (poll.requiredProfileField && !req.user[poll.requiredProfileField]) {
    return res.status(403).json({
      error: "Te falta completar un campo de tu perfil para votar en esta encuesta",
      requiredProfileField: poll.requiredProfileField,
    });
  }

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
