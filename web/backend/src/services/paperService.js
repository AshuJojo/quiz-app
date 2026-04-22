const prisma = require('../config/db');
const { getExamPath } = require('./examService');

exports.getPapers = async (examId, search, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (search) where.title = { contains: search, mode: 'insensitive' };
  if (examId) where.examId = examId;

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
  await prisma.section.create({
    data: { title: 'Uncategorized', isDefault: true, order: 0, paperId: paper.id },
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

  if (data.examId) {
    const examExists = await prisma.exam.findUnique({ where: { id: data.examId } });
    if (!examExists) {
      const err = new Error(`Exam not found: ${data.examId}`);
      err.statusCode = 400;
      throw err;
    }
  }

  return prisma.paper.update({ where: { id }, data });
};

exports.deletePaper = async (id) => {
  const paper = await prisma.paper.findUnique({ where: { id } });
  if (!paper) {
    const err = new Error('Paper not found');
    err.statusCode = 404;
    throw err;
  }

  return prisma.paper.delete({ where: { id } });
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
