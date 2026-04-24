const paperSectionService = require('../services/paperSectionService');

exports.index = async (req, res, next) => {
  try {
    const sections = await paperSectionService.getPaperSections(req.params.paperId);
    res.status(200).json({ success: true, count: sections.length, data: sections });
  } catch (error) {
    next(error);
  }
};

exports.addSections = async (req, res, next) => {
  try {
    const result = await paperSectionService.addSectionsToPaper(
      req.params.paperId,
      req.body.sectionIds
    );
    res.status(201).json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

exports.removeSection = async (req, res, next) => {
  try {
    await paperSectionService.removeSectionFromPaper(req.params.paperId, req.params.sectionId);
    res.status(200).json({ success: true, message: 'Section removed from paper' });
  } catch (error) {
    next(error);
  }
};

exports.reorder = async (req, res, next) => {
  try {
    await paperSectionService.reorderPaperSections(req.params.paperId, req.body.updates);
    res.status(200).json({ success: true, message: 'Section order updated' });
  } catch (error) {
    next(error);
  }
};
