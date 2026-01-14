const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function verify() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const Project = mongoose.model('Project', new mongoose.Schema({
        title: String,
        clerkUserId: String,
        data: Object
    }));

    const projects = await Project.find({}).sort({ _id: -1 }).limit(1);
    console.log('--- LATEST PROJECT ---');
    console.log(JSON.stringify(projects, null, 2));
    console.log('----------------------');

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

verify();
