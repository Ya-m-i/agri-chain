const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const { errorHandler } = require('./middleware/errorMiddleware')
const connectDB = require('./config/db')
const port = process.env.PORT || 5000

console.log('Starting server with environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI ? 'SET' : 'NOT SET'
})

connectDB()

const app = express()

// Manual CORS configuration for React Query
app.use((req, res, next) => {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL] 
        : ['http://localhost:3000', 'http://localhost:5173']
    
    const origin = req.headers.origin
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin)
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }
    
    next()
})

// Middleware for React Query optimization
app.use((req, res, next) => {
    // Disable caching for API responses (React Query handles caching)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    
    next()
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use('/api/farms', require('./routes/farmRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/farmers', require('./routes/farmerRoutes'))
app.use('/api/claims', require('./routes/claimRoutes'))
app.use('/api/assistance', require('./routes/assistanceRoutes'))
app.use('/api/crop-insurance', require('./routes/cropInsuranceRoutes'))

app.use(errorHandler)


app.listen(port, '0.0.0.0', () => console.log(`Server running on port: ${port}`))



