const express = require('express');
const userRoutes = require('./userRoutes');
const examRoutes = require('./examRoutes');
const paperRoutes = require('./paperRoutes');
const sectionRoutes = require('./sectionRoutes');
const questionRoutes = require('./questionRoutes');
const uploadRoutes = require('./uploadRoutes');
const paperTypeRoutes = require('./paperTypeRoutes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/exams', examRoutes);
router.use('/papers', paperRoutes);
router.use('/sections', sectionRoutes);
router.use('/questions', questionRoutes);
router.use('/upload', uploadRoutes);
router.use('/paper-types', paperTypeRoutes);

module.exports = router;
