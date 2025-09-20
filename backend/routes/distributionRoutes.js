const express = require('express');
const router = express.Router();
const {
    getDistributionRecords,
    getDistributionRecordsByFarmer,
    getDistributionRecordsByStatus,
    getDistributionRecordsStats,
    logClaimToDistribution
} = require('../controller/distributionController');

// @route   GET /api/distribution-records
// @desc    Get all distribution records from blockchain
// @access  Private (Admin only)
router.get('/', getDistributionRecords);

// @route   GET /api/distribution-records/farmer/:farmerName
// @desc    Get distribution records by farmer from blockchain
// @access  Private (Admin only)
router.get('/farmer/:farmerName', getDistributionRecordsByFarmer);

// @route   GET /api/distribution-records/status/:status
// @desc    Get distribution records by status from blockchain
// @access  Private (Admin only)
router.get('/status/:status', getDistributionRecordsByStatus);

// @route   GET /api/distribution-records/stats
// @desc    Get distribution records statistics from blockchain
// @access  Private (Admin only)
router.get('/stats', getDistributionRecordsStats);

// @route   POST /api/distribution-records/log
// @desc    Log claim to distribution records (blockchain)
// @access  Private (Admin only)
router.post('/log', logClaimToDistribution);

module.exports = router;
