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
    // Hash password
    const salt = await bcrypt.genSalt(10)
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

// @desc Auth user & get token
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {

    const { username, password } = req.body
    // check for user email
    const user = await User.findOne({ username })

    if(user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user._id,
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

    // Check if user exists
    const user = await User.findById(req.params.id)
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Only allow users to update their own profile (or admins can update any)
    if (req.user.id !== req.params.id && user.role !== 'admin') {
        res.status(403)
        throw new Error('Not authorized to update this profile')
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
        const usernameExists = await User.findOne({ username })
        if (usernameExists) {
            res.status(400)
            throw new Error('Username already exists')
        }
        updateData.username = username
    }

    // Hash password if provided
    if (password) {
        // Validate password strength
        const passwordError = validatePasswordWithMessage(password)
        if (passwordError) {
            res.status(400)
            throw new Error(passwordError)
        }
        const salt = await bcrypt.genSalt(10)
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

    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    ).select('-password')

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
