const express = require('express');
const cors = require('cors');
const FabricClient = require('./fabricClient');

const app = express();
const PORT = 3001;

// Initialize Fabric client
const fabricClient = new FabricClient();

// In-memory storage as fallback
let claimsLogs = [];

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        initialized: true,
        timestamp: new Date().toISOString(),
        message: 'AGRI-CHAIN Fabric Service is running with hybrid blockchain storage',
        blockchainConnected: fabricClient.connected
    });
});

// Initialize Fabric connection on startup
async function initializeFabric() {
    try {
        await fabricClient.connect();
        console.log('✅ Connected to Hyperledger Fabric network');
    } catch (error) {
        console.error('❌ Failed to connect to Fabric network:', error);
        console.log('🔄 Using hybrid storage mode (database + local blockchain simulation)');
        // Don't exit, just log the error and continue with hybrid mode
    }
}

// Initialize on startup
initializeFabric();

// Get all claims logs
app.get('/api/claims-logs', async (req, res) => {
    try {
        if (fabricClient.connected) {
            console.log('📋 Fetching claims logs from Hyperledger Fabric...');
            const claimLogs = await fabricClient.queryAllClaimLogs();
            console.log(`✅ Retrieved ${claimLogs.length} claim logs from blockchain`);
            res.json({
                success: true,
                data: claimLogs,
                count: claimLogs.length,
                source: 'blockchain'
            });
        } else {
            console.log('📋 Fetching claims logs from local storage...');
            res.json({
                success: true,
                data: claimsLogs,
                count: claimsLogs.length,
                source: 'local_storage'
            });
        }
    } catch (error) {
        console.error('❌ Error getting claims logs:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Add new claim log
app.post('/api/claims-logs', async (req, res) => {
    try {
        const { claimId, farmerName, cropType, timestamp, status } = req.body;
        
        if (!claimId || !farmerName || !cropType || !timestamp || !status) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: claimId, farmerName, cropType, timestamp, status'
            });
        }

        const claimLog = {
            id: `claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            claimId,
            farmerName,
            cropType,
            timestamp,
            status,
            createdAt: new Date().toISOString()
        };

        if (fabricClient.connected) {
            console.log('📝 Adding claim log to Hyperledger Fabric blockchain...');
            const result = await fabricClient.addClaimLog(claimId, farmerName, cropType, timestamp, status);
            console.log('✅ Successfully added claim log to blockchain');
            
            res.json({
                success: true,
                data: result,
                source: 'blockchain'
            });
        } else {
            console.log('📝 Adding claim log to local storage...');
            claimsLogs.push(claimLog);
            console.log('✅ Successfully added claim log to local storage');
            
            res.json({
                success: true,
                data: claimLog,
                source: 'local_storage'
            });
        }
    } catch (error) {
        console.error('❌ Error adding claim log:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Get claims logs by farmer
app.get('/api/claims-logs/farmer/:farmerName', async (req, res) => {
    try {
        const { farmerName } = req.params;
        
        if (fabricClient.connected) {
            console.log(`�� Querying claim logs for farmer: ${farmerName}`);
            const claimLogs = await fabricClient.queryClaimLogsByFarmer(farmerName);
            res.json({
                success: true,
                data: claimLogs,
                count: claimLogs.length,
                source: 'blockchain'
            });
        } else {
            console.log(`🔍 Querying claim logs for farmer from local storage: ${farmerName}`);
            const filteredLogs = claimsLogs.filter(log => log.farmerName === farmerName);
            res.json({
                success: true,
                data: filteredLogs,
                count: filteredLogs.length,
                source: 'local_storage'
            });
        }
    } catch (error) {
        console.error('❌ Error querying claim logs by farmer:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Get claims logs by status
app.get('/api/claims-logs/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        
        if (fabricClient.connected) {
            console.log(`🔍 Querying claim logs with status: ${status}`);
            const claimLogs = await fabricClient.queryClaimLogsByStatus(status);
            res.json({
                success: true,
                data: claimLogs,
                count: claimLogs.length,
                source: 'blockchain'
            });
        } else {
            console.log(`�� Querying claim logs with status from local storage: ${status}`);
            const filteredLogs = claimsLogs.filter(log => log.status === status);
            res.json({
                success: true,
                data: filteredLogs,
                count: filteredLogs.length,
                source: 'local_storage'
            });
        }
    } catch (error) {
        console.error('❌ Error querying claim logs by status:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Get claims logs statistics
app.get('/api/claims-logs/stats', async (req, res) => {
    try {
        if (fabricClient.connected) {
            console.log('📊 Fetching claim logs statistics from blockchain...');
            const stats = await fabricClient.getClaimLogsStats();
            res.json({
                success: true,
                data: stats,
                source: 'blockchain'
            });
        } else {
            console.log('📊 Fetching claim logs statistics from local storage...');
            const stats = {
                totalLogs: claimsLogs.length,
                statusCounts: {
                    pending: 0,
                    approved: 0,
                    rejected: 0,
                    completed: 0
                }
            };
            
            claimsLogs.forEach(log => {
                if (stats.statusCounts[log.status] !== undefined) {
                    stats.statusCounts[log.status]++;
                }
            });
            
            res.json({
                success: true,
                data: stats,
                source: 'local_storage'
            });
        }
    } catch (error) {
        console.error('❌ Error getting claim logs stats:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await fabricClient.disconnect();
    process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 AGRI-CHAIN Fabric Service running on port ' + PORT);
    console.log('�� Hybrid blockchain storage mode');
    console.log('📊 Health check: http://localhost:' + PORT + '/health');
    console.log('📋 Claims logs: http://localhost:' + PORT + '/api/claims-logs');
});