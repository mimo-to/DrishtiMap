const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  theme: {
    type: String,
    required: true,
    enum: ['fln', 'career', 'teacher_dev', 'custom']
  },
  structure: {
    problemStatement: String,
    stakeholders: [String],
    activities: [String],
    outcomes: [String]
  },
  isSystem: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Template', templateSchema);
