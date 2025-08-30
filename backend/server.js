const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
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
const server = createServer(app)

// Socket.IO setup with CORS for React Query integration
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, 'https://ya-m-i.github.io/agri-chain', 'https://agri-chain.onrender.com'] 
      : ['http://localhost:3000', 'http://localhost:5173', 'https://ya-m-i.github.io/agri-chain', 'https://agri-chain.onrender.com'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Manual CORS configuration for React Query
app.use((req, res, next) => {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, 'https://ya-m-i.github.io/agri-chain', 'https://agri-chain.onrender.com'] 
        : ['http://localhost:3000', 'http://localhost:5173', 'https://ya-m-i.github.io/agri-chain', 'https://agri-chain.onrender.com']
    
    const origin = req.headers.origin
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin)
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma')
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
  console.log(`Server running on port: ${port}`.green)
  console.log(`Socket.IO server initialized`.cyan)
})



