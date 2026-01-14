const express = require('express');
const router = express.Router();
const aiRoutes = require('./ai.routes');

// Mount Routes
router.use('/ai', aiRoutes);
router.use('/projects', require('./project.routes'));

module.exports = router;
