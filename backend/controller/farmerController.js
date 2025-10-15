const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Farmer = require('../models/farmerModel')

// @desc    Register a new farmer
// @route   POST /api/farmers
// @access  Public
const createFarmer = async (req, res) => {
    try {
        // Hash password before saving
        let farmerData = { ...req.body };
        if (farmerData.password) {
            const salt = await bcrypt.genSalt(10);
            farmerData.password = await bcrypt.hash(farmerData.password, salt);
        }
        const farmer = await Farmer.create(farmerData)
        res.status(201).json(farmer)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// @desc    Get all farmers
// @route   GET /api/farmers
// @access  Public
const getFarmers = async (req, res) => {
    try {
        const farmers = await Farmer.find()
        res.status(200).json(farmers)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Farmer login
// @route   POST /api/farmers/login
// @access  Public
const loginFarmer = async (req, res) => {
    try {
        const { username, password } = req.body;
        const farmer = await Farmer.findOne({ username });
        
        if (farmer && await bcrypt.compare(password, farmer.password)) {
            // Update lastLogin and isOnline status
            await Farmer.findByIdAndUpdate(farmer._id, {
                lastLogin: new Date(),
                isOnline: true
            });
            
            // Exclude password from response
            const { password, ...farmerData } = farmer.toObject();
            res.json({
                ...farmerData,
                lastLogin: new Date(),
                isOnline: true,
                token: generateToken(farmer._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a farmer
// @route   DELETE /api/farmers/:id
// @access  Public
const deleteFarmer = async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id);
        
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }
        
        await Farmer.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ message: 'Farmer deleted successfully', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active farmers (logged in within last 24 hours)
// @route   GET /api/farmers/active
// @access  Public
const getActiveFarmers = async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const activeFarmers = await Farmer.find({
            lastLogin: { $gte: twentyFourHoursAgo },
            isOnline: true
        }).select('-password');
        
        res.status(200).json({
            activeCount: activeFarmers.length,
            farmers: activeFarmers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Farmer logout
// @route   POST /api/farmers/logout
// @access  Public
const logoutFarmer = async (req, res) => {
    try {
        const { farmerId } = req.body;
        
        if (farmerId) {
            await Farmer.findByIdAndUpdate(farmerId, {
                isOnline: false
            });
        }
        
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

function generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

module.exports = {
    createFarmer,
    getFarmers,
    loginFarmer,
    deleteFarmer,
    getActiveFarmers,
    logoutFarmer
} 