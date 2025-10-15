const mongoose = require('mongoose')

const farmerSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    birthday: { type: String },
    gender: { type: String },
    contactNum: { type: String },
    address: { type: String },
    cropType: { type: String },
    cropArea: { type: String },
    insuranceType: { type: String },
    lotNumber: { type: String },
    lotArea: { type: String },
    agency: { type: String },
    isCertified: { type: Boolean, default: false },
    rsbsaRegistered: { type: Boolean, default: false }, // RSBSA registration status
    periodFrom: { type: String },
    periodTo: { type: String },
    username: { type: String, required: true },
    password: { type: String, required: true },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    lastLogin: { type: Date, default: null },
    isOnline: { type: Boolean, default: false }
}, {
    timestamps: true,
})

module.exports = mongoose.model('Farmer', farmerSchema) 