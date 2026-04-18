const express = require('express');
const sectionController = require('../controllers/sectionController');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createSectionsSchema,
  updateSectionSchema,
  bulkUpdateSectionsSchema,
  bulkDeleteSectionsSchema,
  sectionIdParamsSchema,
  paperIdParamsSchema,
} = require('../schemas/sectionSchema');

const router = express.Router();

// GET /api/papers/:paperId/sections  — mounted under paperRoutes
// GET /api/sections/:id
router.get('/:id', validateRequest(sectionIdParamsSchema), sectionController.show);

// POST /api/sections  — create single or bulk
router.post('/', validateRequest(createSectionsSchema), sectionController.store);

// PATCH /api/sections/:id  — update single
router.patch('/:id', validateRequest(updateSectionSchema), sectionController.update);

// PATCH /api/sections  — bulk update (also used for reordering)
router.patch('/', validateRequest(bulkUpdateSectionsSchema), sectionController.bulkUpdate);

// DELETE /api/sections/:id  — delete single (moves questions to uncategorized)
router.delete('/:id', validateRequest(sectionIdParamsSchema), sectionController.destroy);

// DELETE /api/sections  — bulk delete (moves questions to uncategorized)
router.delete('/', validateRequest(bulkDeleteSectionsSchema), sectionController.bulkDestroy);

module.exports = router;
