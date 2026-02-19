const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username']
    },
    password: {
        type: String,
        required: [true, 'Please add an email']
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    name: {
        type: String
    },
    profileImageData: { type: Buffer },
    profileImageType: { type: String },
    profileImageSize: { type: Number },
    profileImageVersion: { type: Number, default: 0 },
},{
    timestamps: true,
})

// Add index for faster login queries
userSchema.index({ username: 1 }, { unique: true })

module.exports = mongoose.model('User', userSchema)

