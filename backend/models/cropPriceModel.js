const mongoose = require('mongoose')

const cropPriceSchema = mongoose.Schema({
    cropName: { 
        type: String, 
        required: true 
    },
    cropType: { 
        type: String, 
        required: false // Optional for crops that don't have sub-types
    },
    pricePerKg: { 
        type: Number, 
        required: true,
        min: 0 
    },
    unit: {
        type: String,
        default: 'kg',
        enum: ['kg', 'piece', 'bundle', 'sack']
    },
    region: {
        type: String,
        default: 'Philippines Average'
    },
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    },
    updatedBy: {
        type: String,
        default: 'Admin'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    notes: {
        type: String
    },
    image: {
        type: String // Base64 encoded image or URL
    }
}, {
    timestamps: true,
})

// Index for faster queries
cropPriceSchema.index({ cropName: 1, cropType: 1 })

module.exports = mongoose.model('CropPrice', cropPriceSchema)

