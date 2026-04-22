const prisma = require('../config/db');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

const getExamPath = async (examId, cache = new Map()) => {
  if (!examId) return '';
  if (cache.has(examId)) return cache.get(examId);

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { name: true, parentId: true },
  });

  if (!exam) return '';

  let path = exam.name;
  if (exam.parentId) {
    const parentPath = await getExamPath(exam.parentId, cache);
    if (parentPath) path = `${parentPath} / ${exam.name}`;
  }

  cache.set(examId, path);
  return path;
};

exports.getExamPath = getExamPath;

exports.getExams = async (parentId, page, limit, search) => {
  const where = {};

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  } else if (parentId !== undefined) {
    where.parentId =
      parentId === 'null' || parentId === 'undefined' || parentId === '' ? null : parentId;
  }

  const p = parseInt(page) || 1;
  const isAll = limit === 'all' || limit === undefined;
  const l = isAll ? undefined : parseInt(limit) || 10;
  const skip = isAll ? undefined : (p - 1) * l;

  const [data, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      include: { _count: { select: { children: true, papers: true } } },
      orderBy: { name: 'asc' },
      skip,
      take: l,
    }),
    prisma.exam.count({ where }),
  ]);

  const enrichedData = await Promise.all(
    data.map(async (exam) => ({ ...exam, fullPath: await getExamPath(exam.id) }))
  );

  return { data: enrichedData, total, page: isAll ? 1 : p, limit: isAll ? total : l };
};

exports.getExamById = async (id) => {
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      children: { include: { _count: { select: { children: true, papers: true } } } },
      _count: { select: { papers: true } },
    },
  });

  if (!exam) return null;

  return { ...exam, fullPath: await getExamPath(id) };
};

exports.createExam = async (data) => {
  let slug = data.slug || slugify(data.name);

  const existingSlug = await prisma.exam.findUnique({ where: { slug } });
  if (existingSlug) {
    slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
  }

  if (data.parentId) {
    const parentExists = await prisma.exam.findUnique({ where: { id: data.parentId } });
    if (!parentExists) {
      const err = new Error(`Parent exam not found: ${data.parentId}`);
      err.statusCode = 400;
      throw err;
    }
  }

  const { parentId, ...examData } = data;

  return prisma.exam.create({
    data: {
      ...examData,
      slug,
      parent: parentId ? { connect: { id: parentId } } : undefined,
    },
  });
};

exports.updateExam = async (id, data) => {
  const targetExam = await prisma.exam.findUnique({ where: { id } });
  if (!targetExam) {
    const err = new Error('Exam not found');
    err.statusCode = 404;
    throw err;
  }

  if (data.parentId === id) {
    const err = new Error('An exam cannot be its own parent');
    err.statusCode = 400;
    throw err;
  }

  if (data.slug) {
    const existingSlug = await prisma.exam.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (existingSlug) {
      data.slug = `${data.slug}-${Math.floor(100 + Math.random() * 900)}`;
    }
  }

  if (data.parentId) {
    const parentExists = await prisma.exam.findUnique({ where: { id: data.parentId } });
    if (!parentExists) {
      const err = new Error(`Parent exam not found: ${data.parentId}`);
      err.statusCode = 400;
      throw err;
    }
  }

  const { parentId, ...updateData } = data;

  return prisma.exam.update({
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
  const exam = await prisma.exam.findUnique({
    where: { id },
    include: { _count: { select: { children: true, papers: true } } },
  });

  if (!exam) {
    const err = new Error('Exam not found');
    err.statusCode = 404;
    throw err;
  }

  return prisma.exam.delete({ where: { id } });
};

exports.bulkDeleteExams = async (ids) => {
  const existingCount = await prisma.exam.count({ where: { id: { in: ids } } });
  if (existingCount !== ids.length) {
    const err = new Error('One or more exam IDs are invalid');
    err.statusCode = 400;
    throw err;
  }

  return prisma.exam.deleteMany({ where: { id: { in: ids } } });
};
