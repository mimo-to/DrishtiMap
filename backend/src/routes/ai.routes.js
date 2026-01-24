const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const clerkAuth = require('../middleware/clerkAuth');


router.post('/suggest', clerkAuth, aiController.suggest);

const researchService = require('../services/ai/research.service');


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

const documentService = require('../services/ai/document.service');
const { upload } = require('../middleware/upload');


router.post('/analyze-document', clerkAuth, upload.single('document'), async (req, res) => {
    try {
        const { userId } = req.auth;
        const { projectId } = req.body;


        if (!projectId) {
            return res.status(400).json({ 
                success: false, 
                error: 'PROJECT_ID_REQUIRED',
                message: 'Project ID is required' 
            });
        }

        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'NO_FILE_UPLOADED',
                message: 'No document file was uploaded' 
            });
        }

        console.log(`📤 Document upload from user ${userId} for project ${projectId}`);
        console.log(`📄 File: ${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`);


        const result = await documentService.analyzeDocument(
            req.file.buffer,
            req.file.mimetype
        );

        res.json(result);

    } catch (error) {
        console.error('❌ Document Analysis Route Error:', error);


        if (error.code === 'QUOTA_EXCEEDED') {
            return res.status(429).json({
                success: false,
                error: 'QUOTA_EXCEEDED',
                message: 'Daily AI analysis limit reached. Please try again tomorrow.'
            });
        }


        if (error.message && error.message.includes('File too large')) {
            return res.status(400).json({
                success: false,
                error: 'FILE_TOO_LARGE',
                message: 'File size exceeds 10MB limit'
            });
        }

        if (error.message && error.message.includes('Invalid file type')) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_FILE_TYPE',
                message: 'Only PDF, JPG, and PNG files are supported'
            });
        }


        res.status(500).json({ 
            success: false, 
            error: 'ANALYSIS_FAILED',
            message: error.message || 'Failed to analyze document'
        });
    }
});


router.post('/analyze-url', clerkAuth, async (req, res) => {
    try {
        const { userId } = req.auth;
        const { url, projectId } = req.body;


        if (!projectId) {
            return res.status(400).json({ 
                success: false, 
                error: 'PROJECT_ID_REQUIRED',
                message: 'Project ID is required' 
            });
        }

        if (!url) {
            return res.status(400).json({ 
                success: false, 
                error: 'NO_URL_PROVIDED',
                message: 'URL is required' 
            });
        }


        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_URL',
                message: 'Invalid URL format'
            });
        }

        console.log(`🔗 URL analysis from user ${userId} for project ${projectId}`);
        console.log(`📄 URL: ${url}`);


        const result = await documentService.analyzeUrl(url);

        res.json(result);

    } catch (error) {
        console.error('❌ URL Analysis Route Error:', error);


        if (error.code === 'QUOTA_EXCEEDED') {
            return res.status(429).json({
                success: false,
                error: 'QUOTA_EXCEEDED',
                message: 'Daily AI analysis limit reached. Please try again tomorrow.'
            });
        }

        if (error.message && error.message.includes('fetch')) {
            return res.status(400).json({
                success: false,
                error: 'FETCH_FAILED',
                message: 'Could not fetch content from URL. Please check the link.'
            });
        }


        res.status(500).json({ 
            success: false, 
            error: 'ANALYSIS_FAILED',
            message: error.message || 'Failed to analyze URL'
        });
    }
});

module.exports = router;
