const prisma = require('../config/db');

// ─── MARKS INHERITANCE HELPER ─────────────────────────────────────────────────
const resolveEffectiveMarks = (question, section, paper) => ({
  effectivePositiveMarks: question.positiveMarks ?? section.positiveMarks ?? paper.positiveMarks,
  effectiveNegativeMarks: question.negativeMarks ?? section.negativeMarks ?? paper.negativeMarks,
});

// ─── GET ALL QUESTIONS FOR A PAPER ───────────────────────────────────────────
exports.getQuestions = async (paperId) => {
  const paper = await prisma.paper.findUnique({ where: { id: paperId } });
  if (!paper) {
    const error = new Error('Paper not found');
    error.statusCode = 404;
    throw error;
  }

  const questions = await prisma.question.findMany({
    where: { paperId },
    include: {
      section: {
        select: { id: true, title: true, order: true, positiveMarks: true, negativeMarks: true },
      },
    },
    orderBy: [{ section: { order: 'asc' } }, { order: 'asc' }],
  });

  return questions.map((q) => ({
    ...q,
    ...resolveEffectiveMarks(q, q.section, paper),
  }));
};

// ─── GET QUESTION BY ID ───────────────────────────────────────────────────────
exports.getQuestionById = async (id) => {
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      section: {
        select: { id: true, title: true, positiveMarks: true, negativeMarks: true },
      },
      paper: {
        select: { id: true, title: true, positiveMarks: true, negativeMarks: true },
      },
    },
  });

  if (!question) return null;

  return {
    ...question,
    ...resolveEffectiveMarks(question, question.section, question.paper),
  };
};

// ─── CREATE QUESTIONS (single or bulk, mixed sectionIds) ─────────────────────
exports.createQuestions = async (questions) => {
  // Collect unique paperIds and sectionIds
  const paperIds = [...new Set(questions.map((q) => q.paperId))];
  const sectionIds = [...new Set(questions.map((q) => q.sectionId))];

  // Validate all papers exist
  const papers = await prisma.paper.findMany({
    where: { id: { in: paperIds } },
    select: { id: true },
  });
  const foundPaperIds = new Set(papers.map((p) => p.id));
  const missingPapers = paperIds.filter((id) => !foundPaperIds.has(id));
  if (missingPapers.length > 0) {
    const error = new Error(`Paper not found: ${missingPapers.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // Validate all sections exist and belong to the correct paper
  const sections = await prisma.section.findMany({
    where: { id: { in: sectionIds } },
    select: { id: true, paperId: true },
  });
  const sectionMap = Object.fromEntries(sections.map((s) => [s.id, s.paperId]));
  const missingSections = sectionIds.filter((id) => !sectionMap[id]);
  if (missingSections.length > 0) {
    const error = new Error(`Section not found: ${missingSections.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // Validate paperId ↔ sectionId match
  for (const q of questions) {
    if (sectionMap[q.sectionId] !== q.paperId) {
      const error = new Error(`Section ${q.sectionId} does not belong to paper ${q.paperId}`);
      error.statusCode = 400;
      throw error;
    }
  }

  // Auto-assign order: append after last in each section
  const orderOffsets = {};
  for (const sectionId of sectionIds) {
    const last = await prisma.question.findFirst({
      where: { sectionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    orderOffsets[sectionId] = (last?.order ?? -1) + 1;
  }

  const toCreate = questions.map((q) => ({
    ...q,
    order: q.order ?? orderOffsets[q.sectionId]++,
  }));

  return prisma.$transaction(toCreate.map((q) => prisma.question.create({ data: q })));
};

// ─── UPDATE QUESTION (single) ─────────────────────────────────────────────────
exports.updateQuestion = async (id, data) => {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) {
    const error = new Error('Question not found');
    error.statusCode = 404;
    throw error;
  }

  // If sectionId is being changed, validate it belongs to the same paper
  if (data.sectionId) {
    const section = await prisma.section.findUnique({
      where: { id: data.sectionId },
      select: { paperId: true },
    });
    if (!section) {
      const error = new Error('Section not found');
      error.statusCode = 400;
      throw error;
    }
    if (section.paperId !== question.paperId) {
      const error = new Error('Section does not belong to the same paper');
      error.statusCode = 400;
      throw error;
    }
  }

  return prisma.question.update({ where: { id }, data });
};

// ─── BULK UPDATE QUESTIONS ────────────────────────────────────────────────────
exports.updateQuestions = async (updates) => {
  const ids = updates.map((u) => u.id);

  const existing = await prisma.question.findMany({
    where: { id: { in: ids } },
    select: { id: true, paperId: true },
  });
  const foundIds = new Set(existing.map((q) => q.id));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    const error = new Error(`Invalid question ids: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const paperMap = Object.fromEntries(existing.map((q) => [q.id, q.paperId]));

  // Validate any sectionId changes
  const sectionChanges = updates.filter((u) => u.sectionId);
  if (sectionChanges.length > 0) {
    const sectionIds = [...new Set(sectionChanges.map((u) => u.sectionId))];
    const sections = await prisma.section.findMany({
      where: { id: { in: sectionIds } },
      select: { id: true, paperId: true },
    });
    const sectionMap = Object.fromEntries(sections.map((s) => [s.id, s.paperId]));
    for (const u of sectionChanges) {
      if (!sectionMap[u.sectionId]) {
        const error = new Error(`Section not found: ${u.sectionId}`);
        error.statusCode = 400;
        throw error;
      }
      if (sectionMap[u.sectionId] !== paperMap[u.id]) {
        const error = new Error(
          `Section ${u.sectionId} does not belong to the same paper as question ${u.id}`
        );
        error.statusCode = 400;
        throw error;
      }
    }
  }

  return prisma.$transaction(
    updates.map(({ id, ...data }) => prisma.question.update({ where: { id }, data }))
  );
};

// ─── DELETE QUESTION (single) ─────────────────────────────────────────────────
exports.deleteQuestion = async (id) => {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) {
    const error = new Error('Question not found');
    error.statusCode = 404;
    throw error;
  }
  return prisma.question.delete({ where: { id } });
};

// ─── BULK DELETE QUESTIONS ────────────────────────────────────────────────────
exports.deleteQuestions = async (ids) => {
  const existing = await prisma.question.count({
    where: { id: { in: ids } },
  });
  if (existing !== ids.length) {
    const error = new Error('Invalid question ids');
    error.statusCode = 400;
    throw error;
  }
  return prisma.question.deleteMany({ where: { id: { in: ids } } });
};
