const express = require('express')
const router = express.Router()
const {
    getCropPrices,
    getCropPrice,
    createCropPrice,
    updateCropPrice,
    deleteCropPrice,
    getCropPriceStats
} = require('../controller/cropPriceController')

// Public routes
router.get('/', getCropPrices)
router.get('/stats/overview', getCropPriceStats)
router.get('/:id', getCropPrice)

// Admin routes (in production, add authentication middleware)
router.post('/', createCropPrice)
router.put('/:id', updateCropPrice)
router.delete('/:id', deleteCropPrice)

module.exports = router

