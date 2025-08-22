const express = require('express')
const router = express.Router()
const {
    createCropInsurance,
    getFarmerCropInsurance,
    getAllCropInsurance,
    updateCropInsurance,
    getCropInsuranceById,
    deleteCropInsurance,
    getCropInsuranceStats
} = require('../controller/cropInsuranceController')

// Create new crop insurance record
router.post('/', createCropInsurance)

// Get all crop insurance records
router.get('/', getAllCropInsurance)

// Get crop insurance statistics
router.get('/stats/overview', getCropInsuranceStats)

// Get crop insurance records for a specific farmer
router.get('/farmer/:farmerId', getFarmerCropInsurance)

// Get crop insurance by ID
router.get('/:id', getCropInsuranceById)

// Update crop insurance record
router.put('/:id', updateCropInsurance)

// Delete crop insurance record
router.delete('/:id', deleteCropInsurance)

module.exports = router 