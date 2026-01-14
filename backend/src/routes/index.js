const express = require('express');
const router = express.Router();
const aiRoutes = require('./ai.routes');
const authRoutes = require('./auth.routes');

// Mount Routes
router.use('/ai', aiRoutes);
router.use('/auth', authRoutes);

module.exports = router;
