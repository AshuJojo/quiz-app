const express = require('express');
const paperTypeController = require('../controllers/paperTypeController');

const router = express.Router();

router.get('/', paperTypeController.index);
router.post('/', paperTypeController.store);
router.patch('/:id', paperTypeController.update);
router.delete('/:id', paperTypeController.destroy);

module.exports = router;
