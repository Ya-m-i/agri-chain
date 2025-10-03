const mongoose = require('mongoose');

const assistanceApplicationSchema = mongoose.Schema({
  farmerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Farmer', 
    required: true 
  },
  assistanceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assistance', 
    required: true 
  },
  requestedQuantity: { 
    type: Number, 
    required: true,
    min: 1 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'distributed'], 
    default: 'pending' 
  },
  applicationDate: { 
    type: Date, 
    default: Date.now 
  },
  reviewDate: { 
    type: Date 
  },
  distributionDate: { 
    type: Date 
  },
  officerNotes: { 
    type: String 
  },
  eligibilityCheck: {
    rsbsaRegistered: { type: Boolean, default: false },
    notAlreadyAvailed: { type: Boolean, default: false },
    withinQuarterlyLimit: { type: Boolean, default: false },
    stockAvailable: { type: Boolean, default: false },
    cropTypeMatch: { type: Boolean, default: false },
    isCertified: { type: Boolean, default: false } // For cash assistance
  },
  quarter: { 
    type: String // Q1, Q2, Q3, Q4 + year
  },
  filedBy: { type: String, default: 'farmer', enum: ['farmer', 'admin'] } // Track who filed the application
}, { timestamps: true });

// Index for efficient queries
assistanceApplicationSchema.index({ farmerId: 1, assistanceId: 1, quarter: 1 });
assistanceApplicationSchema.index({ status: 1 });

module.exports = mongoose.model('AssistanceApplication', assistanceApplicationSchema); 