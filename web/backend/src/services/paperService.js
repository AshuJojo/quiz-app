const prisma = require('../config/db');
const { getExamPath } = require('./examService');

exports.getPapers = async (examId, search, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where = {};
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }
  if (examId) {
    where.examId = examId;
  }

  const [total, papers] = await Promise.all([
    prisma.paper.count({ where }),
    prisma.paper.findMany({
      where,
      include: {
        exam: {
          select: {
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: Number(skip),
      take: Number(limit),
    }),
  ]);

  const enrichedPapers = await Promise.all(
    papers.map(async (paper) => {
      if (!paper.examId) return paper;
      const fullPath = await getExamPath(paper.examId);
      return {
        ...paper,
        exam: {
          ...paper.exam,
          fullPath,
        },
      };
    })
  );

  return {
    total,
    papers: enrichedPapers,
  };
};

exports.getPaperById = async (id) => {
  const paper = await prisma.paper.findUnique({
    where: { id },
    include: {
      exam: {
        select: {
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  if (!paper || !paper.examId) return paper;

  return {
    ...paper,
    exam: {
      ...paper.exam,
      fullPath: await getExamPath(paper.examId),
    },
  };
};

exports.createPaper = async (data) => {
  // Check if exam exists if examId is provided
  if (data.examId) {
    const examExists = await prisma.exam.findUnique({
      where: { id: data.examId },
    });
    if (!examExists) {
      throw new Error(`Exam not found: ${data.examId}`);
    }
  }

  return await prisma.paper.create({
    data,
  });
};

exports.updatePaper = async (id, data) => {
  const targetPaper = await prisma.paper.findUnique({ where: { id } });
  if (!targetPaper) {
    throw new Error('Paper not found');
  }

  if (data.examId) {
    const examExists = await prisma.exam.findUnique({
      where: { id: data.examId },
    });
    if (!examExists) {
      throw new Error(`Exam not found: ${data.examId}`);
    }
  }

  return await prisma.paper.update({
    where: { id },
    data,
  });
};

exports.deletePaper = async (id) => {
  const paper = await prisma.paper.findUnique({
    where: { id },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });

  if (!paper) {
    throw new Error('Paper not found');
  }

  // Optional: Check if it has questions before deleting, or allow cascade
  // For now, let's just delete it. If they want to prevent deletion, we can add logic.
  // In our schema, Question has paperId which is a foreign key.
  // If we want to allow delete, we should check if we want cascade or restricted.

  return await prisma.paper.delete({
    where: { id },
  });
};
exports.bulkDeletePapers = async (ids) => {
  // Verify all IDs exists to provide a specific error
  const existingCount = await prisma.paper.count({
    where: { id: { in: ids } },
  });

  if (existingCount !== ids.length) {
    const error = new Error('Invalid paper ids');
    error.statusCode = 400;
    throw error;
  }

  return await prisma.paper.deleteMany({
    where: {
      id: { in: ids },
    },
  });
};
