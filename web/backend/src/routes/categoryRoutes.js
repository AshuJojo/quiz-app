const express = require('express');
const categoryController = require('../controllers/categoryController');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamsSchema,
} = require('../schemas/categorySchema');

const router = express.Router();

router.get('/', categoryController.index);

router.get('/:id', validateRequest(categoryIdParamsSchema), categoryController.show);

router.post('/', validateRequest(createCategorySchema), categoryController.store);

router.patch('/:id', validateRequest(updateCategorySchema), categoryController.update);

router.delete('/:id', validateRequest(categoryIdParamsSchema), categoryController.destroy);

module.exports = router;
