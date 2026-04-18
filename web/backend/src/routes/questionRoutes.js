const express = require('express');
const questionController = require('../controllers/questionController');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createQuestionsSchema,
  updateQuestionSchema,
  bulkUpdateQuestionsSchema,
  bulkDeleteQuestionsSchema,
  questionIdParamsSchema,
} = require('../schemas/questionSchema');

const router = express.Router();

// GET /api/questions/:id
router.get('/:id', validateRequest(questionIdParamsSchema), questionController.show);

// POST /api/questions  — create single or bulk (with mixed sectionIds)
router.post('/', validateRequest(createQuestionsSchema), questionController.store);

// PATCH /api/questions/:id  — update single
router.patch('/:id', validateRequest(updateQuestionSchema), questionController.update);

// PATCH /api/questions  — bulk update (also used for reordering)
router.patch('/', validateRequest(bulkUpdateQuestionsSchema), questionController.bulkUpdate);

// DELETE /api/questions/:id  — delete single
router.delete('/:id', validateRequest(questionIdParamsSchema), questionController.destroy);

// DELETE /api/questions  — bulk delete
router.delete('/', validateRequest(bulkDeleteQuestionsSchema), questionController.bulkDestroy);

module.exports = router;
