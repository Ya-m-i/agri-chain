const Assistance = require('../models/assistanceModel');
const AssistanceApplication = require('../models/assistanceApplicationModel');
const Farmer = require('../models/farmerModel');

// @desc    Create a new assistance item
// @route   POST /api/assistance
// @access  Public
const createAssistance = async (req, res) => {
  try {
    const assistance = await Assistance.create(req.body);
    res.status(201).json(assistance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all assistance items
// @route   GET /api/assistance
// @access  Public
const getAssistances = async (req, res) => {
  try {
    console.log('Backend: Fetching assistance inventory');
    const assistances = await Assistance.find({ status: 'active' });
    console.log('Backend: Found assistance items:', assistances.length);
    res.status(200).json(assistances);
  } catch (error) {
    console.error('Backend Error in getAssistances:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Apply for assistance (Seed Assistance Flow)
// @route   POST /api/assistance/apply
// @access  Public
const applyForAssistance = async (req, res) => {
  try {
    const { farmerId, assistanceId, requestedQuantity, farmerData } = req.body;

    // Validate input
    if (!farmerId || !assistanceId || !requestedQuantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get farmer and assistance details
    const farmer = await Farmer.findById(farmerId);
    const assistance = await Assistance.findById(assistanceId);

    if (!farmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    if (!assistance) {
      return res.status(404).json({ message: 'Assistance not found' });
    }

    // Use farmer data from frontend if provided (includes insured crop types)
    const effectiveFarmer = farmerData || farmer;

    // Determine current quarter
    const now = new Date();
    const quarter = `Q${Math.floor(now.getMonth() / 3) + 1}-${now.getFullYear()}`;

    // Check if farmer already applied for this assistance this quarter
    const existingApplication = await AssistanceApplication.findOne({
      farmerId,
      assistanceId,
      quarter,
      status: { $in: ['pending', 'approved', 'distributed'] }
    });

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You have already applied for this assistance this quarter' 
      });
    }

    // Enhanced crop type matching logic
    let cropTypeMatch = false;
    if (assistance.cropType) {
      const assistanceCrop = assistance.cropType.toLowerCase();
      
      // Check insured crop types first (from insurance records)
      if (effectiveFarmer.insuredCropTypes && Array.isArray(effectiveFarmer.insuredCropTypes)) {
        cropTypeMatch = effectiveFarmer.insuredCropTypes.some(crop => 
          String(crop).toLowerCase() === assistanceCrop
        );
      }
      
      // Fallback to farmer's primary crop type if no insured crops found
      if (!cropTypeMatch && effectiveFarmer.cropType) {
        cropTypeMatch = String(effectiveFarmer.cropType).toLowerCase() === assistanceCrop;
      }
    }

    // Eligibility checks
    const eligibilityCheck = {
      rsbsaRegistered: effectiveFarmer.rsbsaRegistered || false,
      notAlreadyAvailed: !existingApplication,
      withinQuarterlyLimit: true, // Will be checked during approval
      stockAvailable: assistance.availableQuantity >= requestedQuantity,
      cropTypeMatch: cropTypeMatch,
      isCertified: effectiveFarmer.isCertified || false
    };

    // Check if eligible
    if (!eligibilityCheck.rsbsaRegistered && assistance.requiresRSBSA) {
      return res.status(400).json({ 
        message: 'RSBSA registration is required for this assistance' 
      });
    }

    if (!eligibilityCheck.stockAvailable) {
      return res.status(400).json({ 
        message: 'Insufficient stock available' 
      });
    }

    if (!eligibilityCheck.cropTypeMatch) {
      const farmerCrops = effectiveFarmer.insuredCropTypes && effectiveFarmer.insuredCropTypes.length > 0 
        ? effectiveFarmer.insuredCropTypes.join(', ') 
        : (effectiveFarmer.cropType || 'Unknown');
      return res.status(400).json({ 
        message: `This assistance is only for ${assistance.cropType} farmers. Your crop type(s): ${farmerCrops}` 
      });
    }

    if (assistance.requiresCertification && !eligibilityCheck.isCertified) {
      return res.status(400).json({ 
        message: 'Certification is required for this assistance' 
      });
    }

    // Create application
    const application = await AssistanceApplication.create({
      farmerId,
      assistanceId,
      requestedQuantity,
      eligibilityCheck,
      quarter,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get farmer's applications
// @route   GET /api/assistance/applications/:farmerId
// @access  Public
const getFarmerApplications = async (req, res) => {
  try {
    const { farmerId } = req.params;
    console.log('Backend: Fetching applications for farmer ID:', farmerId);
    
    if (!farmerId) {
      return res.status(400).json({ message: 'Farmer ID is required' });
    }

    // Check if farmer exists
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      console.log('Backend: Farmer not found with ID:', farmerId);
      return res.status(404).json({ message: 'Farmer not found' });
    }

    const applications = await AssistanceApplication.find({ farmerId })
      .populate('assistanceId', 'assistanceType cropType description')
      .sort({ applicationDate: -1 });

    console.log('Backend: Found applications:', applications.length);
    res.status(200).json(applications);
  } catch (error) {
    console.error('Backend Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications (for admin)
// @route   GET /api/assistance/applications
// @access  Public
const getAllApplications = async (req, res) => {
  try {
    const applications = await AssistanceApplication.find()
      .populate('farmerId', 'firstName lastName cropType rsbsaRegistered isCertified')
      .populate('assistanceId', 'assistanceType cropType availableQuantity')
      .sort({ applicationDate: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status (approve/reject/distribute)
// @route   PATCH /api/assistance/applications/:id
// @access  Public
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, officerNotes } = req.body;

    const application = await AssistanceApplication.findById(id)
      .populate('assistanceId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Update application
    application.status = status;
    application.reviewDate = new Date();
    if (officerNotes) application.officerNotes = officerNotes;

    // If approved and being distributed, deduct from inventory
    if (status === 'distributed' && application.assistanceId) {
      const assistance = application.assistanceId;
      const newQuantity = Math.max(0, assistance.availableQuantity - application.requestedQuantity);
      
      await Assistance.findByIdAndUpdate(assistance._id, {
        availableQuantity: newQuantity,
        status: newQuantity === 0 ? 'out_of_stock' : 'active'
      });

      application.distributionDate = new Date();
    }

    await application.save();

    // TODO: Send notification to farmer about status update
    // This would typically be done through a notification service
    // For now, we'll just return the updated application

    res.status(200).json({
      message: 'Application status updated successfully',
      application
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update assistance inventory
// @route   PATCH /api/assistance/:id/inventory
// @access  Public
const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { availableQuantity } = req.body;

    const assistance = await Assistance.findByIdAndUpdate(
      id,
      { 
        availableQuantity,
        status: availableQuantity === 0 ? 'out_of_stock' : 'active'
      },
      { new: true }
    );

    if (!assistance) {
      return res.status(404).json({ message: 'Assistance not found' });
    }

    res.status(200).json(assistance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete assistance item
// @route   DELETE /api/assistance/:id
// @access  Public
const deleteAssistance = async (req, res) => {
  try {
    const { id } = req.params;

    const assistance = await Assistance.findByIdAndDelete(id);

    if (!assistance) {
      return res.status(404).json({ message: 'Assistance not found' });
    }

    res.status(200).json({ message: 'Assistance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAssistance,
  getAssistances,
  applyForAssistance,
  getFarmerApplications,
  getAllApplications,
  updateApplicationStatus,
  updateInventory,
  deleteAssistance,
}; 