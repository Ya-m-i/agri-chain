const CropPrice = require('../models/cropPriceModel')
const asyncHandler = require('express-async-handler')

// @desc    Get all crop prices
// @route   GET /api/crop-prices
// @access  Public
const getCropPrices = asyncHandler(async (req, res) => {
    try {
        const { status } = req.query
        const filter = status ? { status } : { status: 'active' }
        
        const cropPrices = await CropPrice.find(filter).sort({ cropName: 1, cropType: 1 })
        res.status(200).json(cropPrices)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @desc    Get single crop price
// @route   GET /api/crop-prices/:id
// @access  Public
const getCropPrice = asyncHandler(async (req, res) => {
    try {
        const cropPrice = await CropPrice.findById(req.params.id)
        
        if (!cropPrice) {
            return res.status(404).json({ message: 'Crop price not found' })
        }
        
        res.status(200).json(cropPrice)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @desc    Create new crop price
// @route   POST /api/crop-prices
// @access  Admin
const createCropPrice = asyncHandler(async (req, res) => {
    try {
        const { cropName, cropType, pricePerKg, unit, region, updatedBy, notes } = req.body
        
        // Validate required fields
        if (!cropName || !pricePerKg) {
            return res.status(400).json({ message: 'Crop name and price are required' })
        }
        
        // Check if crop price already exists
        const existingCropPrice = await CropPrice.findOne({ 
            cropName, 
            cropType: cropType || null 
        })
        
        if (existingCropPrice) {
            return res.status(400).json({ 
                message: 'Crop price already exists. Please update the existing entry.' 
            })
        }
        
        const cropPrice = await CropPrice.create({
            cropName,
            cropType,
            pricePerKg,
            unit: unit || 'kg',
            region: region || 'Philippines Average',
            updatedBy: updatedBy || 'Admin',
            notes,
            lastUpdated: new Date()
        })
        
        console.log('Crop price created:', cropPrice)
        
        // Emit Socket.IO event for real-time updates
        const io = req.app.get('io')
        if (io) {
            io.emit('crop-price-created', cropPrice)
            console.log('Socket event emitted: crop-price-created')
        }
        
        res.status(201).json(cropPrice)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// @desc    Update crop price
// @route   PUT /api/crop-prices/:id
// @access  Admin
const updateCropPrice = asyncHandler(async (req, res) => {
    try {
        const cropPrice = await CropPrice.findById(req.params.id)
        
        if (!cropPrice) {
            return res.status(404).json({ message: 'Crop price not found' })
        }
        
        // Update fields
        const { cropName, cropType, pricePerKg, unit, region, updatedBy, status, notes } = req.body
        
        if (cropName !== undefined) cropPrice.cropName = cropName
        if (cropType !== undefined) cropPrice.cropType = cropType
        if (pricePerKg !== undefined) cropPrice.pricePerKg = pricePerKg
        if (unit !== undefined) cropPrice.unit = unit
        if (region !== undefined) cropPrice.region = region
        if (updatedBy !== undefined) cropPrice.updatedBy = updatedBy
        if (status !== undefined) cropPrice.status = status
        if (notes !== undefined) cropPrice.notes = notes
        
        cropPrice.lastUpdated = new Date()
        
        const updatedCropPrice = await cropPrice.save()
        
        console.log('Crop price updated:', updatedCropPrice)
        
        // Emit Socket.IO event for real-time updates
        const io = req.app.get('io')
        if (io) {
            io.emit('crop-price-updated', updatedCropPrice)
            console.log('Socket event emitted: crop-price-updated')
        }
        
        res.status(200).json(updatedCropPrice)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// @desc    Delete crop price
// @route   DELETE /api/crop-prices/:id
// @access  Admin
const deleteCropPrice = asyncHandler(async (req, res) => {
    try {
        const cropPrice = await CropPrice.findById(req.params.id)
        
        if (!cropPrice) {
            return res.status(404).json({ message: 'Crop price not found' })
        }
        
        await cropPrice.deleteOne()
        
        console.log('Crop price deleted:', req.params.id)
        
        // Emit Socket.IO event for real-time updates
        const io = req.app.get('io')
        if (io) {
            io.emit('crop-price-deleted', { id: req.params.id })
            console.log('Socket event emitted: crop-price-deleted')
        }
        
        res.status(200).json({ message: 'Crop price deleted successfully', id: req.params.id })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @desc    Get crop price statistics
// @route   GET /api/crop-prices/stats/overview
// @access  Public
const getCropPriceStats = asyncHandler(async (req, res) => {
    try {
        const totalCrops = await CropPrice.countDocuments({ status: 'active' })
        const allPrices = await CropPrice.find({ status: 'active' })
        
        const avgPrice = allPrices.length > 0 
            ? allPrices.reduce((sum, crop) => sum + crop.pricePerKg, 0) / allPrices.length 
            : 0
        
        const highestPrice = allPrices.length > 0 
            ? Math.max(...allPrices.map(crop => crop.pricePerKg)) 
            : 0
        
        const lowestPrice = allPrices.length > 0 
            ? Math.min(...allPrices.map(crop => crop.pricePerKg)) 
            : 0
        
        res.status(200).json({
            totalCrops,
            avgPrice: Math.round(avgPrice * 100) / 100,
            highestPrice,
            lowestPrice,
            lastUpdated: allPrices.length > 0 
                ? allPrices.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))[0].lastUpdated 
                : null
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = {
    getCropPrices,
    getCropPrice,
    createCropPrice,
    updateCropPrice,
    deleteCropPrice,
    getCropPriceStats
}

