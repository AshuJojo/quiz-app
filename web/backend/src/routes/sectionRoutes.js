const express = require('express');
const sectionController = require('../controllers/sectionController');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createSectionsSchema,
  updateSectionSchema,
  bulkUpdateSectionsSchema,
  bulkDeleteSectionsSchema,
  sectionIdParamsSchema,
} = require('../schemas/sectionSchema');

const router = express.Router();

// GET /api/sections/:id
router.get('/:id', validateRequest(sectionIdParamsSchema), sectionController.show);

// POST /api/sections
router.post('/', validateRequest(createSectionsSchema), sectionController.store);

// PATCH /api/sections/:id
router.patch('/:id', validateRequest(updateSectionSchema), sectionController.update);

// PATCH /api/sections  — bulk update titles
router.patch('/', validateRequest(bulkUpdateSectionsSchema), sectionController.bulkUpdate);

// DELETE /api/sections/:id
router.delete('/:id', validateRequest(sectionIdParamsSchema), sectionController.destroy);

// DELETE /api/sections
router.delete('/', validateRequest(bulkDeleteSectionsSchema), sectionController.bulkDestroy);

module.exports = router;
