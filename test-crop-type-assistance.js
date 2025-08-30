// Test script for crop type integration in assistance applications
// This test verifies that farmers can apply for assistance based on their insured crop types

async function testCropTypeAssistanceFlow() {
    const baseURL = 'https://agri-chain.onrender.com/api';
    
    console.log('🌾 Testing Crop Type Assistance Integration Flow');
    console.log('================================================');
    
    try {
        // Step 1: Get existing farmers
        console.log('\n1. Fetching farmers...');
        const farmersResponse = await fetch(`${baseURL}/farmers`);
        const farmers = await farmersResponse.json();
        console.log(`✓ Found ${farmers.length} farmers`);
        
        if (farmers.length === 0) {
            console.log('❌ No farmers found. Please create farmers first.');
            return;
        }
        
        const testFarmer = farmers[0];
        console.log(`📋 Using test farmer: ${testFarmer.firstName} ${testFarmer.lastName}`);
        console.log(`   Primary crop type: ${testFarmer.cropType || 'Not set'}`);
        
        // Step 2: Check farmer's crop insurance records
        console.log('\n2. Checking farmer\'s crop insurance records...');
        const insuranceResponse = await fetch(`${baseURL}/crop-insurance/farmer/${testFarmer._id}`);
        const insuranceRecords = await insuranceResponse.json();
        console.log(`✓ Found ${insuranceRecords.length} insurance records`);
        
        let insuredCropTypes = [];
        if (insuranceRecords.length > 0) {
            insuredCropTypes = [...new Set(insuranceRecords.map(r => r.cropType).filter(Boolean))];
            console.log(`   Insured crop types: ${insuredCropTypes.join(', ')}`);
        } else {
            console.log('⚠️  No crop insurance records found. Creating test record...');
            
            // Create a test crop insurance record
            const testInsuranceData = {
                farmerId: testFarmer._id,
                cropType: 'Rice',
                cropArea: 5,
                lotNumber: 'TEST-LOT-001',
                lotArea: 5,
                plantingDate: new Date().toISOString(),
                expectedHarvestDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
                insuranceDayLimit: 30,
                notes: 'Test insurance record for assistance application'
            };
            
            const createInsuranceResponse = await fetch(`${baseURL}/crop-insurance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testInsuranceData)
            });
            
            if (createInsuranceResponse.ok) {
                const newRecord = await createInsuranceResponse.json();
                console.log(`   ✓ Created test insurance record: ${newRecord.cropType}`);
                insuredCropTypes = [newRecord.cropType];
            } else {
                console.log('   ❌ Failed to create test insurance record');
            }
        }
        
        // Step 3: Get available assistance programs
        console.log('\n3. Fetching available assistance programs...');
        const assistanceResponse = await fetch(`${baseURL}/assistance`);
        const assistancePrograms = await assistanceResponse.json();
        console.log(`✓ Found ${assistancePrograms.length} assistance programs`);
        
        if (assistancePrograms.length === 0) {
            console.log('⚠️  No assistance programs found. Creating test program...');
            
            // Create a test assistance program matching farmer's crop
            const testAssistanceData = {
                assistanceType: 'Rice Seeds',
                cropType: insuredCropTypes[0] || 'Rice',
                description: 'High-quality rice seeds for farmers',
                availableQuantity: 1000,
                maxQuantityPerFarmer: 50,
                founderName: 'Department of Agriculture',
                requiresRSBSA: false,
                requiresCertification: false,
                status: 'active'
            };
            
            const createAssistanceResponse = await fetch(`${baseURL}/assistance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testAssistanceData)
            });
            
            if (createAssistanceResponse.ok) {
                const newAssistance = await createAssistanceResponse.json();
                console.log(`   ✓ Created test assistance program: ${newAssistance.assistanceType}`);
                assistancePrograms.push(newAssistance);
            } else {
                console.log('   ❌ Failed to create test assistance program');
                return;
            }
        }
        
        // Step 4: Find matching assistance for farmer's crop types
        console.log('\n4. Finding matching assistance programs...');
        const matchingAssistance = assistancePrograms.filter(assistance => {
            if (!assistance.cropType) return false;
            
            // Check if assistance crop type matches any of farmer's insured crops
            const assistanceCrop = assistance.cropType.toLowerCase();
            const hasMatch = insuredCropTypes.some(crop => 
                crop.toLowerCase() === assistanceCrop
            );
            
            // Also check farmer's primary crop type as fallback
            const primaryCropMatch = testFarmer.cropType && 
                testFarmer.cropType.toLowerCase() === assistanceCrop;
            
            return hasMatch || primaryCropMatch;
        });
        
        console.log(`✓ Found ${matchingAssistance.length} matching assistance programs:`);
        matchingAssistance.forEach((assistance, index) => {
            console.log(`   ${index + 1}. ${assistance.assistanceType} (${assistance.cropType})`);
        });
        
        if (matchingAssistance.length === 0) {
            console.log('❌ No matching assistance programs found for farmer\'s crop types');
            console.log(`   Farmer's crops: ${insuredCropTypes.join(', ') || testFarmer.cropType || 'None'}`);
            console.log(`   Available assistance crops: ${assistancePrograms.map(a => a.cropType).filter(Boolean).join(', ')}`);
            return;
        }
        
        // Step 5: Test assistance application
        console.log('\n5. Testing assistance application...');
        const selectedAssistance = matchingAssistance[0];
        
        // Prepare farmer data with insured crop types (mimicking frontend behavior)
        const farmerData = {
            ...testFarmer,
            insuredCropTypes,
            cropType: insuredCropTypes.length > 0 ? insuredCropTypes[0] : testFarmer.cropType
        };
        
        const applicationData = {
            farmerId: testFarmer._id,
            assistanceId: selectedAssistance._id,
            requestedQuantity: 25, // Request half of max allowed
            farmerData: farmerData
        };
        
        console.log(`📝 Applying for: ${selectedAssistance.assistanceType}`);
        console.log(`   Crop type match: ${selectedAssistance.cropType} vs ${farmerData.cropType}`);
        console.log(`   Requested quantity: ${applicationData.requestedQuantity}kg`);
        
        const applyResponse = await fetch(`${baseURL}/assistance/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationData)
        });
        
        if (applyResponse.ok) {
            const application = await applyResponse.json();
            console.log('✅ Application submitted successfully!');
            console.log(`   Application ID: ${application.application._id}`);
            console.log(`   Status: ${application.application.status}`);
            console.log(`   Eligibility checks:`, application.application.eligibilityCheck);
        } else {
            const error = await applyResponse.json();
            console.log('❌ Application failed:', error.message);
        }
        
        // Step 6: Verify application was created
        console.log('\n6. Verifying application was created...');
        const applicationsResponse = await fetch(`${baseURL}/assistance/applications/${testFarmer._id}`);
        const applications = await applicationsResponse.json();
        console.log(`✓ Farmer now has ${applications.length} application(s)`);
        
        if (applications.length > 0) {
            const latestApp = applications[0];
            console.log(`   Latest application: ${latestApp.assistanceId?.assistanceType || 'Unknown'}`);
            console.log(`   Status: ${latestApp.status}`);
            console.log(`   Crop type match: ${latestApp.eligibilityCheck?.cropTypeMatch ? '✅' : '❌'}`);
        }
        
        console.log('\n🎉 Crop Type Assistance Integration Test Completed Successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test
testCropTypeAssistanceFlow();