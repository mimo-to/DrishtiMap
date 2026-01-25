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
  },
  promptType: {
    type: String,
    required: true
  },
  suggestion: {
    type: mongoose.Schema.Types.Mixed,
    required: true
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
