const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const { validatePasswordWithMessage } = require('../utils/passwordValidator') 

// @desc Register new user
// @route POST /api/users
// @access Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if(!username || !password) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Validate password strength
    const passwordError = validatePasswordWithMessage(password)
    if (passwordError) {
        res.status(400)
        throw new Error(passwordError)
    }

    const userExists = await User.findOne({ username })

    if(userExists) {
        res.status(400)
        throw new Error('User already exists')
    }
    // Hash password with salt rounds of 6 for faster hashing on free tier servers
    // 6 rounds = 64 iterations (vs 8 rounds = 256 iterations, 10 rounds = 1024 iterations)
    // Still secure enough for most applications, especially on resource-constrained servers
    const salt = await bcrypt.genSalt(6)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
        username,
        password: hashedPassword
    })

    if(user) {  
        res.status(201).json({
            _id: user._id,
            username: user.username,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

// @desc Auth user & get token (optimized for speed)
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body
    
    // Optimize: Only fetch essential fields for login
    // Use lean() for faster query (returns plain JS object, no Mongoose overhead)
    const user = await User.findOne({ username })
        .select('_id username password role name')
        .lean()

    if(user && (await bcrypt.compare(password, user.password))) {
        // Return minimal data - only what's needed for login
        res.json({
            _id: user._id,
            id: user._id,
            username: user.username,
            role: user.role || 'user',
            name: user.name || user.username,
            token: generateToken(user._id)
        })
    }else{
        res.status(400)
        throw new Error('Invalid credentials')
    }
})

// @desc Get user data
// @route GET /api/users/me
// @access private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password')

    res.status(200).json({
        _id: user._id,
        id: user._id,
        username: user.username,
        role: user.role || 'user',
        name: user.name || user.username,
    })
})

// @desc Update user profile
// @route PUT /api/users/:id
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { username, password, name } = req.body
    const updateData = {}

    // Security check: Only allow users to update their own profile, or admins to update any profile
    // req.user is already fetched by protect middleware (with lean() for performance)
    const userId = req.user._id?.toString() || req.user.id?.toString()
    const targetUserId = req.params.id
    
    if (userId !== targetUserId) {
        // User trying to update someone else's profile
        // Only admins can do this
        if (req.user.role !== 'admin') {
            res.status(403)
            throw new Error('Not authorized to update this profile')
        }
    }

    // Check if username is being changed and if it's already taken
    // Only check if username is actually provided and different from current
    // We need to fetch current username first if it's being changed
    if (username) {
        // Only check uniqueness if username is actually being changed
        // Fetch current user to compare (only if username is provided)
        const currentUser = await User.findById(req.params.id).select('username').lean()
        if (!currentUser) {
            res.status(404)
            throw new Error('User not found')
        }
        
        if (username !== currentUser.username) {
            // Username is being changed - check if new username is available
            const usernameExists = await User.findOne({ username }).select('_id').lean()
            if (usernameExists) {
                res.status(400)
                throw new Error('Username already exists')
            }
            updateData.username = username
        }
    }

    // Hash password if provided
    if (password) {
        // Validate password strength
        const passwordError = validatePasswordWithMessage(password)
        if (passwordError) {
            res.status(400)
            throw new Error(passwordError)
        }
        // Use salt rounds of 6 for faster hashing on free tier servers
        // 6 rounds = 64 iterations (vs 8 rounds = 256 iterations, 10 rounds = 1024 iterations)
        // Still secure enough for most applications, especially on resource-constrained servers
        const salt = await bcrypt.genSalt(6)
        updateData.password = await bcrypt.hash(password, salt)
    }

    // Update name if provided
    if (name !== undefined) {
        updateData.name = name
    }

    if (Object.keys(updateData).length === 0) {
        res.status(400)
        throw new Error('No fields to update')
    }

    // Use findByIdAndUpdate for better performance - single query instead of two
    // This matches the farmer route performance while maintaining security
    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true } // Return updated document
    ).select('-password').lean() // Use lean() for faster query (returns plain JS object)

    if (!updatedUser) {
        res.status(404)
        throw new Error('User not found')
    }

    res.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        role: updatedUser.role || 'user',
        name: updatedUser.name || updatedUser.username,
        message: 'Profile updated successfully'
    })
})

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: '30d' 
    })
}


module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUser,
}
