const express = require('express');
const router = express.Router();
const clerkAuth = require('../middleware/clerkAuth');
const Project = require('../models/Project');
const User = require('../models/User');

// Apply auth middleware to all routes
router.use(clerkAuth);

/**
 * Helper to ensure User exists in our DB
 */
const ensureUser = async (clerkUserId, email) => {
  let user = await User.findOne({ clerkUserId });
  if (!user) {
    user = await User.create({ clerkUserId, email });
  }
  return user;
};

/**
 * @route   POST /api/projects
 * @desc    Create or Update a Project
 * @access  Private (Clerk)
 */
router.post('/', async (req, res) => {
  try {
    const { userId: clerkUserId, claims } = req.auth;
    const { title, answers, projectId, data, meta } = req.body;
    const projectData = data || answers || {};
    
    // Ensure local user record exists
    await ensureUser(clerkUserId);

    // Helper to calculate word count
    const calculateWordCount = (obj) => {
      let count = 0;
      if (!obj) return 0;
      Object.values(obj).forEach(val => {
        if (typeof val === 'string') {
          count += val.trim().split(/\s+/).length;
        }
      });
      return count;
    };

    // Derived Metadata
    const derivedWordCount = calculateWordCount(projectData);
    // Clamp client-provided completion or default to existing/0
    // Note: Ideally backend should calculate this based on schema, but strictly clamping for now from plan.
    let cleanCompletion = 0;
    if (meta && typeof meta.completionPercent === 'number') {
        cleanCompletion = Math.min(100, Math.max(0, meta.completionPercent));
    }

    let project;

    if (projectId) {
      // Update existing project
      project = await Project.findOne({ _id: projectId, clerkUserId });
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      project.title = title || project.title;
      project.data = projectData; 
      
      // Update Meta & Activity
      project.meta.wordCount = derivedWordCount;
      if (meta && meta.completionPercent !== undefined) {
          project.meta.completionPercent = cleanCompletion;
      }
      project.activity.lastSavedAt = Date.now();
      
      project.updatedAt = Date.now();
      await project.save();

    } else {
      // Create new project
      project = await Project.create({
        clerkUserId,
        title: title || 'Untitled Project',
        data: projectData,
        status: 'draft',
        meta: {
            wordCount: derivedWordCount,
            completionPercent: cleanCompletion,
            lastOpenedAt: Date.now()
        },
        activity: {
            lastSavedAt: Date.now()
        }
      });
    }

    res.json({ success: true, project });

  } catch (error) {
    console.error('Project Save Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

/**
 * @route   GET /api/projects
 * @desc    Get all projects for user
 * @access  Private (Clerk)
 */
router.get('/', async (req, res) => {
  try {
    const { userId: clerkUserId } = req.auth;
    
    // Ensure user exists (lazy creation on first load too)
    await ensureUser(clerkUserId);

    // Filter out deleted projects
    const projects = await Project.find({ 
        clerkUserId, 
        isDeleted: { $ne: true } 
    }).sort({ updatedAt: -1 });

    res.json({ success: true, projects });

  } catch (error) {
    console.error('Fetch Projects Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project
 * @access  Private (Clerk)
 */
router.get('/:id', async (req, res) => {
  try {
    const { userId: clerkUserId } = req.auth;
    const project = await Project.findOne({ _id: req.params.id, clerkUserId });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Side effect: Update lastOpenedAt
    // We do this async and don't await/block the response to keep it fast
    project.meta.lastOpenedAt = Date.now();
    project.save().catch(err => console.error("Failed to update lastOpenedAt", err));

    res.json({ success: true, project });

  } catch (error) {
    console.error('Fetch Project Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Soft delete project
 * @access  Private (Clerk)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { userId: clerkUserId } = req.auth;
    const project = await Project.findOne({ _id: req.params.id, clerkUserId });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    project.isDeleted = true;
    project.deletedAt = Date.now();
    await project.save();

    res.json({ success: true, projectId: project._id });

  } catch (error) {
    console.error('Delete Project Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

/**
 * @route   PATCH /api/projects/:id
 * @desc    Update project metadata (Title only for now)
 * @access  Private (Clerk)
 */
router.patch('/:id', async (req, res) => {
  try {
    const { userId: clerkUserId } = req.auth;
    const { title } = req.body;
    
    // Find regardless of soft-delete? No, shouldn't update deleted projects.
    const project = await Project.findOne({ 
        _id: req.params.id, 
        clerkUserId,
        isDeleted: { $ne: true }
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (title) project.title = title;
    
    project.updatedAt = Date.now();
    await project.save();

    res.json({ success: true, project });

  } catch (error) {
    console.error('Update Project Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
