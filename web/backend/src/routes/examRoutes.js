const express = require('express');
const examController = require('../controllers/examController');
const { validateRequest } = require('../middlewares/validateRequest');
const { createExamSchema, updateExamSchema, examIdParamsSchema } = require('../schemas/examSchema');

const router = express.Router();

router.get('/', examController.index);

router.get('/:id', validateRequest(examIdParamsSchema), examController.show);

router.post('/', validateRequest(createExamSchema), examController.store);

router.patch('/:id', validateRequest(updateExamSchema), examController.update);

router.delete('/:id', validateRequest(examIdParamsSchema), examController.destroy);

module.exports = router;
