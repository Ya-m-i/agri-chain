const express = require('express')
const router = express.Router()
const { createFarmer, getFarmers, loginFarmer, deleteFarmer, getActiveFarmers, logoutFarmer, saveFarmerProfileImage, getFarmerProfileImage, getAllFarmerProfileImages } = require('../controller/farmerController')

// @route   /api/farmers
router.route('/').post(createFarmer).get(getFarmers)
router.post('/login', loginFarmer)
router.post('/logout', logoutFarmer)
router.get('/active', getActiveFarmers)
router.delete('/:id', deleteFarmer)

// Profile image routes
router.post('/profile-image', saveFarmerProfileImage)
router.get('/profile-image/:farmerId', getFarmerProfileImage)
router.get('/profile-images', getAllFarmerProfileImages)

module.exports = router 