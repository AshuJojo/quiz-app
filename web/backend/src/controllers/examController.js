const examService = require('../services/examService');

exports.index = async (req, res, next) => {
  try {
    const { parentId, page, limit } = req.query;
    const result = await examService.getExams(parentId, page, limit);

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
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }
    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

exports.store = async (req, res, next) => {
  try {
    const exam = await examService.createExam(req.body);
    res.status(201).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    if (error.message.includes('slug')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('Parent exam not found')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const exam = await examService.updateExam(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    if (error.message.includes('own parent')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('Exam not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('Parent exam not found')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await examService.deleteExam(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully',
    });
  } catch (error) {
    if (error.message.includes('Exam not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('Cannot delete')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
