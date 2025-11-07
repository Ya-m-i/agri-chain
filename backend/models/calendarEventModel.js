const mongoose = require('mongoose')

const calendarEventSchema = mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: [true, 'Farmer ID is required']
    },
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    type: {
        type: String,
        enum: ['planting', 'fertilizer', 'harvest', 'insurance', 'other'],
        default: 'other'
    },
    color: {
        type: String,
        default: 'gray'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true,
})

// Compound index to prevent duplicates (same farmer, title, and date)
calendarEventSchema.index({ farmerId: 1, title: 1, date: 1 }, { unique: true })

// Index for efficient querying by farmer and date
calendarEventSchema.index({ farmerId: 1, date: 1 })

module.exports = mongoose.model('CalendarEvent', calendarEventSchema)

