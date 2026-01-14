const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const clerkAuth = require('../middleware/clerkAuth');

// POST /api/ai/suggest
// Protected route: Authentication required
// Rate limiting handled in Service layer (for finer user-level control)
router.post('/suggest', clerkAuth, aiController.suggest);

module.exports = router;
