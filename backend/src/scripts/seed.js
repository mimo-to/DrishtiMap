const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Template = require('../models/Template');
const connectDB = require('../config/db');

dotenv.config();

const seeds = [
  {
    name: 'Foundational Literacy & Numeracy (FLN)',
    description: 'Standard framework for improving basic reading and math skills in primary schools.',
    theme: 'fln',
    structure: {
      problemStatement: 'Low reading proficiency in Grade 3 students.',
      stakeholders: ['Teachers', 'Parents', 'School Management Committee', 'Block Education Officer'],
      activities: ['Teacher training workshops', 'Distribution of learning kits', 'Community reading camps'],
      outcomes: ['Improved reading speed', 'Increased student attendance']
    },
    isDefault: true
  },
  {
    name: 'Teacher Professional Development',
    description: 'Framework for upskilling government school teachers.',
    theme: 'teacher-training',
    structure: {
      problemStatement: 'Outdated pedagogical methods used in classrooms.',
      stakeholders: ['Teachers', 'Principals', 'District Institute of Education and Training'],
      activities: ['Needs assessment survey', 'Monthly cluster meetings', 'Digital resource library creation'],
      outcomes: ['Adoption of active learning methods', 'Improved classroom engagement']
    },
    isDefault: true
  },
  {
    name: 'Community Learning Centers',
    description: 'Establishing after-school support systems.',
    theme: 'community',
    structure: {
      problemStatement: 'Lack of safe learning spaces after school hours.',
      stakeholders: ['Community Volunteers', 'Local Governance', 'Parents'],
      activities: ['Volunteer recruitment', 'Space identification', 'Regular evening classes'],
      outcomes: ['Increased homework completion', 'Reduced dropout rates']
    },
    isDefault: true
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing default templates
    await Template.deleteMany({ isDefault: true });
    
    // Insert new ones
    await Template.insertMany(seeds);
    
    console.log('✅ core LFA Templates seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedDB();
