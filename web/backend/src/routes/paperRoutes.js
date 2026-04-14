const express = require('express');
const paperController = require('../controllers/paperController');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createPaperSchema,
  updatePaperSchema,
  paperIdParamsSchema,
} = require('../schemas/paperSchema');

const router = express.Router();

router.get('/', paperController.index);

router.get('/:id', validateRequest(paperIdParamsSchema), paperController.show);

router.post('/', validateRequest(createPaperSchema), paperController.store);

router.patch('/:id', validateRequest(updatePaperSchema), paperController.update);

router.delete('/:id', validateRequest(paperIdParamsSchema), paperController.destroy);

module.exports = router;
