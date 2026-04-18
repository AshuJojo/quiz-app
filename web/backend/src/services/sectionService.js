const prisma = require('../config/db');

// Helper to compute effective marks for a question
const resolveEffectiveMarks = (question, section, paper) => ({
  effectivePositiveMarks: question.positiveMarks ?? section.positiveMarks ?? paper.positiveMarks,
  effectiveNegativeMarks: question.negativeMarks ?? section.negativeMarks ?? paper.negativeMarks,
});

// ─── GET ALL SECTIONS FOR A PAPER ────────────────────────────────────────────
exports.getSections = async (paperId) => {
  const paper = await prisma.paper.findUnique({ where: { id: paperId } });
  if (!paper) {
    const error = new Error('Paper not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.section.findMany({
    where: { paperId },
    include: {
      _count: { select: { questions: true } },
    },
    orderBy: { order: 'asc' },
  });
};

// ─── GET SECTION BY ID ────────────────────────────────────────────────────────
exports.getSectionById = async (id) => {
  return prisma.section.findUnique({
    where: { id },
    include: {
      paper: {
        select: {
          id: true,
          title: true,
          positiveMarks: true,
          negativeMarks: true,
        },
      },
      _count: { select: { questions: true } },
    },
  });
};

// ─── CREATE SECTIONS (single or bulk) ────────────────────────────────────────
exports.createSections = async (sections) => {
  // Validate all paperIds exist
  const paperIds = [...new Set(sections.map((s) => s.paperId))];
  const papers = await prisma.paper.findMany({
    where: { id: { in: paperIds } },
    select: { id: true },
  });
  const foundIds = new Set(papers.map((p) => p.id));
  const missing = paperIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    const error = new Error(`Paper not found: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // For each paper, determine the next order value
  const orderOffsets = {};
  for (const paperId of paperIds) {
    const last = await prisma.section.findFirst({
      where: { paperId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    orderOffsets[paperId] = (last?.order ?? -1) + 1;
  }

  // Assign orders and create
  const toCreate = sections.map((s) => {
    const order = s.order ?? orderOffsets[s.paperId]++;
    return { ...s, order };
  });

  return prisma.$transaction(toCreate.map((s) => prisma.section.create({ data: s })));
};

// ─── UPDATE SECTION (single) ──────────────────────────────────────────────────
exports.updateSection = async (id, data) => {
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) {
    const error = new Error('Section not found');
    error.statusCode = 404;
    throw error;
  }
  if (section.isDefault && data.title !== undefined) {
    const error = new Error('Cannot rename the default Uncategorized section');
    error.statusCode = 400;
    throw error;
  }
  // Prevent changing isDefault flag
  delete data.isDefault;

  return prisma.section.update({ where: { id }, data });
};

// ─── BULK UPDATE SECTIONS ─────────────────────────────────────────────────────
exports.updateSections = async (updates) => {
  const ids = updates.map((u) => u.id);

  // Validate all IDs exist
  const existing = await prisma.section.findMany({
    where: { id: { in: ids } },
    select: { id: true, isDefault: true },
  });
  const foundIds = new Set(existing.map((s) => s.id));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    const error = new Error(`Invalid section ids: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // Check if any update tries to rename a default section
  const defaultIds = new Set(existing.filter((s) => s.isDefault).map((s) => s.id));
  for (const u of updates) {
    if (defaultIds.has(u.id) && u.title !== undefined) {
      const error = new Error('Cannot rename the default Uncategorized section');
      error.statusCode = 400;
      throw error;
    }
    delete u.isDefault;
  }

  return prisma.$transaction(
    updates.map(({ id, ...data }) => prisma.section.update({ where: { id }, data }))
  );
};

// ─── DELETE SECTION (single) ──────────────────────────────────────────────────
exports.deleteSection = async (id) => {
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) {
    const error = new Error('Section not found');
    error.statusCode = 404;
    throw error;
  }
  if (section.isDefault) {
    const error = new Error('Cannot delete the default Uncategorized section');
    error.statusCode = 400;
    throw error;
  }

  // Find or create the uncategorized section for this paper
  const uncategorized = await prisma.section.findFirst({
    where: { paperId: section.paperId, isDefault: true },
  });

  // Move questions to uncategorized
  if (uncategorized) {
    await prisma.question.updateMany({
      where: { sectionId: id },
      data: { sectionId: uncategorized.id },
    });
  }

  return prisma.section.delete({ where: { id } });
};

// ─── BULK DELETE SECTIONS ──────────────────────────────────────────────────────
exports.deleteSections = async (ids) => {
  const existing = await prisma.section.findMany({
    where: { id: { in: ids } },
    select: { id: true, isDefault: true, paperId: true },
  });
  const foundIds = new Set(existing.map((s) => s.id));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    const error = new Error(`Invalid section ids: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const defaultSection = existing.find((s) => s.isDefault);
  if (defaultSection) {
    const error = new Error('Cannot delete the default Uncategorized section');
    error.statusCode = 400;
    throw error;
  }

  // For each affected paper, find its uncategorized section and move questions
  const paperIds = [...new Set(existing.map((s) => s.paperId))];
  const uncategorizedSections = await prisma.section.findMany({
    where: { paperId: { in: paperIds }, isDefault: true },
    select: { id: true, paperId: true },
  });
  const uncategorizedMap = Object.fromEntries(uncategorizedSections.map((s) => [s.paperId, s.id]));

  await prisma.$transaction(async (tx) => {
    for (const section of existing) {
      const uncategorizedId = uncategorizedMap[section.paperId];
      if (uncategorizedId) {
        await tx.question.updateMany({
          where: { sectionId: section.id },
          data: { sectionId: uncategorizedId },
        });
      }
    }
    await tx.section.deleteMany({ where: { id: { in: ids } } });
  });
};
