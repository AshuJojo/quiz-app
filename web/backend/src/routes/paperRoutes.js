const express = require('express');
const paperController = require('../controllers/paperController');
const sectionController = require('../controllers/sectionController');
const questionController = require('../controllers/questionController');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createPaperSchema,
  updatePaperSchema,
  paperIdParamsSchema,
} = require('../schemas/paperSchema');
const { paperIdParamsSchema: sectionPaperParamsSchema } = require('../schemas/sectionSchema');

const router = express.Router();

router.get('/', paperController.index);

router.get('/:id', validateRequest(paperIdParamsSchema), paperController.show);

// Nested: GET all sections for a paper
router.get(
  '/:paperId/sections',
  validateRequest(sectionPaperParamsSchema),
  sectionController.index
);

// Nested: GET all questions for a paper
router.get(
  '/:paperId/questions',
  validateRequest(sectionPaperParamsSchema),
  questionController.index
);

router.post('/', validateRequest(createPaperSchema), paperController.store);

router.patch('/:id', validateRequest(updatePaperSchema), paperController.update);

router.delete('/', paperController.bulkDestroy);
router.delete('/:id', validateRequest(paperIdParamsSchema), paperController.destroy);

module.exports = router;
