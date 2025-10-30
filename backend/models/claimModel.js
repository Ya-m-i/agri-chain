const mongoose = require('mongoose')

const claimSchema = mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  farmerLocation: { type: String },
  crop: { type: String, required: true },
  areaInsured: { type: Number },
  varietyPlanted: { type: String },
  plantingDate: { type: Date },
  cicNumber: { type: String },
  underwriter: { type: String },
  program: [{ type: String }],
  otherProgramText: { type: String },
  areaDamaged: { type: Number },
  degreeOfDamage: { type: Number },
  damageType: { type: String },
  lossDate: { type: Date },
  ageStage: { type: String },
  expectedHarvest: { type: String },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  adminFeedback: { type: String },
  compensation: { type: Number },
  reviewDate: { type: Date },
  completionDate: { type: Date },
  damagePhotos: [{ type: String }],
  lotBoundaries: {
    1: { north: String, south: String, east: String, west: String },
    2: { north: String, south: String, east: String, west: String },
    3: { north: String, south: String, east: String, west: String },
    4: { north: String, south: String, east: String, west: String },
  },
  claimNumber: { type: String, unique: true },
  filedBy: { type: String, default: 'farmer', enum: ['farmer', 'admin'] }, // Track who filed the claim
}, { timestamps: true })

module.exports = mongoose.model('Claim', claimSchema) 