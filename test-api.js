// Using built-in fetch (Node.js 18+)

async function testAPI() {
    const baseURL = 'https://agri-chain.onrender.com/api';
    
    try {
        // Test farmers endpoint
        console.log('Testing farmers endpoint...');
        const farmersResponse = await fetch(`${baseURL}/farmers`);
        const farmers = await farmersResponse.json();
        console.log('Farmers found:', farmers.length);
        
        if (farmers.length > 0) {
            console.log('First farmer:', farmers[0]);
            
            // Test crop insurance creation
            console.log('\nTesting crop insurance creation...');
            const cropInsuranceData = {
                farmerId: farmers[0]._id,
                cropType: 'Corn',
                cropArea: 10,
                lotNumber: 'LOT001',
                lotArea: 10,
                plantingDate: '2024-01-01T00:00:00.000Z',
                expectedHarvestDate: '2024-06-01T00:00:00.000Z',
                insuranceDayLimit: 30,
                notes: 'Test crop insurance record'
            };
            
            const createResponse = await fetch(`${baseURL}/crop-insurance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cropInsuranceData)
            });
            
            if (createResponse.ok) {
                const createdRecord = await createResponse.json();
                console.log('Crop insurance created successfully:', createdRecord._id);
            } else {
                const error = await createResponse.json();
                console.error('Error creating crop insurance:', error);
            }
        } else {
            console.log('No farmers found in database');
        }
        
    } catch (error) {
        console.error('API test failed:', error.message);
    }
}

testAPI(); 