const express = require('express');
const router = express.Router();
const clerkAuth = require('../middleware/clerkAuth');
const Project = require('../models/Project');
const User = require('../models/User');


router.use(clerkAuth);


const ensureUser = async (clerkUserId, email) => {
  let user = await User.findOne({ clerkUserId });
  if (!user) {
    user = await User.create({ clerkUserId, email });
  }
  return user;
};


router.post('/', async (req, res) => {
  try {
    const { userId: clerkUserId, claims } = req.auth;
    const { title, answers, projectId, data, meta } = req.body;
    const projectData = data || answers || {};
    

    await ensureUser(clerkUserId);


    

    const calculateWordCount = (obj) => {
      if (!obj) return 0;
      let count = 0;
      Object.values(obj).forEach(val => {
        if (typeof val === 'string') count += val.trim().split(/\s+/).length;
        else if (typeof val === 'object' && val !== null) count += calculateWordCount(val);
      });
      return count;
    };

    const derivedWordCount = calculateWordCount(projectData);


    const generateTitle = () => {

        if (title && title.trim() !== 'Untitled Project' && title.trim().length > 0) return title.trim();


        const ans = projectData.answers || {};
        const problem = ans['q1_problem'] || ans['problemStatement'];
        if (problem && typeof problem === 'string' && problem.length > 5) {
            return problem.substring(0, 60) + (problem.length > 60 ? '...' : '');
        }


        const impact = ans['q2_impact'] || ans['impact'];
        if (impact && typeof impact === 'string' && impact.length > 5) {
             return impact.substring(0, 60) + (impact.length > 60 ? '...' : '');
        }


        return `New Methodology ${new Date().toLocaleDateString()}`;
    };

    const finalTitle = generateTitle();
    

    let cleanCompletion = 0;
    if (meta && typeof meta.completionPercent === 'number') {
        cleanCompletion = Math.min(100, Math.max(0, meta.completionPercent));
    }

    let project;

    if (projectId) {

      project = await Project.findOne({ _id: projectId, clerkUserId });
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const isCurrentlyGeneric = project.title.startsWith('Untitled') || project.title.startsWith('New Methodology');
      const incomingTitleValid = title && title.trim() !== 'Untitled Project' && title.trim().length > 0;
      
      if (incomingTitleValid) {
          project.title = title;
      } else if (isCurrentlyGeneric && finalTitle !== project.title) {
          project.title = finalTitle;
      }

      project.data = projectData; 
      

      project.meta.wordCount = derivedWordCount;
      project.meta.completionPercent = cleanCompletion;
      
      project.activity.lastSavedAt = Date.now();
      project.updatedAt = Date.now();
      
      await project.save();

    } else {

      project = await Project.create({
        clerkUserId,
        title: finalTitle,
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


router.get('/', async (req, res) => {
  try {
    const { userId: clerkUserId } = req.auth;
    

    await ensureUser(clerkUserId);


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


router.get('/:id', async (req, res) => {
  try {
    const { userId: clerkUserId } = req.auth;
    const project = await Project.findOne({ _id: req.params.id, clerkUserId });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }


    project.meta.lastOpenedAt = Date.now();
    project.save().catch(err => console.error("Failed to update lastOpenedAt", err));

    res.json({ success: true, project });

  } catch (error) {
    console.error('Fetch Project Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});


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


router.patch('/:id', async (req, res) => {
  try {
    const { userId: clerkUserId } = req.auth;
    const { title } = req.body;
    

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
