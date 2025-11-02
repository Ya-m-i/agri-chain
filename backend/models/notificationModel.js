const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  recipientType: {
    type: String,
    enum: ['admin', 'farmer'],
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    default: null // null for admin, farmerId for farmer
  },
  type: {
    type: String,
    enum: ['success', 'error', 'warning', 'info'],
    default: 'info'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedEntityType: {
    type: String,
    enum: ['claim', 'application', 'assistance', 'farmer', 'general'],
    default: 'general'
  },
  relatedEntityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // Reference to claim, application, etc.
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient queries
notificationSchema.index({ recipientType: 1, recipientId: 1, read: 1 });
notificationSchema.index({ timestamp: -1 });
notificationSchema.index({ recipientType: 1, timestamp: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

