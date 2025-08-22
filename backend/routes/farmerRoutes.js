const express = require('express')
const router = express.Router()
const { createFarmer, getFarmers, loginFarmer, deleteFarmer } = require('../controller/farmerController')

// @route   /api/farmers
router.route('/').post(createFarmer).get(getFarmers)
router.post('/login', loginFarmer)
router.delete('/:id', deleteFarmer)

module.exports = router 