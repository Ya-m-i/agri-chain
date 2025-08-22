const express = require('express')
const router = express.Router()
const { getFarms, setFarm, updateFarm, deleteFarm } = require('../controller/farmController')
const { createFarmer, getFarmers } = require('../controller/farmerController')

const { protect } = require('../middleware/authMiddleware')

router.route('/').get(protect, getFarms).post(protect, setFarm)
router.route('/').post(createFarmer).get(getFarmers)

router.route('/:id').put(protect, updateFarm).delete(protect, deleteFarm)

 

module.exports = router

