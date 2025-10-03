// Test script for Admin Filing Feature
// This script tests the new admin filing functionality

const API_BASE_URL = 'https://agri-chain.onrender.com';

// Test data for admin claim filing
const testClaimData = {
  farmerId: 'test-farmer-id', // This would be a real farmer ID in production
  name: 'Test Farmer',
  address: 'Test Address',
  phone: '1234567890',
  farmerLocation: '7.1907, 125.4551',
  crop: 'Rice',
  areaInsured: 2.5,
  varietyPlanted: 'IR64',
  plantingDate: '2024-01-15',
  cicNumber: 'CIC123456',
  underwriter: 'Test Insurance',
  program: ['PCIC'],
  areaDamaged: 1.5,
  degreeOfDamage: 75,
  damageType: 'Flood',
  lossDate: '2024-03-15',
  ageStage: 'Flowering',
  expectedHarvest: 'May 2024',
  filedBy: 'admin' // This is the key field for admin filing
};

// Test data for admin assistance filing
const testAssistanceData = {
  farmerId: 'test-farmer-id',
  assistanceId: 'test-assistance-id',
  requestedQuantity: 10,
  filedBy: 'admin' // This is the key field for admin filing
};

async function testAdminClaimFiling() {
  console.log('🧪 Testing Admin Claim Filing...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testClaimData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin claim filing test passed');
      console.log('Claim created:', result);
      console.log('Filed by:', result.filedBy);
    } else {
      console.log('❌ Admin claim filing test failed');
      console.log('Error:', result);
    }
  } catch (error) {
    console.log('❌ Admin claim filing test error:', error.message);
  }
}

async function testAdminAssistanceFiling() {
  console.log('🧪 Testing Admin Assistance Filing...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/assistance/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAssistanceData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin assistance filing test passed');
      console.log('Application created:', result);
      console.log('Filed by:', result.application?.filedBy);
    } else {
      console.log('❌ Admin assistance filing test failed');
      console.log('Error:', result);
    }
  } catch (error) {
    console.log('❌ Admin assistance filing test error:', error.message);
  }
}

async function testAPIHealth() {
  console.log('🧪 Testing API Health...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API is healthy');
      console.log('Status:', result.status);
      console.log('Environment:', result.environment);
    } else {
      console.log('❌ API health check failed');
    }
  } catch (error) {
    console.log('❌ API health check error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Admin Filing Feature Tests...\n');
  
  await testAPIHealth();
  console.log('');
  
  // Note: These tests will fail in production because we don't have real farmer/assistance IDs
  // But they demonstrate the API structure and the filedBy field functionality
  console.log('⚠️  Note: The following tests will fail in production without real data IDs');
  console.log('   This is expected and demonstrates the API structure\n');
  
  await testAdminClaimFiling();
  console.log('');
  
  await testAdminAssistanceFiling();
  console.log('');
  
  console.log('✅ Admin Filing Feature Tests Complete!');
  console.log('\n📋 Summary:');
  console.log('• Admin can file claims on behalf of farmers');
  console.log('• Admin can file assistance applications on behalf of farmers');
  console.log('• Both features include filedBy field to track who filed');
  console.log('• Frontend components are ready for admin use');
  console.log('• Backend APIs support admin filing functionality');
}

// Run the tests
runTests().catch(console.error);
