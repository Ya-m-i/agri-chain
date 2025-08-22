const mongoose = require('mongoose');

const assistanceSchema = mongoose.Schema({
  assistanceType: { type: String, required: true },
  description: { type: String },
  cropType: { type: String },
  founderName: { type: String },
  quantity: { type: Number, default: 0 },
  availableQuantity: { type: Number, default: 0 }, // Available for distribution
  region: { type: String, default: 'Kapalong' }, // Region-based inventory
  requiresRSBSA: { type: Boolean, default: true }, // RSBSA registration required
  requiresCertification: { type: Boolean, default: false }, // For cash assistance
  maxQuantityPerFarmer: { type: Number, default: 100 }, // Max kg per farmer
  quarterlyLimit: { type: Boolean, default: true }, // Quarterly limit check
  status: { type: String, enum: ['active', 'inactive', 'out_of_stock'], default: 'active' },
  dateAdded: { type: Date, default: Date.now },
  photo: { type: String }, // base64 or URL
}, { timestamps: true });

module.exports = mongoose.model('Assistance', assistanceSchema); 