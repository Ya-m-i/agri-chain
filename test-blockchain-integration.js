const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';
const FABRIC_SERVICE_URL = 'http://localhost:3001';

async function testBlockchainIntegration() {
    console.log(' Testing Blockchain Integration...\n');

    // Test 1: Check if backend is running
    try {
        console.log('1. Testing backend connection...');
        const response = await axios.get(API_BASE_URL + '/api/health');
        console.log('✅ Backend is running');
        console.log('   Status:', response.data.status);
    } catch (error) {
        console.log('❌ Backend is not running. Please start your backend server.');
        return;
    }

    // Test 2: Check if Fabric service is accessible
    try {
        console.log('2. Testing Fabric service connection...');
        const response = await axios.get(FABRIC_SERVICE_URL + '/health');
        console.log('✅ Fabric service is accessible');
        console.log('   Status:', response.data.status);
        console.log('   Initialized:', response.data.initialized);
    } catch (error) {
        console.log('❌ Fabric service is not accessible. Please check:');
        console.log('   - Laptop 2 is running the Fabric network');
        console.log('   - Connection service is running on port 3001');
        console.log('   - Current FABRIC_SERVICE_URL:', FABRIC_SERVICE_URL);
        return;
    }

    console.log('\n🎉 Blockchain integration test completed!');
}

testBlockchainIntegration().catch(console.error);
