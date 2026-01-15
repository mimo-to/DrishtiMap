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

    // --- 1. Robust Metadata Calculation ---
    
    // Helper: Word Count
    const calculateWordCount = (obj) => {
      if (!obj) return 0;
      let count = 0;
      Object.values(obj).forEach(val => {
        if (typeof val === 'string') count += val.trim().split(/\s+/).length;
        else if (typeof val === 'object' && val !== null) count += calculateWordCount(val); // Recurse
      });
      return count;
    };

    const derivedWordCount = calculateWordCount(projectData);

    // Helper: Auto-Title Generator
    const generateTitle = () => {
        // 1. Explicit Title
        if (title && title.trim() !== 'Untitled Project' && title.trim().length > 0) return title.trim();

        // 2. Fallback: Problem Statement (Level 1)
        // Access safely
        const ans = projectData.answers || {};
        const problem = ans['q1_problem'] || ans['problemStatement'];
        if (problem && typeof problem === 'string' && problem.length > 5) {
            return problem.substring(0, 60) + (problem.length > 60 ? '...' : '');
        }

        // 3. Fallback: Impact (Level 2)
        const impact = ans['q2_impact'] || ans['impact'];
        if (impact && typeof impact === 'string' && impact.length > 5) {
             return impact.substring(0, 60) + (impact.length > 60 ? '...' : '');
        }

        // 4. Fallback: Default
        return `New Methodology ${new Date().toLocaleDateString()}`;
    };

    const finalTitle = generateTitle();
    
    // Validate Progress
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

      // Smart Title Update:
      // If the current title is "Untitled..." OR the user explicitly provided a new title
      const isCurrentlyGeneric = project.title.startsWith('Untitled') || project.title.startsWith('New Methodology');
      // Fix: Don't let "Untitled Project" from the frontend override our smart title
      const incomingTitleValid = title && title.trim() !== 'Untitled Project' && title.trim().length > 0;
      
      if (incomingTitleValid) {
          project.title = title; // Explicit (valid) override always wins
      } else if (isCurrentlyGeneric && finalTitle !== project.title) {
          project.title = finalTitle; // Auto-upgrade title
      }

      project.data = projectData; 
      
      // Update Meta & Activity
      project.meta.wordCount = derivedWordCount;
      project.meta.completionPercent = cleanCompletion;
      
      project.activity.lastSavedAt = Date.now();
      project.updatedAt = Date.now();
      
      await project.save();

    } else {
      // Create new project
      project = await Project.create({
        clerkUserId,
        title: finalTitle,
        data: projectData,
        status: 'draft',
        meta: {
            wordCount: derivedWordCount,
            completionPercent: cleanCompletion, // Save calculated progress
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
