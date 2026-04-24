const express = require('express');
const paperController = require('../controllers/paperController');
const paperSectionController = require('../controllers/paperSectionController');
const questionController = require('../controllers/questionController');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createPaperSchema,
  updatePaperSchema,
  paperIdParamsSchema,
} = require('../schemas/paperSchema');
const {
  paperSectionParamsSchema,
  paperSectionDeleteParamsSchema,
  addSectionsToPaperSchema,
  reorderPaperSectionsSchema,
} = require('../schemas/paperSectionSchema');

const router = express.Router();

router.get('/', paperController.index);
router.get('/:id', validateRequest(paperIdParamsSchema), paperController.show);

// Paper sections — nested under /papers/:paperId/sections
router.get(
  '/:paperId/sections',
  validateRequest(paperSectionParamsSchema),
  paperSectionController.index
);
router.post(
  '/:paperId/sections',
  validateRequest(addSectionsToPaperSchema),
  paperSectionController.addSections
);
router.patch(
  '/:paperId/sections',
  validateRequest(reorderPaperSectionsSchema),
  paperSectionController.reorder
);
router.delete(
  '/:paperId/sections/:sectionId',
  validateRequest(paperSectionDeleteParamsSchema),
  paperSectionController.removeSection
);

// Questions nested under paper
router.get(
  '/:paperId/questions',
  validateRequest(paperSectionParamsSchema),
  questionController.index
);

router.post('/', validateRequest(createPaperSchema), paperController.store);
router.patch('/:id', validateRequest(updatePaperSchema), paperController.update);
router.delete('/', paperController.bulkDestroy);
router.delete('/:id', validateRequest(paperIdParamsSchema), paperController.destroy);

module.exports = router;
