import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

function serializeCase(c) {
  return {
    id: c.id,
    title: c.title,
    body: c.body,
    sourceLinks: c.sourceLinks || [],
    pollCount: c._count?.polls,
    createdAt: c.createdAt,
  };
}

function validateSourceLinks(sourceLinks) {
  if (sourceLinks === undefined || sourceLinks === null) return null;
  if (!Array.isArray(sourceLinks)) return "sourceLinks inválido";
  for (const link of sourceLinks) {
    if (!link || typeof link.label !== "string" || typeof link.url !== "string") {
      return "Cada fuente necesita label y url";
    }
  }
  return null;
}

router.get("/", async (_req, res) => {
  const cases = await prisma.case.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { polls: true } } },
  });
  res.json(cases.map(serializeCase));
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { title, body, sourceLinks } = req.body || {};
  if (!title || !title.trim()) return res.status(400).json({ error: "Falta el título" });
  if (!body || !body.trim()) return res.status(400).json({ error: "Falta la narrativa del caso" });

  const cleanedLinks = sourceLinks?.filter((l) => l.label.trim() && l.url.trim()) || [];
  const linksError = validateSourceLinks(cleanedLinks);
  if (linksError) return res.status(400).json({ error: linksError });

  const created = await prisma.case.create({
    data: { title: title.trim(), body: body.trim(), sourceLinks: cleanedLinks.length ? cleanedLinks : null },
  });
  res.status(201).json({ id: created.id });
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { title, body, sourceLinks } = req.body || {};
  const data = {};
  if (title !== undefined) {
    if (!title.trim()) return res.status(400).json({ error: "Falta el título" });
    data.title = title.trim();
  }
  if (body !== undefined) {
    if (!body.trim()) return res.status(400).json({ error: "Falta la narrativa del caso" });
    data.body = body.trim();
  }
  if (sourceLinks !== undefined) {
    const cleanedLinks = sourceLinks?.filter((l) => l.label.trim() && l.url.trim()) || [];
    const linksError = validateSourceLinks(cleanedLinks);
    if (linksError) return res.status(400).json({ error: linksError });
    data.sourceLinks = cleanedLinks.length ? cleanedLinks : null;
  }

  await prisma.case.update({ where: { id: req.params.id }, data });
  res.json({ ok: true });
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await prisma.case.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
