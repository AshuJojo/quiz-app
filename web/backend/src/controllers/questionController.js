const questionService = require('../services/questionService');

exports.index = async (req, res, next) => {
  try {
    const questions = await questionService.getQuestions(req.params.paperId);
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

exports.show = async (req, res, next) => {
  try {
    const question = await questionService.getQuestionById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

exports.store = async (req, res, next) => {
  try {
    const questions = await questionService.createQuestions(req.body.questions);
    res.status(201).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const question = await questionService.updateQuestion(req.params.id, req.body);
    res.status(200).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

exports.bulkUpdate = async (req, res, next) => {
  try {
    const questions = await questionService.updateQuestions(req.body.updates);
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    next(error);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    await questionService.deleteQuestion(req.params.id);
    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.bulkDestroy = async (req, res, next) => {
  try {
    const { ids } = req.body;
    await questionService.deleteQuestions(ids);
    res.status(200).json({
      success: true,
      message: `${ids.length} questions deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
