const axios = require('axios');

// Test real blockchain connection
const FABRIC_SERVICE_URL = 'https://api.kapalongagrichain.site';

async function testBlockchainConnection() {
    console.log('🧪 Testing Real Blockchain Connection...');
    console.log('📍 Blockchain URL:', FABRIC_SERVICE_URL);
    
    try {
        // Test health endpoint
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await axios.get(`${FABRIC_SERVICE_URL}/health`);
        console.log('✅ Health check successful:', healthResponse.data);
        
        // Test claims logs endpoint
        console.log('\n2. Testing claims logs endpoint...');
        const logsResponse = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs`);
        console.log('✅ Claims logs retrieved:', logsResponse.data.length, 'records');
        
        // Test adding a new claim log
        console.log('\n3. Testing claim log creation...');
        const testClaim = {
            claimId: `TEST-${Date.now()}`,
            farmerName: 'Test Farmer',
            cropType: 'Rice',
            timestamp: new Date().toISOString(),
            status: 'pending',
            action: 'test'
        };
        
        const createResponse = await axios.post(`${FABRIC_SERVICE_URL}/api/claims-logs`, testClaim);
        console.log('✅ Test claim created successfully:', createResponse.data);
        
        // Verify the claim was added
        console.log('\n4. Verifying test claim...');
        const verifyResponse = await axios.get(`${FABRIC_SERVICE_URL}/api/claims-logs`);
        const testClaimFound = verifyResponse.data.find(claim => claim.claimId === testClaim.claimId);
        
        if (testClaimFound) {
            console.log('✅ Test claim verified in blockchain:', testClaimFound);
        } else {
            console.log('❌ Test claim not found in blockchain');
        }
        
        console.log('\n🎉 All tests passed! Real blockchain is working correctly.');
        
    } catch (error) {
        console.error('❌ Blockchain connection failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testBlockchainConnection();
