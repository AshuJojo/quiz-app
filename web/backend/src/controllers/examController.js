const examService = require('../services/examService');

exports.index = async (req, res, next) => {
  try {
    const { parentId, page, limit, search } = req.query;
    const result = await examService.getExams(parentId, page, limit, search);
    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    next(error);
  }
};

exports.show = async (req, res, next) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

exports.store = async (req, res, next) => {
  try {
    const exam = await examService.createExam(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const exam = await examService.updateExam(req.params.id, req.body);
    res.status(200).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await examService.deleteExam(req.params.id);
    res.status(200).json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.bulkDestroy = async (req, res, next) => {
  try {
    const result = await examService.bulkDeleteExams(req.body.ids);
    res.status(200).json({
      success: true,
      message: `${result.count} exams deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
