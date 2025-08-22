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



