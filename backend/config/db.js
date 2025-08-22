const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/agri-chain'
        console.log('Attempting to connect to MongoDB with URI:', mongoUri)
        const conn = await mongoose.connect(mongoUri)
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline)
    } catch (error) {
        console.log('MongoDB connection error:', error)
        console.log('Please make sure MongoDB is running and accessible')
        process.exit(1)
    }
}

module.exports = connectDB