const prisma = require('../config/db');

exports.getPapers = async (examId, search) => {
  const where = {};
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }
  if (examId) {
    where.examId = examId;
  }

  return await prisma.paper.findMany({
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
  });
};

exports.getPaperById = async (id) => {
  return await prisma.paper.findUnique({
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
