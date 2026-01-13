const mongoose = require('mongoose');

const aiSuggestionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  section: {
    type: String,
    required: true
    // e.g., 'context.problemStatement'
  },
  promptType: {
    type: String,
    required: true
    // e.g., 'problem_refinement_v1'
  },
  suggestion: {
    type: mongoose.Schema.Types.Mixed,
    required: true
    // Can be a string or object depending on section
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AISuggestion', aiSuggestionSchema);
