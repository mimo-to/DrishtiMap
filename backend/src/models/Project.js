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
    enum: ['draft', 'completed'],
    default: 'draft'
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  lfaData: {
    context: {
      problem: String,
      causes: [String],
      geography: String
    },
    stakeholders: [{
      name: String,
      role: String,
      interest: String
    }],
    strategy: {
      goal: String,
      outcomes: [String],
      activities: [{
        name: String,
        timeline: String
      }]
    },
    indicators: [{
      outcome: String,
      indicator: String,
      verification: String
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
