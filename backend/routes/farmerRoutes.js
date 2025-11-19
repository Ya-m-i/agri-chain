const express = require('express')
const router = express.Router()
const multer = require('multer')
const { createFarmer, getFarmers, loginFarmer, deleteFarmer, getActiveFarmers, logoutFarmer, saveFarmerProfileImage, getFarmerProfileImage, getAllFarmerProfileImages, updateFarmer, bulkImportFarmers } = require('../controller/farmerController')

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' })

// @route   /api/farmers
router.route('/').post(createFarmer).get(getFarmers)
router.post('/login', loginFarmer)
router.post('/logout', logoutFarmer)
router.get('/active', getActiveFarmers)
router.delete('/:id', deleteFarmer)
router.put('/:id', updateFarmer)

// Profile image routes
router.post('/profile-image', saveFarmerProfileImage)
router.get('/profile-image/:farmerId', getFarmerProfileImage)
router.get('/profile-images', getAllFarmerProfileImages)

// CSV import route
router.post('/import', upload.single('csvFile'), bulkImportFarmers)

module.exports = router 