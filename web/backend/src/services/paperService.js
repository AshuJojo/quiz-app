const prisma = require('../config/db');
const { getExamPath } = require('./examService');

exports.getPapers = async (examId, search, page = 1, limit = 10, variant) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (examId) where.examId = examId;
  if (variant === '0') where.parentPaperId = null;

  console.log('where', where);
  console.log('variant', variant);

  const [total, papers] = await Promise.all([
    prisma.paper.count({ where }),
    prisma.paper.findMany({
      where,
      include: {
        exam: { select: { name: true, slug: true } },
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: Number(skip),
      take: Number(limit),
    }),
  ]);

  const enrichedPapers = await Promise.all(
    papers.map(async (paper) => {
      if (!paper.examId) return paper;
      const fullPath = await getExamPath(paper.examId);
      return { ...paper, exam: { ...paper.exam, fullPath } };
    })
  );

  return { total, papers: enrichedPapers };
};

exports.getPaperById = async (id) => {
  const paper = await prisma.paper.findUnique({
    where: { id },
  });

  if (!paper) return null;

  return paper;
};

exports.createPaper = async (data) => {
  if (data.examId) {
    const examExists = await prisma.exam.findUnique({ where: { id: data.examId } });
    if (!examExists) {
      const err = new Error(`Exam not found: ${data.examId}`);
      err.statusCode = 400;
      throw err;
    }
  }

  const paper = await prisma.paper.create({ data });

  // Auto-create a hidden default "Uncategorized" section for this paper.
  // This section has no examId (paper-specific), is never shown in the builder,
  // and serves as the question target when hasSections is off.
  const defaultSection = await prisma.section.create({
    data: { title: 'Uncategorized', examId: null },
  });
  await prisma.paperSection.create({
    data: { paperId: paper.id, sectionId: defaultSection.id, order: 0, isDefault: true },
  });

  return paper;
};

exports.updatePaper = async (id, data) => {
  const targetPaper = await prisma.paper.findUnique({ where: { id } });
  if (!targetPaper) {
    const err = new Error('Paper not found');
    err.statusCode = 404;
    throw err;
  }

  // Only allow whitelisted fields — isPublished is intentionally excluded
  // so that "Save Progress" can never accidentally publish or unpublish a paper.
  const {
    title,
    description,
    variantName,
    examId,
    positiveMarks,
    negativeMarks,
    hasSections,
    duration,
    paperDate,
  } = data;
  const safeData = {};
  if (title !== undefined) safeData.title = title;
  if (description !== undefined) safeData.description = description;
  if (variantName !== undefined) safeData.variantName = variantName;
  if (positiveMarks !== undefined) safeData.positiveMarks = positiveMarks;
  if (negativeMarks !== undefined) safeData.negativeMarks = negativeMarks;
  if (hasSections !== undefined) safeData.hasSections = hasSections;
  if (duration !== undefined) safeData.duration = duration;
  if (paperDate !== undefined) safeData.paperDate = paperDate;

  if (examId !== undefined) {
    if (examId === null || examId === '') {
      safeData.examId = null;
    } else {
      const examExists = await prisma.exam.findUnique({ where: { id: examId } });
      if (!examExists) {
        const err = new Error(`Exam not found: ${examId}`);
        err.statusCode = 400;
        throw err;
      }
      safeData.examId = examId;
    }
  }

  return prisma.paper.update({ where: { id }, data: safeData });
};

// Dedicated publish/unpublish — the ONLY way isPublished can change.
exports.publishPaper = async (id, isPublished) => {
  const targetPaper = await prisma.paper.findUnique({ where: { id } });
  if (!targetPaper) {
    const err = new Error('Paper not found');
    err.statusCode = 404;
    throw err;
  }
  // Cascade: paper + all its questions flip together
  const [paper] = await prisma.$transaction([
    prisma.paper.update({ where: { id }, data: { isPublished } }),
    prisma.question.updateMany({ where: { paperId: id }, data: { isPublished } }),
  ]);
  return paper;
};

