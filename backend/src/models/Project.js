const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
    // Note: Increment this only on explicit 'Save Version' actions
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  lfaData: {
    context: {
      problemStatement: String,
      geography: String,
      targetGroup: String
    },
    stakeholders: [{
      name: String,
      role: String,
      influence: String
    }],
    strategy: {
      goal: String,
      outcomes: [{
        id: String, // UUID for stable referencing
        description: String
      }],
      activities: [{
        description: String,
        timeline: String
      }]
    },
    indicators: [{
      outcomeId: String, // Links to strategy.outcomes.id
      metric: String,
      verificationSource: String
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
