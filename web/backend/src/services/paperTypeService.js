const prisma = require('../config/db');

exports.getPaperTypesByExamId = async (examId) => {
  return prisma.paperType.findMany({
    where: { examId },
    orderBy: { name: 'asc' },
  });
};

exports.createPaperType = async ({ examId, name }) => {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) {
    const err = new Error(`Exam not found: ${examId}`);
    err.statusCode = 400;
    throw err;
  }
  return prisma.paperType.create({ data: { examId, name } });
};

exports.updatePaperType = async (id, { name }) => {
  const existing = await prisma.paperType.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Paper type not found');
    err.statusCode = 404;
    throw err;
  }
  return prisma.paperType.update({ where: { id }, data: { name } });
};

exports.deletePaperType = async (id) => {
  const existing = await prisma.paperType.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Paper type not found');
    err.statusCode = 404;
    throw err;
  }
  return prisma.paperType.delete({ where: { id } });
};
