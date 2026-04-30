const paperTypeService = require('../services/paperTypeService');

exports.index = async (req, res, next) => {
  try {
    const { examId } = req.query;
    if (!examId) return res.status(400).json({ success: false, message: '`examId` is required' });
    const data = await paperTypeService.getPaperTypesByExamId(examId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.store = async (req, res, next) => {
  try {
    const data = await paperTypeService.createPaperType(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await paperTypeService.updatePaperType(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await paperTypeService.deletePaperType(req.params.id);
    res.status(200).json({ success: true, message: 'Paper type deleted' });
  } catch (error) {
    next(error);
  }
};
