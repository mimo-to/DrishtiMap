const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

// POST /api/ai/suggest
// Protected route: Authentication required
// Rate limiting handled in Service layer (for finer user-level control)
router.post('/suggest', protect, aiController.suggest);

module.exports = router;
