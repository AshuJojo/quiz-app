const prisma = require('../config/db');

const resolveEffectiveMarks = (question, paper) => ({
  effectivePositiveMarks: question.positiveMarks ?? paper.positiveMarks,
  effectiveNegativeMarks: question.negativeMarks ?? paper.negativeMarks,
});

exports.getQuestions = async (paperId) => {
  const paper = await prisma.paper.findUnique({ where: { id: paperId } });
  if (!paper) {
    const error = new Error('Paper not found');
    error.statusCode = 404;
    throw error;
  }

  // Get section ordering for this paper
  const paperSections = await prisma.paperSection.findMany({
    where: { paperId },
    orderBy: { order: 'asc' },
    select: { sectionId: true, order: true },
  });
  const sectionOrderMap = Object.fromEntries(paperSections.map((ps) => [ps.sectionId, ps.order]));

  const questions = await prisma.question.findMany({
    where: { paperId },
    include: { section: { select: { id: true, title: true } } },
    orderBy: { order: 'asc' },
  });

  const sorted = [...questions].sort((a, b) => {
    const aOrder = sectionOrderMap[a.sectionId] ?? 999;
    const bOrder = sectionOrderMap[b.sectionId] ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.order - b.order;
  });

  return sorted.map((q) => ({ ...q, ...resolveEffectiveMarks(q, paper) }));
};

exports.getQuestionById = async (id) => {
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      section: { select: { id: true, title: true } },
      paper: { select: { id: true, title: true, positiveMarks: true, negativeMarks: true } },
    },
  });
  if (!question) return null;
  return { ...question, ...resolveEffectiveMarks(question, question.paper) };
};

exports.createQuestions = async (questions) => {
  const paperIds = [...new Set(questions.map((q) => q.paperId))];
  const sectionIds = [...new Set(questions.map((q) => q.sectionId))];

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

  const sections = await prisma.section.findMany({
    where: { id: { in: sectionIds } },
    select: { id: true },
  });
  const foundSectionIds = new Set(sections.map((s) => s.id));
  const missingSections = sectionIds.filter((id) => !foundSectionIds.has(id));
  if (missingSections.length > 0) {
    const error = new Error(`Section not found: ${missingSections.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  // Validate each (paperId, sectionId) pair exists in PaperSection
  const pairs = questions.map((q) => ({ paperId: q.paperId, sectionId: q.sectionId }));
  const uniquePairs = [...new Map(pairs.map((p) => [`${p.paperId}:${p.sectionId}`, p])).values()];
  const paperSections = await prisma.paperSection.findMany({
    where: { OR: uniquePairs.map(({ paperId, sectionId }) => ({ paperId, sectionId })) },
    select: { paperId: true, sectionId: true },
  });
  const validPairs = new Set(paperSections.map((ps) => `${ps.paperId}:${ps.sectionId}`));
  for (const q of questions) {
    if (!validPairs.has(`${q.paperId}:${q.sectionId}`)) {
      const error = new Error(`Section ${q.sectionId} is not in paper ${q.paperId}`);
      error.statusCode = 400;
      throw error;
    }
  }

  // Auto-assign order
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

exports.updateQuestion = async (id, data) => {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) {
    const error = new Error('Question not found');
    error.statusCode = 404;
    throw error;
  }

  if (data.sectionId && data.sectionId !== question.sectionId) {
    const ps = await prisma.paperSection.findUnique({
      where: { paperId_sectionId: { paperId: question.paperId, sectionId: data.sectionId } },
    });
    if (!ps) {
      const error = new Error(`Section ${data.sectionId} is not in paper ${question.paperId}`);
      error.statusCode = 400;
      throw error;
    }
  }

  return prisma.question.update({ where: { id }, data });
};

exports.updateQuestions = async (updates) => {
  const ids = updates.map((u) => u.id);

  const existing = await prisma.question.findMany({
    where: { id: { in: ids } },
    select: { id: true, paperId: true, sectionId: true },
  });
  const foundIds = new Set(existing.map((q) => q.id));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    const error = new Error(`Invalid question ids: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const paperMap = Object.fromEntries(existing.map((q) => [q.id, q.paperId]));

  const sectionChanges = updates.filter((u) => u.sectionId);
  if (sectionChanges.length > 0) {
    const pairs = sectionChanges.map((u) => ({ paperId: paperMap[u.id], sectionId: u.sectionId }));
    const uniquePairs = [...new Map(pairs.map((p) => [`${p.paperId}:${p.sectionId}`, p])).values()];
    const paperSections = await prisma.paperSection.findMany({
      where: { OR: uniquePairs.map(({ paperId, sectionId }) => ({ paperId, sectionId })) },
      select: { paperId: true, sectionId: true },
    });
    const validPairs = new Set(paperSections.map((ps) => `${ps.paperId}:${ps.sectionId}`));
    for (const u of sectionChanges) {
      if (!validPairs.has(`${paperMap[u.id]}:${u.sectionId}`)) {
        const error = new Error(`Section ${u.sectionId} is not in paper ${paperMap[u.id]}`);
        error.statusCode = 400;
        throw error;
      }
    }
  }

  return prisma.$transaction(
    updates.map(({ id, ...data }) => prisma.question.update({ where: { id }, data }))
  );
};

exports.deleteQuestion = async (id) => {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) {
    const error = new Error('Question not found');
    error.statusCode = 404;
    throw error;
  }
  return prisma.question.delete({ where: { id } });
};

exports.deleteQuestions = async (ids) => {
  const existing = await prisma.question.count({ where: { id: { in: ids } } });
  if (existing !== ids.length) {
    const error = new Error('Invalid question ids');
    error.statusCode = 400;
    throw error;
  }
  return prisma.question.deleteMany({ where: { id: { in: ids } } });
};
