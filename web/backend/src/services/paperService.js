const prisma = require('../config/db');

exports.getPapers = async (categoryId) => {
  const where = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }

  return await prisma.paper.findMany({
    where,
    include: {
      category: {
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
      category: {
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
  // Check if category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!categoryExists) {
    throw new Error(`Category not found: ${data.categoryId}`);
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

  if (data.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!categoryExists) {
      throw new Error(`Category not found: ${data.categoryId}`);
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
