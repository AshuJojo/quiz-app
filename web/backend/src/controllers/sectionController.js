const sectionService = require('../services/sectionService');

exports.index = async (req, res, next) => {
  try {
    const sections = await sectionService.getSections(req.params.examId);
    res.status(200).json({ success: true, count: sections.length, data: sections });
  } catch (error) {
    next(error);
  }
};

exports.show = async (req, res, next) => {
  try {
    const section = await sectionService.getSectionById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

exports.store = async (req, res, next) => {
  try {
    const sections = await sectionService.createSections(req.body.sections);
    res.status(201).json({ success: true, count: sections.length, data: sections });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const section = await sectionService.updateSection(req.params.id, req.body);
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdate = async (req, res, next) => {
  try {
    const sections = await sectionService.updateSections(req.body.updates);
    res.status(200).json({ success: true, count: sections.length, data: sections });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await sectionService.deleteSection(req.params.id);
    res.status(200).json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.bulkDestroy = async (req, res, next) => {
  try {
    await sectionService.deleteSections(req.body.ids);
    res
      .status(200)
      .json({ success: true, message: `${req.body.ids.length} sections deleted successfully` });
  } catch (error) {
    next(error);
  }
};
