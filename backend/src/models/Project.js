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
    // Note: Increment this only on explicit 'Save Version' actions
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  // Rich Metadata & Stats
  meta: {
    lastOpenedAt: { type: Date, default: Date.now },
    completionPercent: { type: Number, default: 0, min: 0, max: 100 },
    wordCount: { type: Number, default: 0 }
  },
  // Activity Tracking
  activity: {
    lastSavedAt: { type: Date, default: Date.now },
    lastAIUsedAt: { type: Date, default: null }
  },
  // Flexible content storage
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Legacy fields (optional support for structured data if needed, but data is primary now)
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

// Compound Index for efficient dashboard sorting and filtering
projectSchema.index({ clerkUserId: 1, isDeleted: 1, updatedAt: -1 });

projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
