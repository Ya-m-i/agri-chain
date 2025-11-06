const mongoose = require('mongoose')
const initDefaultAdmin = require('../scripts/initDefaultAdmin')

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/agri-chain'
        console.log('Attempting to connect to MongoDB with URI:', mongoUri)
        
        // Optimize MongoDB connection for React Query patterns and Atlas cluster stability
        const conn = await mongoose.connect(mongoUri, {
            // Connection pool optimizations for React Query
            maxPoolSize: 10, // Maximum number of connections in the pool
            minPoolSize: 5,  // Increased minimum connections for stability
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            serverSelectionTimeoutMS: 10000, // Increased timeout for Atlas clusters
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            connectTimeoutMS: 10000, // Connection timeout
            heartbeatFrequencyMS: 10000, // How often to check server health
            retryWrites: true, // Enable retryable writes for Atlas
            retryReads: true, // Enable retryable reads for Atlas
            // Note: bufferMaxEntries and bufferCommands are deprecated in newer MongoDB drivers
            // React Query handles retries and caching, so we don't need these options
        })
        
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline)
        
        // Set up database event listeners for React Query optimization
        conn.connection.on('error', (err) => {
            console.log('MongoDB connection error:', err.message)
        })
        
        conn.connection.on('disconnected', () => {
            console.log('MongoDB disconnected - will attempt to reconnect automatically')
        })
        
        conn.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected successfully')
        })
        
        conn.connection.on('close', () => {
            console.log('MongoDB connection closed')
        })
        
        // Note: Index creation disabled to prevent connection timeouts
        // Indexes will be created automatically by MongoDB when needed
        console.log('✅ MongoDB connection established successfully')
        
        // Initialize default admin after successful connection
        await initDefaultAdmin();
        
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
        await db.collection('farmers').createIndex({ username: 1 }) // Add username index for login queries
        // Note: Skipping location 2dsphere index due to existing data format incompatibility
        
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
        // Continue without exiting - indexes are optional for basic functionality
    }
}

module.exports = connectDB