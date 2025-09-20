const axios = require('axios');
const Claim = require('../models/claimModel');
const Farmer = require('../models/farmerModel');

// Configuration for real blockchain (Cloudflare tunnel)
const FABRIC_SERVICE_URL = process.env.FABRIC_SERVICE_URL || 'https://api.kapalongagrichain.site';

// @desc    Get all distribution records from blockchain
// @route   GET /api/distribution-records
// @access  Private (Admin only)
const getDistributionRecords = async (req, res) => {
    try {
        console.log('🔍 Fetching distribution records from blockchain...');
        const response = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs`);
        console.log('✅ Successfully fetched distribution records from blockchain');
        res.status(200).json({
            success: true,
            data: response.data,
            count: response.data.length,
            source: 'blockchain'
        });
    } catch (error) {
        console.error('❌ Error fetching distribution records from blockchain:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch distribution records from blockchain',
            error: error.message
        });
    }
};

// @desc    Get distribution records by farmer from blockchain
// @route   GET /api/distribution-records/farmer/:farmerName
// @access  Private (Admin only)
const getDistributionRecordsByFarmer = async (req, res) => {
    try {
        const { farmerName } = req.params;
        console.log(`🔍 Fetching distribution records for farmer: ${farmerName}`);
        
        // Get all records and filter by farmer name
        const response = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs`);
        const allRecords = response.data;
        const farmerRecords = allRecords.filter(record => 
            record.farmerName && record.farmerName.toLowerCase().includes(farmerName.toLowerCase())
        );
        
        res.status(200).json({
            success: true,
            data: farmerRecords,
            count: farmerRecords.length,
            source: 'blockchain'
        });
    } catch (error) {
        console.error('❌ Error fetching distribution records by farmer:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch distribution records by farmer',
            error: error.message
        });
    }
};

// @desc    Get distribution records by status from blockchain
// @route   GET /api/distribution-records/status/:status
// @access  Private (Admin only)
const getDistributionRecordsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        console.log(`🔍 Fetching distribution records with status: ${status}`);
        
        // Get all records and filter by status
        const response = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs`);
        const allRecords = response.data;
        const statusRecords = allRecords.filter(record => 
            record.status && record.status.toLowerCase() === status.toLowerCase()
        );
        
        res.status(200).json({
            success: true,
            data: statusRecords,
            count: statusRecords.length,
            source: 'blockchain'
        });
    } catch (error) {
        console.error('❌ Error fetching distribution records by status:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch distribution records by status',
            error: error.message
        });
    }
};

// @desc    Get distribution records statistics from blockchain
// @route   GET /api/distribution-records/stats
// @access  Private (Admin only)
const getDistributionRecordsStats = async (req, res) => {
    try {
        console.log('📊 Fetching distribution records statistics from blockchain...');
        const response = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs`);
        const allRecords = response.data;
        
        // Calculate statistics
        const stats = {
            totalRecords: allRecords.length,
            statusCounts: {
                pending: 0,
                approved: 0,
                rejected: 0,
                completed: 0
            },
            cropTypeCounts: {},
            farmerCounts: {}
        };
        
        allRecords.forEach(record => {
            // Count by status
            if (stats.statusCounts[record.status]) {
                stats.statusCounts[record.status]++;
            }
            
            // Count by crop type
            if (record.cropType) {
                stats.cropTypeCounts[record.cropType] = (stats.cropTypeCounts[record.cropType] || 0) + 1;
            }
            
            // Count by farmer
            if (record.farmerName) {
                stats.farmerCounts[record.farmerName] = (stats.farmerCounts[record.farmerName] || 0) + 1;
            }
        });
        
        res.status(200).json({
            success: true,
            data: stats,
            source: 'blockchain'
        });
    } catch (error) {
        console.error('❌ Error fetching distribution records statistics:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch distribution records statistics',
            error: error.message
        });
    }
};

// @desc    Log claim to distribution records (blockchain)
// @route   POST /api/distribution-records/log
// @access  Private (Admin only)
const logClaimToDistribution = async (req, res) => {
    try {
        const { claimId, farmerName, cropType, status, action } = req.body;
        
        if (!claimId || !farmerName || !cropType || !status) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: claimId, farmerName, cropType, status'
            });
        }
        
        const distributionLog = {
            claimId,
            farmerName,
            cropType,
            timestamp: new Date().toISOString(),
            status,
            action: action || 'processed',
            createdAt: new Date().toISOString()
        };
        
        console.log('📝 Logging claim to distribution records (blockchain):', distributionLog);
        const response = await axios.post(`${FABRIC_SERVICE_URL}/api/claims-logs`, distributionLog);
        console.log('✅ Successfully logged claim to distribution records');
        
        res.status(201).json({
            success: true,
            data: response.data,
            source: 'blockchain'
        });
    } catch (error) {
        console.error('❌ Error logging claim to distribution records:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to log claim to distribution records',
            error: error.message
        });
    }
};

module.exports = {
    getDistributionRecords,
    getDistributionRecordsByFarmer,
    getDistributionRecordsByStatus,
    getDistributionRecordsStats,
    logClaimToDistribution
};
