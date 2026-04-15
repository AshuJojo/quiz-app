const paperService = require('../services/paperService');

exports.index = async (req, res, next) => {
  try {
    const { examId } = req.query;
    const papers = await paperService.getPapers(examId);
    res.status(200).json({
      success: true,
      count: papers.length,
      data: papers,
    });
  } catch (error) {
    next(error);
  }
};

exports.show = async (req, res, next) => {
  try {
    const paper = await paperService.getPaperById(req.params.id);
    if (!paper) {
      return res.status(404).json({
        success: false,
        message: 'Paper not found',
      });
    }
    res.status(200).json({
      success: true,
      data: paper,
    });
  } catch (error) {
    next(error);
  }
};

exports.store = async (req, res, next) => {
  try {
    const paper = await paperService.createPaper(req.body);
    res.status(201).json({
      success: true,
      data: paper,
    });
  } catch (error) {
    if (error.message.includes('Exam not found')) {
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
    const paper = await paperService.updatePaper(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: paper,
    });
  } catch (error) {
    if (error.message.includes('Paper not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('Exam not found')) {
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
    await paperService.deletePaper(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Paper deleted successfully',
    });
  } catch (error) {
    if (error.message.includes('Paper not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};
