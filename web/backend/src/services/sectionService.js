const prisma = require('../config/db');

exports.getSections = async (examId) => {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) {
    const error = new Error('Exam not found');
    error.statusCode = 404;
    throw error;
  }

  return prisma.section.findMany({
    where: { examId },
    include: { _count: { select: { questions: true, paperSections: true } } },
    orderBy: { createdAt: 'asc' },
  });
};

exports.getSectionById = async (id) => {
  return prisma.section.findUnique({
    where: { id },
    include: {
      exam: { select: { id: true, name: true } },
      _count: { select: { questions: true } },
    },
  });
};

exports.createSections = async (sections) => {
  const examIds = [...new Set(sections.map((s) => s.examId))];
  const exams = await prisma.exam.findMany({
    where: { id: { in: examIds } },
    select: { id: true },
  });
  const foundIds = new Set(exams.map((e) => e.id));
  const missing = examIds.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    const error = new Error(`Exam not found: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(
    sections.map((s) => prisma.section.create({ data: { title: s.title, examId: s.examId } }))
  );
};

exports.updateSection = async (id, data) => {
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) {
    const error = new Error('Section not found');
    error.statusCode = 404;
    throw error;
  }
  return prisma.section.update({ where: { id }, data: { title: data.title } });
};

exports.updateSections = async (updates) => {
  const ids = updates.map((u) => u.id);
  const existing = await prisma.section.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  const foundIds = new Set(existing.map((s) => s.id));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    const error = new Error(`Invalid section ids: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(
    updates.map(({ id, title }) => prisma.section.update({ where: { id }, data: { title } }))
  );
};

exports.deleteSection = async (id) => {
  const section = await prisma.section.findUnique({ where: { id } });
  if (!section) {
    const error = new Error('Section not found');
    error.statusCode = 404;
    throw error;
  }
  return prisma.section.delete({ where: { id } });
};

exports.deleteSections = async (ids) => {
  const existing = await prisma.section.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  const foundIds = new Set(existing.map((s) => s.id));
  const missing = ids.filter((id) => !foundIds.has(id));
  if (missing.length > 0) {
    const error = new Error(`Invalid section ids: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
  return prisma.section.deleteMany({ where: { id: { in: ids } } });
};
