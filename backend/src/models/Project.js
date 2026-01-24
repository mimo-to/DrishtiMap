const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'archived'],
    default: 'draft'
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  version: {
    type: Number,
    default: 1
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  meta: {
    lastOpenedAt: { type: Date, default: Date.now },
    completionPercent: { type: Number, default: 0, min: 0, max: 100 },
    wordCount: { type: Number, default: 0 }
  },
  activity: {
    lastSavedAt: { type: Date, default: Date.now },
    lastAIUsedAt: { type: Date, default: null }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lfaData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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

projectSchema.index({ clerkUserId: 1, isDeleted: 1, updatedAt: -1 });

projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
