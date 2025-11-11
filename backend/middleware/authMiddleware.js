const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const protect = asyncHandler(async (req, res, next) => {

    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]

            
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Use lean() for faster query - returns plain JS object instead of Mongoose document
            // Only select necessary fields to reduce data transfer
            req.user = await User.findById(decoded.id).select('-password').lean()

            if (!req.user) {
                res.status(401)
                throw new Error('User not found')
            }

            // Call next() to continue to the route handler
            next()
            return

        }catch(error) {
            console.log(error)
            res.status(401)
            throw new Error('Not authorized!')
        }
    }

    if(!token) {
        res.status(401)
        throw new Error('Not authorized!')
    }

    
})

module.exports = { protect }

