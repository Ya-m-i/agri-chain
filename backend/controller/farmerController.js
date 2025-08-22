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
    const { username, password } = req.body;
    const farmer = await Farmer.findOne({ username });
    if (farmer && await bcrypt.compare(password, farmer.password)) {
        // Exclude password from response
        const { password, ...farmerData } = farmer.toObject();
        res.json({
            ...farmerData,
            token: generateToken(farmer._id)
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
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

function generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

module.exports = {
    createFarmer,
    getFarmers,
    loginFarmer,
    deleteFarmer
} 