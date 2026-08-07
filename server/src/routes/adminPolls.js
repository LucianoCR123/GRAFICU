import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { CATEGORIES, PROFILE_FIELDS } from "../utils/constants.js";

const router = Router();
router.use(requireAuth, requireAdmin);

function validateOptions(options) {
  if (!Array.isArray(options)) return "Faltan las opciones";
  const cleaned = options.map((o) => (typeof o === "string" ? o.trim() : "")).filter(Boolean);
  if (cleaned.length < 2) return "Se necesitan al menos 2 opciones";
  return null;
}

router.post("/", async (req, res) => {
  const { category, question, options, counterQuestion, requiredProfileField } = req.body || {};

  if (!category || !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Categoría inválida" });
  }
  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Falta la pregunta" });
  }
  if (requiredProfileField && !PROFILE_FIELDS.includes(requiredProfileField)) {
    return res.status(400).json({ error: "Campo de perfil requerido inválido" });
  }
  const optionsError = validateOptions(options);
  if (optionsError) return res.status(400).json({ error: optionsError });

  const cleanedOptions = options.map((o) => o.trim()).filter(Boolean);

  const poll = await prisma.$transaction(async (tx) => {
    const created = await tx.poll.create({
      data: {
        category,
        question: question.trim(),
        counterQuestion: counterQuestion?.trim() || null,
        requiredProfileField: requiredProfileField || null,
      },
    });
    await tx.pollOption.createMany({
      data: cleanedOptions.map((label, index) => ({ pollId: created.id, label, sortOrder: index })),
    });
    return created;
  });

  res.status(201).json({ id: poll.id });
});

router.patch("/:id", async (req, res) => {
  const { category, question, counterQuestion, options, requiredProfileField } = req.body || {};

  const poll = await prisma.poll.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { votes: true } } },
  });
  if (!poll) return res.status(404).json({ error: "Encuesta no encontrada" });

  const data = {};
  if (category !== undefined) {
    if (!CATEGORIES.includes(category)) return res.status(400).json({ error: "Categoría inválida" });
    data.category = category;
  }
  if (question !== undefined) {
    if (!question.trim()) return res.status(400).json({ error: "Falta la pregunta" });
    data.question = question.trim();
  }
  if (counterQuestion !== undefined) {
    data.counterQuestion = counterQuestion?.trim() || null;
  }
  if (requiredProfileField !== undefined) {
    if (requiredProfileField && !PROFILE_FIELDS.includes(requiredProfileField)) {
      return res.status(400).json({ error: "Campo de perfil requerido inválido" });
    }
    data.requiredProfileField = requiredProfileField || null;
  }

  if (options !== undefined) {
    if (poll._count.votes > 0) {
      return res.status(409).json({ error: "No se pueden editar las opciones de una encuesta con votos" });
    }
    const optionsError = validateOptions(options);
    if (optionsError) return res.status(400).json({ error: optionsError });
    const cleanedOptions = options.map((o) => o.trim()).filter(Boolean);

    await prisma.$transaction(async (tx) => {
      await tx.poll.update({ where: { id: poll.id }, data });
      await tx.pollOption.deleteMany({ where: { pollId: poll.id } });
      await tx.pollOption.createMany({
        data: cleanedOptions.map((label, index) => ({ pollId: poll.id, label, sortOrder: index })),
      });
    });
    return res.json({ ok: true });
  }

  await prisma.poll.update({ where: { id: poll.id }, data });
  res.json({ ok: true });
});

router.delete("/:id", async (req, res) => {
  await prisma.poll.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
