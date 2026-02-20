const express = require('express')
const router = express.Router()
const multer = require('multer')
const { protect } = require('../middleware/authMiddleware')
const { createFarmer, getFarmers, loginFarmer, deleteFarmer, getActiveFarmers, logoutFarmer, saveFarmerProfileImage, getFarmerProfileImage, getAllFarmerProfileImages, updateFarmer, bulkImportFarmers, generateRSBSAFormPDF } = require('../controller/farmerController')

// Configure multer for file uploads
const csvUpload = multer({ dest: 'uploads/' })
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for profile images
})

// @route   /api/farmers
router.route('/').post(createFarmer).get(getFarmers)
router.post('/login', loginFarmer)
router.post('/logout', logoutFarmer)
router.get('/active', getActiveFarmers)
router.delete('/:id', deleteFarmer)
router.put('/:id', updateFarmer)

// Profile image routes
router.post('/profile-image', imageUpload.single('profileImage'), saveFarmerProfileImage)
router.get('/profile-image/:farmerId', getFarmerProfileImage)
router.get('/profile-images', getAllFarmerProfileImages)

// CSV import route
router.post('/import', csvUpload.single('csvFile'), bulkImportFarmers)

// RSBSA form PDF (Puppeteer) - requires auth
router.post('/rsbsa-pdf', protect, generateRSBSAFormPDF)

module.exports = router 