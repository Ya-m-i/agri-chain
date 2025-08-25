const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/agri-chain'
        console.log('Attempting to connect to MongoDB with URI:', mongoUri)
        
        // Optimize MongoDB connection for React Query patterns
        const conn = await mongoose.connect(mongoUri, {
            // Connection pool optimizations for React Query
            maxPoolSize: 10, // Maximum number of connections in the pool
            minPoolSize: 2,  // Minimum number of connections in the pool
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            serverSelectionTimeoutMS: 5000, // How long to try selecting a server
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            bufferMaxEntries: 0, // Disable mongoose buffering
            bufferCommands: false, // Disable mongoose buffering
        })
        
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline)
        
        // Set up database event listeners for React Query optimization
        conn.connection.on('error', (err) => {
            console.log('MongoDB connection error:', err)
        })
        
        conn.connection.on('disconnected', () => {
            console.log('MongoDB disconnected')
        })
        
        // Ensure indexes are created for optimal React Query performance
        await createOptimizedIndexes()
        
    } catch (error) {
        console.log('MongoDB connection error:', error)
        console.log('Please make sure MongoDB is running and accessible')
        process.exit(1)
    }
}

// Create optimized indexes for React Query patterns
const createOptimizedIndexes = async () => {
    try {
        const db = mongoose.connection.db
        
        // Index for farmers collection (frequently queried by React Query)
        await db.collection('farmers').createIndex({ createdAt: -1 })
        await db.collection('farmers').createIndex({ cropType: 1 })
        await db.collection('farmers').createIndex({ location: '2dsphere' })
        
        // Index for claims collection (frequently updated and queried)
        await db.collection('claims').createIndex({ farmerId: 1, status: 1 })
        await db.collection('claims').createIndex({ createdAt: -1 })
        await db.collection('claims').createIndex({ status: 1, date: -1 })
        
        // Index for assistance collection
        await db.collection('assistances').createIndex({ cropType: 1, status: 1 })
        await db.collection('assistances').createIndex({ availableQuantity: 1 })
        
        // Index for applications collection
        await db.collection('assistanceapplications').createIndex({ farmerId: 1, status: 1 })
        await db.collection('assistanceapplications').createIndex({ createdAt: -1 })
        
        // Index for crop insurance collection
        await db.collection('cropinsurances').createIndex({ farmerId: 1 })
        await db.collection('cropinsurances').createIndex({ cropType: 1, farmerId: 1 })
        
        console.log('MongoDB indexes created successfully for React Query optimization')
    } catch (error) {
        console.log('Warning: Could not create indexes:', error.message)
    }
}

module.exports = connectDB