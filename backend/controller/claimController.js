const Claim = require('../models/claimModel')
const Farmer = require('../models/farmerModel')
const { calculateCompensation } = require('../utils/compensationUtils')
const axios = require('axios')

// Configuration for hosted Hyperledger Fabric (Cloudflare tunnel)
const FABRIC_SERVICE_URL = process.env.FABRIC_SERVICE_URL || 'https://api.kapalongagrichain.site'

// Helper function to log claim to hosted blockchain
const logClaimToBlockchain = async (claim) => {
    try {
        // Get farmer's full name from farmer record
        let farmerName = claim.name; // fallback to claim name
        if (claim.farmerId) {
            try {
                const farmer = await Farmer.findById(claim.farmerId);
                if (farmer) {
                    farmerName = `${farmer.firstName} ${farmer.middleName ? farmer.middleName + ' ' : ''}${farmer.lastName}`.trim();
                }
            } catch (farmerError) {
                console.warn('⚠️ Could not fetch farmer details, using claim name:', farmerError.message);
            }
        }

        const claimLogData = {
            claimId: claim.claimNumber || claim._id.toString(),
            farmerName: farmerName,
            cropType: claim.crop,
            timestamp: new Date().toISOString(),
            status: claim.status || 'pending',
            createdAt: new Date().toISOString()
        };

        console.log('📝 Logging claim to hosted blockchain:', claimLogData);
        
        // Send to real blockchain via Cloudflare tunnel with org1 parameter
        const response = await axios.post(`${FABRIC_SERVICE_URL}/api/claims-logs/org1`, claimLogData);
        console.log('✅ Successfully logged claim to hosted blockchain:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to log claim to hosted blockchain:', error.message);
        // Don't throw error - blockchain logging failure shouldn't break claim creation
        return null;
    }
}

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
    
    // Log claim to hosted blockchain
    await logClaimToBlockchain(claim);
    
    // Emit Socket.IO event for real-time updates to ALL connected devices
    const io = req.app.get('io');
    if (io) {
      console.log('Emitting socket events for claim:', claim.claimNumber);
      
      // Emit to ALL admin devices (broadcast to admin room)
      io.to('admin-room').emit('claim-created', claim);
      console.log('Socket event emitted to admin-room: claim-created');
      
      // Emit to specific farmer room for the claim creator
      if (claim.farmerId) {
        io.to(`farmer-${claim.farmerId}`).emit('claim-created', claim);
        console.log(`Socket event emitted to farmer-${claim.farmerId}: claim-created`);
      }
      
      // Also emit a global newClaim event for backward compatibility
      io.emit('newClaim', {
        claimNumber: claim.claimNumber,
        farmerId: claim.farmerId,
        crop: claim.crop,
        status: claim.status,
        _id: claim._id
      });
      console.log('Global newClaim event emitted');
    } else {
      console.log('Socket.IO instance not available');
    }
    
    // Return the complete claim with claimNumber
    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully',
      claimNumber: claim.claimNumber,
      _id: claim._id,
      ...claim.toObject()
    });
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
    
    // Log claim status update to hosted blockchain
    await logClaimToBlockchain(claim);
    
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