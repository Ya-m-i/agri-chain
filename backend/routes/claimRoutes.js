const express = require('express')
const router = express.Router()
const { createClaim, getClaims, updateClaim } = require('../controller/claimController')

router.route('/').post(createClaim).get(getClaims)
router.route('/:id').patch(updateClaim)

module.exports = router 