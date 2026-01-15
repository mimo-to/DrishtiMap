const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const clerkAuth = require('../middleware/clerkAuth');

// POST /api/ai/suggest
// Protected route: Authentication required
// Rate limiting handled in Service layer (for finer user-level control)
router.post('/suggest', clerkAuth, aiController.suggest);

const researchService = require('../services/ai/research.service');

/**
 * @route POST /api/ai/research
 * @desc Generate comprehensive research report for a project
 */
router.post('/research', clerkAuth, async (req, res) => {
    try {
        const { userId } = req.auth;
        const { projectId } = req.body;

        if (!projectId) {
            return res.status(400).json({ success: false, error: "ProjectId is required" });
        }

        const report = await researchService.generateResearchReport(projectId, userId);
        
        res.json({ success: true, report });

    } catch (error) {
        console.error("Research Route Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
