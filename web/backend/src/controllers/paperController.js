const paperService = require('../services/paperService');

exports.index = async (req, res, next) => {
  try {
    const { examId, search, page = 1, limit = 10 } = req.query;
    const { papers, total } = await paperService.getPapers(examId, search, page, limit);
    res.status(200).json({
      success: true,
      count: papers.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
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
      return res.status(404).json({ success: false, message: 'Paper not found' });
    }
    res.status(200).json({ success: true, data: paper });
  } catch (error) {
    next(error);
  }
};

exports.store = async (req, res, next) => {
  try {
    const paper = await paperService.createPaper(req.body);
    res.status(201).json({ success: true, data: paper });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const paper = await paperService.updatePaper(req.params.id, req.body);
    res.status(200).json({ success: true, data: paper });
  } catch (error) {
    next(error);
  }
};

exports.publish = async (req, res, next) => {
  try {
    const { isPublished } = req.body;
    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({ success: false, message: '`isPublished` must be a boolean' });
    }
    const paper = await paperService.publishPaper(req.params.id, isPublished);
    res.status(200).json({ success: true, data: paper });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await paperService.deletePaper(req.params.id);
    res.status(200).json({ success: true, message: 'Paper deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.bulkDestroy = async (req, res, next) => {
  try {
    const result = await paperService.bulkDeletePapers(req.body.ids);
    res.status(200).json({
      success: true,
      message: `${result.count} papers deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
