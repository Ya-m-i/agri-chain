const axios = require('axios');

// Configuration for Laptop 2 (Fabric network) - Cloudflare tunnel
const FABRIC_SERVICE_URL = process.env.FABRIC_SERVICE_URL || 'https://api.kapalongagrichain.site';

// @desc    Get all claims logs from blockchain
// @route   GET /api/blockchain-claims
// @access  Private (Admin only)
const getBlockchainClaims = async (req, res) => {
    try {
        console.log('🔍 Fetching claims logs from blockchain...');
        const response = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs`);
        console.log('✅ Successfully fetched claims logs from blockchain');
        res.status(200).json(response.data);
    } catch (error) {
        console.error('❌ Error fetching claims logs from blockchain:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch claims logs from blockchain',
            error: error.message
        });
    }
};

// @desc    Get claims log by ID from blockchain
// @route   GET /api/blockchain-claims/:id
// @access  Private (Admin only)
const getBlockchainClaim = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching claims log ${id} from blockchain...`);
        const response = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs/${id}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('❌ Error fetching claims log from blockchain:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch claims log from blockchain',
            error: error.message
        });
    }
};

// @desc    Create new claims log in blockchain
// @route   POST /api/blockchain-claims
// @access  Private (Admin only)
const createBlockchainClaim = async (req, res) => {
    try {
        console.log('📝 Creating claims log in blockchain...');
        const response = await axios.post(`${FABRIC_SERVICE_URL}/api/claims-logs`, req.body);
        console.log('✅ Successfully created claims log in blockchain');
        res.status(201).json(response.data);
    } catch (error) {
        console.error('❌ Error creating claims log in blockchain:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create claims log in blockchain',
            error: error.message
        });
    }
};

// @desc    Update claims log in blockchain
// @route   PUT /api/blockchain-claims/:id
// @access  Private (Admin only)
const updateBlockchainClaim = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`📝 Updating claims log ${id} in blockchain...`);
        const response = await axios.put(`${FABRIC_SERVICE_URL}/api/claims-logs/${id}`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('❌ Error updating claims log in blockchain:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update claims log in blockchain',
            error: error.message
        });
    }
};

// @desc    Get claims logs by farmer from blockchain
// @route   GET /api/blockchain-claims/farmer/:farmerId
// @access  Private (Admin only)
const getBlockchainClaimsByFarmer = async (req, res) => {
    try {
        const { farmerId } = req.params;
        console.log(`🔍 Fetching claims logs for farmer ${farmerId} from blockchain...`);
        const response = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs/farmer/${farmerId}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('❌ Error fetching claims logs by farmer from blockchain:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch claims logs by farmer from blockchain',
            error: error.message
        });
    }
};

// @desc    Get claims logs by status from blockchain
// @route   GET /api/blockchain-claims/status/:status
// @access  Private (Admin only)
const getBlockchainClaimsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        console.log(`🔍 Fetching claims logs with status ${status} from blockchain...`);
        const response = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs/status/${status}`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('❌ Error fetching claims logs by status from blockchain:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch claims logs by status from blockchain',
            error: error.message
        });
    }
};

// @desc    Get claims logs statistics from blockchain
// @route   GET /api/blockchain-claims/stats
// @access  Private (Admin only)
const getBlockchainClaimsStats = async (req, res) => {
    try {
        console.log('📊 Fetching claims logs statistics from blockchain...');
        const response = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs/stats`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('❌ Error fetching claims logs statistics from blockchain:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch claims logs statistics from blockchain',
            error: error.message
        });
    }
};

module.exports = {
    getBlockchainClaims,
    getBlockchainClaim,
    createBlockchainClaim,
    updateBlockchainClaim,
    getBlockchainClaimsByFarmer,
    getBlockchainClaimsByStatus,
    getBlockchainClaimsStats
};
