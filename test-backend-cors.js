// CORS and Backend Connectivity Test
// Run this with: node test-backend-cors.js

const https = require('https');

const BACKEND_URL = 'https://agri-chain.onrender.com';

console.log('🧪 Testing AGRI-CHAIN Backend Connectivity and CORS...\n');

// Test 1: Health Check
function testHealthCheck() {
  return new Promise((resolve, reject) => {
    console.log('1️⃣ Testing Health Check endpoint...');
    
    https.get(`${BACKEND_URL}/api/health`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ Health Check PASSED');
          console.log('📊 Server Status:', response.status);
          console.log('🌍 Environment:', response.environment);
          console.log('📅 Timestamp:', response.timestamp);
          resolve(response);
        } else {
          console.log('❌ Health Check FAILED - Status:', res.statusCode);
          reject(new Error(`Health check failed with status: ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      console.log('❌ Health Check ERROR:', err.message);
      reject(err);
    });
  });
}

// Test 2: CORS Test
function testCORS() {
  return new Promise((resolve, reject) => {
    console.log('\n2️⃣ Testing CORS endpoint...');
    
    https.get(`${BACKEND_URL}/api/cors-test`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ CORS Test PASSED');
          console.log('📝 Message:', response.message);
          console.log('📅 Timestamp:', response.timestamp);
          resolve(response);
        } else {
          console.log('❌ CORS Test FAILED - Status:', res.statusCode);
          reject(new Error(`CORS test failed with status: ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      console.log('❌ CORS Test ERROR:', err.message);
      reject(err);
    });
  });
}

// Test 3: API Endpoints
function testAPIEndpoints() {
  return new Promise((resolve, reject) => {
    console.log('\n3️⃣ Testing API endpoints availability...');
    
    const endpoints = [
      '/api/farmers',
      '/api/claims', 
      '/api/assistance',
      '/api/crop-insurance'
    ];
    
    let completed = 0;
    const results = {};
    
    endpoints.forEach((endpoint) => {
      https.get(`${BACKEND_URL}${endpoint}`, (res) => {
        const status = res.statusCode;
        results[endpoint] = status;
        
        if (status === 200 || status === 401 || status === 404) {
          console.log(`✅ ${endpoint} - Status: ${status} (Available)`);
        } else {
          console.log(`⚠️ ${endpoint} - Status: ${status}`);
        }
        
        completed++;
        if (completed === endpoints.length) {
          resolve(results);
        }
      }).on('error', (err) => {
        console.log(`❌ ${endpoint} - ERROR: ${err.message}`);
        results[endpoint] = 'ERROR';
        completed++;
        if (completed === endpoints.length) {
          resolve(results);
        }
      });
    });
  });
}

// Run all tests
async function runTests() {
  try {
    await testHealthCheck();
    await testCORS();
    await testAPIEndpoints();
    
    console.log('\n🎉 Backend connectivity tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy the updated server.js to Render');
    console.log('2. Wait for deployment to complete');
    console.log('3. Test your frontend again');
    console.log('4. Check browser console for CORS errors');
    
  } catch (error) {
    console.log('\n💥 Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your Render backend is deployed and running');
    console.log('2. Check Render logs for startup errors');
    console.log('3. Verify environment variables are set in Render');
  }
}

runTests();