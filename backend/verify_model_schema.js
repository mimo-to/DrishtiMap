const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Project = require('./src/models/Project');

async function verifyModel() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const clerkUserId = "test_verifier_" + Date.now();

    // 1. Create
    console.log('1. Testing Create...');
    const project = await Project.create({
        clerkUserId,
        title: "Model Upgrade Test",
        data: { q1: "Hello world this is a test" },
        // Trigger pre-save middleware defaults
    });
    console.log('   meta.wordCount default (should be 0 or populated if routes handled it, but here directly via model it relies on defaults):', project.meta.wordCount); 
    // Wait, the logic is in ROUTES, not Model pre-save for wordCount. So direct model create won't have it.
    // That's fine, we are verifying SCHEMA exists.
    
    if (project.meta && project.activity && project.isDeleted === false) {
        console.log('   PASS: Schema fields present.');
    } else {
        console.log('   FAIL: Schema fields missing.');
    }

    // 2. Soft Delete
    console.log('2. Testing Soft Delete Index...');
    project.isDeleted = true;
    await project.save();
    
    const found = await Project.findOne({ clerkUserId, isDeleted: { $ne: true } });
    if (!found) {
        console.log('   PASS: correctly filtered out.');
    } else {
        console.log('   FAIL: Item still found.');
    }

    // Clean up
    await Project.deleteMany({ clerkUserId });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

verifyModel();
