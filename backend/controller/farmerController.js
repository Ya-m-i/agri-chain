const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Farmer = require('../models/farmerModel')
const { validatePasswordWithMessage } = require('../utils/passwordValidator')
const multer = require('multer')
const csv = require('csv-parser')
const fs = require('fs')

// @desc    Register a new farmer
// @route   POST /api/farmers
// @access  Public
const createFarmer = async (req, res) => {
    try {
        // Validate password strength if provided
        if (req.body.password) {
            const passwordError = validatePasswordWithMessage(req.body.password)
            if (passwordError) {
                return res.status(400).json({ message: passwordError })
            }
        }
        
        // Hash password before saving with salt rounds of 6 for faster hashing on free tier servers
        // 6 rounds = 64 iterations (vs 8 rounds = 256 iterations, 10 rounds = 1024 iterations)
        // Still secure enough for most applications, especially on resource-constrained servers
        let farmerData = { ...req.body };
        if (farmerData.password) {
            const salt = await bcrypt.genSalt(6);
            farmerData.password = await bcrypt.hash(farmerData.password, salt);
        }
        const farmer = await Farmer.create(farmerData)
        
        // Emit socket event if farmer has location data (for real-time map updates)
        if (farmer.location && farmer.location.lat && farmer.location.lng) {
            const io = req.app.get('io');
            if (io) {
                const farmerDataForSocket = {
                    _id: farmer._id,
                    farmerName: farmerData.farmerName || `${farmer.firstName} ${farmer.middleName || ''} ${farmer.lastName}`.trim(),
                    location: farmer.location,
                    cropType: farmer.cropType,
                    address: farmer.address
                };
                
                console.log('🗺️ Emitting farmer-registered event with location:', farmerDataForSocket);
                io.to('admin-room').emit('farmer-registered', farmerDataForSocket);
            }
        }
        
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

// @desc    Save farmer profile image
// @route   POST /api/farmers/profile-image
// @access  Public
const saveFarmerProfileImage = async (req, res) => {
    try {
        const { farmerId, profileImage } = req.body;
        
        if (!farmerId || !profileImage) {
            return res.status(400).json({ message: 'Farmer ID and profile image are required' });
        }
        
        // Update farmer with profile image
        const farmer = await Farmer.findByIdAndUpdate(
            farmerId,
            { profileImage },
            { new: true }
        );
        
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }
        
        res.json({
            success: true,
            message: 'Profile image saved successfully',
            farmer: farmer
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get farmer profile image
// @route   GET /api/farmers/profile-image/:farmerId
// @access  Public
const getFarmerProfileImage = async (req, res) => {
    try {
        const { farmerId } = req.params;
        
        const farmer = await Farmer.findById(farmerId).select('profileImage');
        
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }
        
        res.json({
            success: true,
            profileImage: farmer.profileImage || null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all farmer profile images
// @route   GET /api/farmers/profile-images
// @access  Public
const getAllFarmerProfileImages = async (req, res) => {
    try {
        const farmers = await Farmer.find({ profileImage: { $exists: true, $ne: null } })
            .select('_id profileImage firstName lastName farmerName');
        
        const profileImages = {};
        farmers.forEach(farmer => {
            profileImages[farmer._id] = farmer.profileImage;
        });
        
        res.json({
            success: true,
            profileImages: profileImages
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update farmer password and username
// @route   PUT /api/farmers/:id
// @access  Public
const updateFarmer = async (req, res) => {
    try {
        const { username, password } = req.body;
        const updateData = {};
        
        if (username) {
            updateData.username = username;
        }
        
        if (password) {
            // Validate password strength
            const passwordError = validatePasswordWithMessage(password)
            if (passwordError) {
                return res.status(400).json({ message: passwordError })
            }
            // Hash password before saving with salt rounds of 6 for faster hashing on free tier servers
            // 6 rounds = 64 iterations (vs 8 rounds = 256 iterations, 10 rounds = 1024 iterations)
            // Still secure enough for most applications, especially on resource-constrained servers
            const salt = await bcrypt.genSalt(6);
            updateData.password = await bcrypt.hash(password, salt);
        }
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        
        const farmer = await Farmer.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');
        
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }
        
        res.json({
            success: true,
            message: 'Farmer updated successfully',
            farmer: farmer
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk import farmers from CSV (farmer data only)
// @route   POST /api/farmers/import
// @access  Private
const bulkImportFarmers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'CSV file is required' })
        }

        const results = []
        const errors = []
        const filePath = req.file.path

        // Parse CSV file
        const stream = fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', async (row) => {
                try {
                    // Validate required fields
                    if (!row.firstName || !row.lastName || !row.username || !row.password) {
                        errors.push({
                            row: row.firstName || 'Unknown',
                            error: 'Missing required fields: firstName, lastName, username, or password'
                        })
                        return
                    }

                    // Check if farmer already exists
                    const existingFarmer = await Farmer.findOne({ username: row.username.trim() })
                    if (existingFarmer) {
                        errors.push({
                            row: `${row.firstName} ${row.lastName}`,
                            error: `Farmer with username "${row.username}" already exists`
                        })
                        return
                    }

                    // Validate password
                    const passwordError = validatePasswordWithMessage(row.password)
                    if (passwordError) {
                        errors.push({
                            row: `${row.firstName} ${row.lastName}`,
                            error: `Password validation failed: ${passwordError}`
                        })
                        return
                    }

                    // Hash password
                    const salt = await bcrypt.genSalt(6)
                    const hashedPassword = await bcrypt.hash(row.password, salt)

                    // Create farmer (NO verification at this stage)
                    const farmerData = {
                        firstName: row.firstName.trim(),
                        middleName: row.middleName?.trim() || '',
                        lastName: row.lastName.trim(),
                        birthday: row.birthday || '',
                        gender: row.gender || '',
                        contactNum: row.contactNum || '',
                        address: row.address || '',
                        username: row.username.trim(),
                        password: hashedPassword,
                        cropType: row.cropType || '',
                        cropArea: row.cropArea || '',
                        lotNumber: row.lotNumber || '',
                        lotArea: row.lotArea || '',
                        agency: row.agency || '',
                        isCertified: row.isCertified === 'true' || row.isCertified === true,
                        rsbsaRegistered: row.rsbsaRegistered === 'true' || row.rsbsaRegistered === true,
                        periodFrom: row.periodFrom || '',
                        periodTo: row.periodTo || '',
                        // Verification status - pending until insurance is created
                        isVerified: false,
                        verificationStatus: 'pending',
                        verificationMethod: 'pending'
                    }

                    const farmer = await Farmer.create(farmerData)

                    results.push({
                        success: true,
                        farmerId: farmer._id,
                        farmerName: `${farmer.firstName} ${farmer.lastName}`,
                        username: farmer.username
                    })
                } catch (error) {
                    errors.push({
                        row: row.firstName || 'Unknown',
                        error: error.message
                    })
                }
            })
            .on('end', () => {
                // Clean up uploaded file
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
                
                res.status(200).json({
                    success: true,
                    message: `Imported ${results.length} farmers successfully`,
                    imported: results.length,
                    errors: errors.length,
                    results,
                    errorDetails: errors.slice(0, 20)
                })
            })
            .on('error', (error) => {
                // Clean up uploaded file on error
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
                res.status(500).json({ message: `CSV parsing error: ${error.message}` })
            })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

function generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

module.exports = {
    createFarmer,
    getFarmers,
    loginFarmer,
    deleteFarmer,
    getActiveFarmers,
    logoutFarmer,
    saveFarmerProfileImage,
    getFarmerProfileImage,
    getAllFarmerProfileImages,
    updateFarmer,
    bulkImportFarmers
} 