const Claim = require('../models/claimModel')
const { calculateCompensation } = require('../utils/compensationUtils')

// @desc    Create a new claim
// @route   POST /api/claims
// @access  Public
const createClaim = async (req, res) => {
  try {
    console.log('Backend: Creating claim with data:', req.body);
    
    // Validate required fields
    if (!req.body.farmerId) {
      return res.status(400).json({ message: 'Farmer ID is required' });
    }
    
    if (!req.body.name) {
      return res.status(400).json({ message: 'Farmer name is required' });
    }
    
    if (!req.body.crop) {
      return res.status(400).json({ message: 'Crop type is required' });
    }
    
    // Generate a unique claim number with retry logic
    let claimNumber;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      claimNumber = `CLM-${year}-${timestamp}-${random}`;
      
      // Check if this claim number already exists
      const existingClaim = await Claim.findOne({ claimNumber });
      if (!existingClaim) {
        break;
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        return res.status(500).json({ message: 'Unable to generate unique claim number. Please try again.' });
      }
    } while (true);
    
    console.log('Backend: Generated unique claim number:', claimNumber);
    
    const claim = await Claim.create({ ...req.body, claimNumber });
    console.log('Backend: Claim created successfully:', claim);
    
    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Emit to admin room
      io.to('admin-room').emit('claim-created', claim);
      
      // Emit to specific farmer room
      if (claim.farmerId) {
        io.to(`farmer-${claim.farmerId}`).emit('claim-created', claim);
      }
      
      console.log('Socket event emitted: claim-created');
    }
    
    res.status(201).json(claim);
  } catch (error) {
    console.error('Backend: Error creating claim:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'A claim with this number already exists. Please try submitting again.' 
      });
    }
    
    res.status(400).json({ message: error.message });
  }
}

// @desc    Update claim status, feedback, compensation
// @route   PATCH /api/claims/:id
// @access  Public
const updateClaim = async (req, res) => {
  try {
    const { status, adminFeedback, compensation, reviewDate, completionDate } = req.body;
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    
    // Update basic fields
    if (status) claim.status = status;
    if (adminFeedback !== undefined) claim.adminFeedback = adminFeedback;
    if (reviewDate !== undefined) claim.reviewDate = reviewDate;
    if (completionDate !== undefined) claim.completionDate = completionDate;
    
    // Handle compensation calculation when claim is approved
    if (status === 'approved') {
      // If compensation is provided manually, use it; otherwise calculate automatically
      if (compensation !== undefined) {
        claim.compensation = compensation;
      } else {
        // Calculate compensation automatically based on claim details
        const compensationData = calculateCompensation(
          claim.areaDamaged,
          claim.degreeOfDamage,
          claim.crop,
          claim.damageType
        );
        claim.compensation = compensationData.finalCompensation;
      }
      
      // Set completion date if not provided
      if (!claim.completionDate) {
        claim.completionDate = new Date();
      }
    } else if (compensation !== undefined) {
      // For non-approved claims, still allow manual compensation setting
      claim.compensation = compensation;
    }
    
    await claim.save();
    
    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Emit to admin room
      io.to('admin-room').emit('claim-updated', claim);
      
      // Emit to specific farmer room
      if (claim.farmerId) {
        io.to(`farmer-${claim.farmerId}`).emit('claim-updated', claim);
      }
      
      console.log('Socket event emitted: claim-updated');
    }
    
    res.json(claim);
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// @desc    Get all claims or by farmerId
// @route   GET /api/claims
// @access  Public
const getClaims = async (req, res) => {
  try {
    const { farmerId } = req.query
    let claims
    if (farmerId) {
      claims = await Claim.find({ farmerId })
    } else {
      claims = await Claim.find()
    }
    res.status(200).json(claims)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createClaim,
  getClaims,
  updateClaim
} 