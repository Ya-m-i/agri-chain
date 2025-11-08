const express = require('express')
const cors = require('cors')
const { createServer } = require('http')
const { Server } = require('socket.io')
const colors = require('colors')
const dotenv = require('dotenv').config()
const { errorHandler } = require('./middleware/errorMiddleware')
const connectDB = require('./config/db')
const port = process.env.PORT || 5000

console.log('�� Starting AGRI-CHAIN server with environment:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI ? 'SET ✅' : 'NOT SET ❌',
    FRONTEND_URL: process.env.FRONTEND_URL || 'Not specified',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET ✅' : 'NOT SET ❌',
    FABRIC_SERVICE_URL: process.env.FABRIC_SERVICE_URL ? 'SET ✅' : 'NOT SET ❌'
})

connectDB()

const app = express()
const server = createServer(app)

// Socket.IO setup with enhanced CORS for GitHub Pages
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          'https://ya-m-i.github.io',
          'https://ya-m-i.github.io/agri-chain',
          process.env.FRONTEND_URL,
          'https://agri-chain.onrender.com',
          'https://agri-chain-frontend.onrender.com',
          'https://kapalongagrichain.site',
          'https://www.kapalongagrichain.site'
        ].filter(Boolean)
      : [
          'http://localhost:3000', 
          'http://localhost:5173', 
          'http://localhost:5174',
          'https://ya-m-i.github.io',
          'https://ya-m-i.github.io/agri-chain', 
          'https://agri-chain.onrender.com',
          'https://agri-chain-frontend.onrender.com',
          'https://kapalongagrichain.site',
          'https://www.kapalongagrichain.site'
        ],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true // For compatibility
})

// Standard CORS middleware as primary configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://ya-m-i.github.io',
          'https://ya-m-i.github.io/agri-chain',
          process.env.FRONTEND_URL,
          'https://agri-chain.onrender.com',
          'https://agri-chain-frontend.onrender.com',
          'https://kapalongagrichain.site',
          'https://www.kapalongagrichain.site'
        ].filter(Boolean)
      : [
          'http://localhost:3000', 
          'http://localhost:5173', 
          'http://localhost:5174',
          'https://ya-m-i.github.io',
          'https://ya-m-i.github.io/agri-chain',
          'https://agri-chain.onrender.com',
          'https://agri-chain-frontend.onrender.com',
          'https://kapalongagrichain.site',
          'https://www.kapalongagrichain.site'
        ]
    
    console.log('�� CORS Origin Check:', { origin, allowedOrigins })
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    
    // Check if origin is allowed
    if (allowedOrigins.includes(origin) || 
        (process.env.NODE_ENV === 'production' && (origin.includes('ya-m-i.github.io') || origin.includes('kapalongagrichain.site')))) {
      console.log('✅ CORS: Origin allowed -', origin)
      return callback(null, true)
    }
    
    console.log('❌ CORS: Origin blocked -', origin)
    return callback(new Error('Not allowed by CORS'), false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}

app.use(cors(corsOptions))

// Enhanced CORS configuration for production deployment
app.use((req, res, next) => {
    // Define allowed origins based on environment
    const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? [
            'https://ya-m-i.github.io', 
            'https://ya-m-i.github.io/agri-chain',
            process.env.FRONTEND_URL,
            'https://agri-chain.onrender.com',
            'https://agri-chain-frontend.onrender.com',
            'https://kapalongagrichain.site',
            'https://www.kapalongagrichain.site'
          ].filter(Boolean) // Remove undefined values
        : [
            'http://localhost:3000', 
            'http://localhost:5173', 
            'http://localhost:5174',
            'https://ya-m-i.github.io',
            'https://ya-m-i.github.io/agri-chain',
            'https://agri-chain.onrender.com',
            'https://agri-chain-frontend.onrender.com',
            'https://kapalongagrichain.site',
            'https://www.kapalongagrichain.site'
          ]
    
    const origin = req.headers.origin
    console.log('🌐 CORS Check:', { 
        requestOrigin: origin, 
        allowedOrigins, 
        nodeEnv: process.env.NODE_ENV 
    })
    
    // Always set CORS headers for production GitHub Pages and custom domain
    if (allowedOrigins.includes(origin) || 
        (process.env.NODE_ENV === 'production' && origin && (origin.includes('ya-m-i.github.io') || origin.includes('kapalongagrichain.site')))) {
        res.setHeader('Access-Control-Allow-Origin', origin)
        console.log('✅ CORS allowed for origin:', origin)
    } else if (process.env.NODE_ENV === 'development') {
        // More permissive for development
        res.setHeader('Access-Control-Allow-Origin', origin || '*')
    }
    
    // Set comprehensive CORS headers
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma, X-Requested-With')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Max-Age', '86400') // Cache preflight for 24 hours
    
    // Handle preflight OPTIONS requests immediately
    if (req.method === 'OPTIONS') {
        console.log('🚀 Handling OPTIONS preflight request from:', origin)
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

// Health check and CORS test endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'AGRI-CHAIN API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        cors: {
            origin: req.headers.origin,
            allowedInProduction: [
                'https://ya-m-i.github.io',
                'https://ya-m-i.github.io/agri-chain'
            ]
        }
    })
})

// CORS preflight test endpoint
app.options('/api/cors-test', (req, res) => {
    res.json({ message: 'CORS preflight successful' })
})

app.get('/api/cors-test', (req, res) => {
    res.json({ 
        message: 'CORS test successful',
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
    })
})

app.use('/api/farms', require('./routes/farmRoutes'))
app.use('/api/users', require('./routes/userRoutes'))
app.use('/api/farmers', require('./routes/farmerRoutes'))
app.use('/api/claims', require('./routes/claimRoutes'))
app.use('/api/assistance', require('./routes/assistanceRoutes'))
app.use('/api/crop-insurance', require('./routes/cropInsuranceRoutes'))
app.use('/api/blockchain-claims', require('./routes/blockchainClaimsRoutes'))
app.use('/api/distribution-records', require('./routes/distributionRoutes'))
app.use('/api/crop-prices', require('./routes/cropPriceRoutes'))
app.use('/api/notifications', require('./routes/notificationRoutes'))
app.use('/api/calendar-events', require('./routes/calendarEventRoutes'))

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`.cyan)
  
  // Handle room joining for targeted updates
  socket.on('join-room', (room) => {
    socket.join(room)
    console.log(`Client ${socket.id} joined room: ${room}`.green)
  })
  
  socket.on('leave-room', (room) => {
    socket.leave(room)
    console.log(`Client ${socket.id} left room: ${room}`.yellow)
  })
  
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`.red)
  })
})

// Make io available to routes for emitting events
app.set('io', io)

app.use(errorHandler)

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ AGRI-CHAIN Server running on port: ${port}`.green.bold)
  console.log(`�� Server URL: ${process.env.NODE_ENV === 'production' ? 'https://agri-chain.onrender.com' : `http://localhost:${port}`}`.cyan)
  console.log(`🔌 Socket.IO server initialized`.cyan)
  console.log(`🌐 CORS enabled for GitHub Pages (ya-m-i.github.io)`.green)
  console.log(`📊 Health check available at: /api/health`.yellow)
  
  // Log environment-specific info
  if (process.env.NODE_ENV === 'production') {
    console.log(`🚀 Production mode - GitHub Pages integration active`.green.bold)
  } else {
    console.log(`�� Development mode - Local development active`.blue.bold)
  }
})