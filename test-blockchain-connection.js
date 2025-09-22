const axios = require('axios');

// Test script to verify blockchain connection
const FABRIC_SERVICE_URL = 'https://api.kapalongagrichain.site';

async function testBlockchainConnection() {
    console.log('🧪 Testing blockchain connection...');
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${FABRIC_SERVICE_URL}/health`);
        console.log('✅ Health check passed:', healthResponse.data);
        
        // Test getting all claims logs
        console.log('2. Testing get all claims logs...');
        const logsResponse = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs/org1`);
        console.log('✅ Retrieved claims logs:', logsResponse.data.length, 'records');
        
        // Test adding a new claim log
        console.log('3. Testing add new claim log...');
        const testClaim = {
            claimId: `TEST-${Date.now()}`,
            farmerName: 'Test Farmer',
            cropType: 'Rice',
            timestamp: new Date().toISOString(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        const addResponse = await axios.post(`${FABRIC_SERVICE_URL}/api/claims-logs/org1`, testClaim);
        console.log('✅ Added test claim:', addResponse.data);
        
        // Verify the claim was added
        console.log('4. Verifying claim was added...');
        const verifyResponse = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs/org1`);
        const testClaimFound = verifyResponse.data.find(log => log.claimId === testClaim.claimId);
        
        if (testClaimFound) {
            console.log('✅ Test claim found in blockchain:', testClaimFound);
        } else {
            console.log('❌ Test claim not found in blockchain');
        }
        
        console.log('🎉 All tests passed! Blockchain connection is working.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testBlockchainConnection();
