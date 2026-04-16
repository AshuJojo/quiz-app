const prisma = require('../config/db');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

exports.getExams = async (parentId, page, limit) => {
  const where = {};

  // If parentId is provided (even as "null" string), we filter.
  // If it is undefined (missing from query), we fetch all.
  if (parentId !== undefined) {
    if (parentId === 'null' || parentId === 'undefined' || parentId === '') {
      where.parentId = null;
    } else {
      where.parentId = parentId;
    }
  }

  // Handle pagination
  const p = parseInt(page) || 1;
  const isAll = limit === 'all' || limit === undefined;
  const l = isAll ? undefined : parseInt(limit) || 10;
  const skip = isAll ? undefined : (p - 1) * l;

  const [data, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      include: {
        _count: {
          select: {
            children: true,
            papers: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take: l,
    }),
    prisma.exam.count({ where }),
  ]);

  return {
    data,
    total,
    page: isAll ? 1 : p,
    limit: isAll ? total : l,
  };
};

exports.getExamById = async (id) => {
  return await prisma.exam.findUnique({
    where: { id },
    include: {
      children: {
        include: {
          _count: {
            select: { children: true, papers: true },
          },
        },
      },
      _count: {
        select: { papers: true },
      },
    },
  });
};

exports.createExam = async (data) => {
  let slug = data.slug || slugify(data.name);

  // Check if slug exists, if so, append unique suffix
  const existingSlug = await prisma.exam.findUnique({ where: { slug } });
  if (existingSlug) {
    const uniqueSuffix = Math.floor(100 + Math.random() * 900); // Simple 3-digit suffix
    slug = `${slug}-${uniqueSuffix}`;
  }

  // Validate parentId if provided
  if (data.parentId) {
    const parentExists = await prisma.exam.findUnique({
      where: { id: data.parentId },
    });
    if (!parentExists) {
      throw new Error(`Parent exam not found: ${data.parentId}`);
    }
  }

  const { parentId, ...examData } = data;

  return await prisma.exam.create({
    data: {
      ...examData,
      slug,
      parent: parentId ? { connect: { id: parentId } } : undefined,
    },
  });
};

exports.updateExam = async (id, data) => {
  // Check if exam exists
  const targetExam = await prisma.exam.findUnique({ where: { id } });
  if (!targetExam) {
    throw new Error('Exam not found');
  }

  // Prevent simple self-reference loop

  if (data.parentId === id) {
    throw new Error('An exam cannot be its own parent');
  }

  // Only handle slug if it's explicitly provided in the patch data
  if (data.slug) {
    const existingSlug = await prisma.exam.findFirst({
      where: {
        slug: data.slug,
        NOT: { id }, // Don't match itself
      },
    });
    if (existingSlug) {
      const uniqueSuffix = Math.floor(100 + Math.random() * 900);
      data.slug = `${data.slug}-${uniqueSuffix}`;
    }
  }

  // Validate parentId if provided
  if (data.parentId) {
    const parentExists = await prisma.exam.findUnique({
      where: { id: data.parentId },
    });
    if (!parentExists) {
      throw new Error(`Parent exam not found: ${data.parentId}`);
    }
  }

  const { parentId, ...updateData } = data;

  return await prisma.exam.update({
    where: { id },
    data: {
      ...updateData,
      parent: parentId
        ? { connect: { id: parentId } }
        : parentId === null
          ? { disconnect: true }
          : undefined,
    },
  });
};

exports.deleteExam = async (id) => {
  // Check if it has children or papers
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      _count: {
        select: { children: true, papers: true },
      },
    },
  });

  if (!exam) {
    throw new Error('Exam not found');
  }

  return await prisma.exam.delete({
    where: { id },
  });
};
