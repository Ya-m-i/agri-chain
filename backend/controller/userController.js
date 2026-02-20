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
        .select('_id username password role name profileImageVersion')
        .lean()

    if(user && (await bcrypt.compare(password, user.password))) {
        // Return minimal data - only what's needed for login
        res.json({
            _id: user._id,
            id: user._id,
            username: user.username,
            role: user.role || 'user',
            name: user.name || user.username,
            profileImageVersion: user.profileImageVersion ?? 0,
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
    const user = await User.findById(req.user.id).select('-password').lean()

    res.status(200).json({
        _id: user._id,
        id: user._id,
        username: user.username,
        role: user.role || 'user',
        name: user.name || user.username,
        profileImageVersion: user.profileImageVersion ?? 0,
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
        // Admin can set simpler password (3+ chars, no special); others use full validator
        if (req.user.role === 'admin') {
            if (password.length < 3) {
                res.status(400)
                throw new Error('Password must be at least 3 characters')
            }
            if (/[^a-zA-Z0-9]/.test(password)) {
                res.status(400)
                throw new Error('Password cannot contain special characters')
            }
        } else {
            const passwordError = validatePasswordWithMessage(password)
            if (passwordError) {
                res.status(400)
                throw new Error(passwordError)
            }
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

// @desc    Create admin user (admin only)
// @route   POST /api/users/admin
// @access  Private (admin only)
const registerAdmin = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403)
        throw new Error('Not authorized to create admin users')
    }

    const { username, password } = req.body

    if (!username || !password) {
        res.status(400)
        throw new Error('Please add username and password')
    }

    // Username: at least 3 characters, letters and numbers only (no special characters)
    if (username.length < 3) {
        res.status(400)
        throw new Error('Username must be at least 3 characters')
    }
    if (/[^a-zA-Z0-9]/.test(username)) {
        res.status(400)
        throw new Error('Username cannot contain special characters')
    }

    // Password: at least 3 characters, letters and numbers only
    if (password.length < 3) {
        res.status(400)
        throw new Error('Password must be at least 3 characters')
    }
    if (/[^a-zA-Z0-9]/.test(password)) {
        res.status(400)
        throw new Error('Password cannot contain special characters')
    }

    const userExists = await User.findOne({ username })
    if (userExists) {
        res.status(400)
        throw new Error('Username already exists')
    }

    const salt = await bcrypt.genSalt(6)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
        username,
        password: hashedPassword,
        role: 'admin',
    })

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            role: user.role,
            message: 'Admin user created successfully',
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

// @desc    Get all admin users (admin only)
// @route   GET /api/users/admins
// @access  Private (admin only)
const getAdminUsers = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403)
        throw new Error('Not authorized to list admin users')
    }
    const admins = await User.find({ role: 'admin' })
        .select('_id username role name profileImageVersion createdAt')
        .sort({ createdAt: -1 })
        .lean()
    res.status(200).json(admins)
})

// @desc    Delete user (admin only; cannot delete self)
// @route   DELETE /api/users/:id
// @access  Private (admin only)
const deleteUser = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403)
        throw new Error('Not authorized to delete users')
    }
    const currentId = req.user._id?.toString() || req.user.id?.toString()
    const targetId = req.params.id
    if (currentId === targetId) {
        res.status(400)
        throw new Error('You cannot delete your own account')
    }
    const user = await User.findByIdAndDelete(targetId)
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }
    res.status(200).json({ message: 'User deleted successfully' })
})

// @desc    Save admin profile image (admin only)
// @route   POST /api/users/profile-image
// @access  Private (admin only)
const saveAdminProfileImage = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403)
        throw new Error('Not authorized to update admin profile images')
    }
    const { userId } = req.body
    const file = req.file
    if (!userId) {
        res.status(400)
        throw new Error('User ID is required')
    }
    if (!file) {
        res.status(400)
        throw new Error('Profile image file is required')
    }
    const user = await User.findById(userId)
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }
    if (user.role !== 'admin') {
        res.status(403)
        throw new Error('Can only set profile image for admin users')
    }
    user.profileImageData = file.buffer
    user.profileImageType = file.mimetype
    user.profileImageSize = file.size
    user.profileImageVersion = (user.profileImageVersion || 0) + 1
    await user.save()
    res.status(200).json({
        success: true,
        message: 'Profile image saved successfully',
        version: user.profileImageVersion,
    })
})

// @desc    Get admin/user profile image (public so img src works without auth header)
// @route   GET /api/users/profile-image/:userId
// @access  Public (profile images are not sensitive; userId is unguessable)
const getAdminProfileImage = asyncHandler(async (req, res) => {
    const targetId = req.params.userId
    const user = await User.findById(targetId).select('profileImageData profileImageType').lean()
    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }
    const data = user.profileImageData
    if (!data) {
        return res.status(404).json({ message: 'No profile image found' })
    }
    // MongoDB may return Buffer (Mongoose) or Binary (BSON) when using .lean()
    let buffer
    if (Buffer.isBuffer(data)) {
        buffer = data
    } else if (data.buffer !== undefined) {
        buffer = Buffer.from(data.buffer)
    } else if (data.length !== undefined && data.length > 0) {
        buffer = Buffer.from(data)
    } else {
        return res.status(404).json({ message: 'No profile image found' })
    }
    if (buffer.length === 0) {
        return res.status(404).json({ message: 'No profile image found' })
    }
    res.set('Content-Type', user.profileImageType || 'image/jpeg')
    res.set('Cache-Control', 'public, max-age=3600, immutable')
    res.set('Content-Length', buffer.length)
    return res.end(buffer)
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
    registerAdmin,
    getAdminUsers,
    deleteUser,
    saveAdminProfileImage,
    getAdminProfileImage,
}
