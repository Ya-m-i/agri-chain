const CropInsurance = require('../models/cropInsuranceModel')
const Farmer = require('../models/farmerModel')

// @desc    Create new crop insurance record
// @route   POST /api/crop-insurance
// @access  Private
const createCropInsurance = async (req, res) => {
    try {
        console.log('Received crop insurance creation request:', req.body)
        
        const {
            farmerId,
            cropType,
            cropArea,
            lotNumber,
            lotArea,
            plantingDate,
            expectedHarvestDate,
            insuranceDayLimit,
            location,
            notes
        } = req.body

        console.log('Extracted data:', {
            farmerId,
            cropType,
            cropArea,
            lotNumber,
            lotArea,
            plantingDate,
            expectedHarvestDate,
            insuranceDayLimit,
            location,
            notes
        })

        // Validate farmer exists
        const farmer = await Farmer.findById(farmerId)
        if (!farmer) {
            console.log('Farmer not found with ID:', farmerId)
            return res.status(404).json({ message: 'Farmer not found' })
        }

        console.log('Farmer found:', farmer.firstName, farmer.lastName)

        // Create crop insurance record
        console.log('About to create crop insurance with data:', {
            farmerId,
            cropType,
            cropArea,
            lotNumber,
            lotArea,
            plantingDate,
            expectedHarvestDate,
            insuranceDayLimit,
            location,
            notes
        })
        
        const cropInsurance = await CropInsurance.create({
            farmerId,
            cropType,
            cropArea,
            lotNumber,
            lotArea,
            plantingDate,
            expectedHarvestDate,
            insuranceDayLimit,
            location,
            notes
        })

        console.log('Crop insurance record created successfully:', cropInsurance._id)
        
        // Populate the farmer data before sending response
        const populatedRecord = await CropInsurance.findById(cropInsurance._id)
            .populate('farmerId', 'firstName lastName')
        
        res.status(201).json(populatedRecord)
    } catch (error) {
        console.error('Error creating crop insurance record:', error)
        res.status(400).json({ message: error.message })
    }
}

// @desc    Get all crop insurance records for a farmer
// @route   GET /api/crop-insurance/farmer/:farmerId
// @access  Private
const getFarmerCropInsurance = async (req, res) => {
    try {
        const { farmerId } = req.params
        const cropInsurance = await CropInsurance.find({ farmerId })
            .populate('farmerId', 'firstName lastName')
            .sort({ createdAt: -1 })

        res.status(200).json(cropInsurance)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get all crop insurance records
// @route   GET /api/crop-insurance
// @access  Private
const getAllCropInsurance = async (req, res) => {
    try {
        const cropInsurance = await CropInsurance.find()
            .populate('farmerId', 'firstName lastName')
            .sort({ createdAt: -1 })

        res.status(200).json(cropInsurance)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Update crop insurance (apply insurance)
// @route   PUT /api/crop-insurance/:id
// @access  Private
const updateCropInsurance = async (req, res) => {
    try {
        const { id } = req.params
        const {
            isInsured,
            insuranceType,
            premiumAmount,
            agency,
            insuranceDate
        } = req.body

        const cropInsurance = await CropInsurance.findById(id)
        if (!cropInsurance) {
            return res.status(404).json({ message: 'Crop insurance record not found' })
        }

        // Check if crop can still be insured
        if (isInsured && !cropInsurance.canStillInsure()) {
            return res.status(400).json({ 
                message: 'Insurance deadline has passed. This crop can no longer be insured.' 
            })
        }

        // Update the record
        const updatedCropInsurance = await CropInsurance.findByIdAndUpdate(
            id,
            {
                isInsured,
                insuranceType,
                premiumAmount,
                agency,
                insuranceDate: isInsured ? (insuranceDate || new Date()) : null,
                canInsure: !isInsured && cropInsurance.canStillInsure()
            },
            { new: true }
        ).populate('farmerId', 'firstName lastName')

        res.status(200).json(updatedCropInsurance)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}

// @desc    Get crop insurance by ID
// @route   GET /api/crop-insurance/:id
// @access  Private
const getCropInsuranceById = async (req, res) => {
    try {
        const { id } = req.params
        const cropInsurance = await CropInsurance.findById(id)
            .populate('farmerId', 'firstName lastName')

        if (!cropInsurance) {
            return res.status(404).json({ message: 'Crop insurance record not found' })
        }

        res.status(200).json(cropInsurance)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Delete crop insurance record
// @route   DELETE /api/crop-insurance/:id
// @access  Private
const deleteCropInsurance = async (req, res) => {
    try {
        const { id } = req.params
        const cropInsurance = await CropInsurance.findByIdAndDelete(id)

        if (!cropInsurance) {
            return res.status(404).json({ message: 'Crop insurance record not found' })
        }

        res.status(200).json({ message: 'Crop insurance record deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get crop insurance statistics
// @route   GET /api/crop-insurance/stats/overview
// @access  Private
const getCropInsuranceStats = async (req, res) => {
    try {
        const totalCrops = await CropInsurance.countDocuments()
        const insuredCrops = await CropInsurance.countDocuments({ isInsured: true })
        const uninsuredCrops = await CropInsurance.countDocuments({ isInsured: false })
        const expiredCrops = await CropInsurance.countDocuments({ canInsure: false, isInsured: false })

        const stats = {
            totalCrops,
            insuredCrops,
            uninsuredCrops,
            expiredCrops,
            insuranceRate: totalCrops > 0 ? (insuredCrops / totalCrops * 100).toFixed(2) : 0
        }

        res.status(200).json(stats)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    createCropInsurance,
    getFarmerCropInsurance,
    getAllCropInsurance,
    updateCropInsurance,
    getCropInsuranceById,
    deleteCropInsurance,
    getCropInsuranceStats
} 