exports.deletePaper = async (id) => {
  const paper = await prisma.paper.findUnique({
    where: { id },
    include: { _count: { select: { variants: true } } },
  });
  if (!paper) {
    const err = new Error('Paper not found');
    err.statusCode = 404;
    throw err;
  }
  if (!paper.parentPaperId && paper._count.variants > 0) {
    const err = new Error('Cannot delete the default variant while other variants exist');
    err.statusCode = 400;
    throw err;
  }

  return prisma.paper.delete({ where: { id } });
};

exports.getVariants = async (paperId) => {
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
    select: { id: true, title: true, variantName: true, parentPaperId: true },
  });
  if (!paper) {
    const err = new Error('Paper not found');
    err.statusCode = 404;
    throw err;
  }

  // Root = this paper if it has no parent, otherwise go up one level
  const rootId = paper.parentPaperId ?? paperId;

  const [root, children] = await Promise.all([
    prisma.paper.findUnique({
      where: { id: rootId },
      select: { id: true, title: true, variantName: true },
    }),
    prisma.paper.findMany({
      where: { parentPaperId: rootId },
      select: { id: true, title: true, variantName: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const all = [root, ...children].filter(Boolean);
  // Tag the root so the frontend knows which variant is the default (undeletable)
  return all.map((v) => ({ ...v, isDefault: v.id === rootId }));
};

exports.createVariant = async (parentPaperId, data) => {
  const parent = await prisma.paper.findUnique({ where: { id: parentPaperId } });
  if (!parent) {
    const err = new Error('Parent paper not found');
    err.statusCode = 404;
    throw err;
  }

  // Always link to the root paper, never chain variants
  const rootId = parent.parentPaperId ?? parentPaperId;

  const variantName = data.language || 'Hindi';

  const paper = await prisma.paper.create({
    data: {
      title: parent.title,
      variantName,
      examId: parent.examId,
      parentPaperId: rootId,
      positiveMarks: parent.positiveMarks,
      negativeMarks: parent.negativeMarks,
      duration: parent.duration,
      hasSections: parent.hasSections,
    },
  });

  // Copy sections from the source paper (default + non-default)
  const sourceSections = await prisma.paperSection.findMany({
    where: { paperId: parentPaperId },
    orderBy: { order: 'asc' },
  });

  // Replicate the default section with a fresh Uncategorized section
  const defaultSection = await prisma.section.create({
    data: { title: 'Uncategorized', examId: null },
  });

  await prisma.paperSection.createMany({
    data: [
      { paperId: paper.id, sectionId: defaultSection.id, order: 0, isDefault: true },
      ...sourceSections
        .filter((ps) => !ps.isDefault)
        .map((ps) => ({
          paperId: paper.id,
          sectionId: ps.sectionId,
          order: ps.order,
          isDefault: false,
        })),
    ],
    skipDuplicates: true,
  });

  // Copy all questions from the source paper into the new variant.
  // Questions keep their sectionId (sections are shared via PaperSection).
  // The default-section questions are re-pointed to the new default section.
  const sourceDefaultSectionId = sourceSections.find((ps) => ps.isDefault)?.sectionId;
  const sourceQuestions = await prisma.question.findMany({
    where: { paperId: parentPaperId },
    orderBy: [{ order: 'asc' }],
  });

  if (sourceQuestions.length > 0) {
    await prisma.question.createMany({
      data: sourceQuestions.map(({ id, paperId, createdAt, updatedAt, sectionId, ...rest }) => ({
        ...rest,
        paperId: paper.id,
        // Remap the old default section to the new one; named sections stay the same
        sectionId: sectionId === sourceDefaultSectionId ? defaultSection.id : sectionId,
      })),
    });
  }

  return paper;
};

exports.bulkDeletePapers = async (ids) => {
  const existingCount = await prisma.paper.count({ where: { id: { in: ids } } });
  if (existingCount !== ids.length) {
    const err = new Error('One or more paper IDs are invalid');
    err.statusCode = 400;
    throw err;
  }

  return prisma.paper.deleteMany({ where: { id: { in: ids } } });
};
