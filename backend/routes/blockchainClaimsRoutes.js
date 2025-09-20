const express = require('express');
const router = express.Router();
const {
    getBlockchainClaims,
    getBlockchainClaim,
    createBlockchainClaim,
    updateBlockchainClaim,
    getBlockchainClaimsByFarmer,
    getBlockchainClaimsByStatus,
    getBlockchainClaimsStats
} = require('../controller/blockchainClaimsController');

// All routes are protected (add auth middleware if needed)
router.get('/', getBlockchainClaims);
router.get('/stats', getBlockchainClaimsStats);
router.get('/farmer/:farmerId', getBlockchainClaimsByFarmer);
router.get('/status/:status', getBlockchainClaimsByStatus);
router.get('/:id', getBlockchainClaim);
router.post('/', createBlockchainClaim);
router.put('/:id', updateBlockchainClaim);

module.exports = router;
