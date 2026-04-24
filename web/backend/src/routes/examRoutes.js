const express = require('express');
const examController = require('../controllers/examController');
const sectionController = require('../controllers/sectionController');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createExamSchema,
  updateExamSchema,
  examIdParamsSchema,
  bulkDeleteExamSchema,
} = require('../schemas/examSchema');
const { examIdParamsSchema: sectionExamParamsSchema } = require('../schemas/sectionSchema');

const router = express.Router();

router.get('/', examController.index);

router.get('/:id', validateRequest(examIdParamsSchema), examController.show);

// GET /api/exams/:examId/sections — all sections for an exam
router.get('/:examId/sections', validateRequest(sectionExamParamsSchema), sectionController.index);

router.post('/', validateRequest(createExamSchema), examController.store);

router.patch('/:id', validateRequest(updateExamSchema), examController.update);

router.delete('/', validateRequest(bulkDeleteExamSchema), examController.bulkDestroy);

router.delete('/:id', validateRequest(examIdParamsSchema), examController.destroy);

module.exports = router;
