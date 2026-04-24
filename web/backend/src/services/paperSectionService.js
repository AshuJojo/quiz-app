const prisma = require('../config/db');

// Get all sections in a paper, ordered by PaperSection.order
exports.getPaperSections = async (paperId) => {
  const paper = await prisma.paper.findUnique({ where: { id: paperId } });
  if (!paper) {
    const error = new Error('Paper not found');
    error.statusCode = 404;
    throw error;
  }

  const paperSections = await prisma.paperSection.findMany({
    where: { paperId },
    include: { section: true },
    orderBy: { order: 'asc' },
  });

  return paperSections.map((ps) => ({
    ...ps.section,
    order: ps.order,
    paperSectionId: ps.id,
  }));
};

// Add sections to a paper
exports.addSectionsToPaper = async (paperId, sectionIds) => {
  const paper = await prisma.paper.findUnique({ where: { id: paperId } });
  if (!paper) {
    const error = new Error('Paper not found');
    error.statusCode = 404;
    throw error;
  }

  // Validate sections exist and belong to the paper's exam
  const sections = await prisma.section.findMany({
    where: { id: { in: sectionIds } },
    select: { id: true, examId: true },
  });

  if (sections.length !== sectionIds.length) {
    const foundIds = new Set(sections.map((s) => s.id));
    const missing = sectionIds.filter((id) => !foundIds.has(id));
    const error = new Error(`Section not found: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (paper.examId) {
    const invalid = sections.filter((s) => s.examId !== paper.examId);
    if (invalid.length > 0) {
      const error = new Error(
        `Sections do not belong to the paper's exam: ${invalid.map((s) => s.id).join(', ')}`
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Skip already-added sections
  const existing = await prisma.paperSection.findMany({
    where: { paperId, sectionId: { in: sectionIds } },
    select: { sectionId: true },
  });
  const existingIds = new Set(existing.map((ps) => ps.sectionId));
  const toAdd = sectionIds.filter((id) => !existingIds.has(id));
  if (toAdd.length === 0) return [];

  const maxOrder = await prisma.paperSection.findFirst({
    where: { paperId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });
  let nextOrder = (maxOrder?.order ?? -1) + 1;

  return prisma.$transaction(
    toAdd.map((sectionId) =>
      prisma.paperSection.create({
        data: { paperId, sectionId, order: nextOrder++ },
        include: { section: true },
      })
    )
  );
};

// Remove a section from a paper (also deletes questions in that section for this paper)
exports.removeSectionFromPaper = async (paperId, sectionId) => {
  const ps = await prisma.paperSection.findUnique({
    where: { paperId_sectionId: { paperId, sectionId } },
  });
  if (!ps) {
    const error = new Error('Section not found in paper');
    error.statusCode = 404;
    throw error;
  }

  await prisma.$transaction([
    prisma.question.deleteMany({ where: { paperId, sectionId } }),
    prisma.paperSection.delete({ where: { paperId_sectionId: { paperId, sectionId } } }),
  ]);
};

// Reorder sections within a paper
exports.reorderPaperSections = async (paperId, updates) => {
  const paper = await prisma.paper.findUnique({ where: { id: paperId } });
  if (!paper) {
    const error = new Error('Paper not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.$transaction(
    updates.map(({ sectionId, order }) =>
      prisma.paperSection.update({
        where: { paperId_sectionId: { paperId, sectionId } },
        data: { order },
      })
    )
  );
};
