# 🔗 AGRI-CHAIN Blockchain Integration Setup Instructions

## 📋 Overview
This document provides step-by-step instructions for setting up the Hyperledger Fabric blockchain integration for AGRI-CHAIN on Laptop 1.

## 🎯 What's Implemented
- **Blockchain Claims Logs**: Claims are automatically logged to Hyperledger Fabric with:
  - Claim ID
  - Farmer Name
  - Crop Type
  - Timestamp
  - Status

## 🚀 Setup Steps Completed

### ✅ Backend Setup
1. **Dependencies Installed**
   - `axios` for HTTP requests to Fabric service

2. **New Files Created**
   - `backend/controller/blockchainClaimsController.js` - Handles blockchain API calls
   - `backend/routes/blockchainClaimsRoutes.js` - Defines blockchain routes

3. **Files Modified**
   - `backend/server.js` - Added blockchain routes
   - `backend/controller/claimController.js` - Added automatic blockchain logging
   - `.env` - Added FABRIC_SERVICE_URL

### ✅ Frontend Setup
1. **New Files Created**
   - `frontend/src/store/blockchainClaimsStore.js` - Zustand store for blockchain data
   - `frontend/src/components/BlockchainClaimsLogs.jsx` - UI component for viewing logs

2. **Files Modified**
   - `frontend/src/api.jsx` - Added blockchain API functions

## 🔧 Configuration

### Environment Variables
```env
# Hyperledger Fabric Service URL (Laptop 2)
FABRIC_SERVICE_URL=http://192.168.1.100:3001
```

**Important**: Replace `192.168.1.100` with the actual IP address of Laptop 2.

## 🧪 Testing

### Test the Integration
```bash
# Run the test script
node test-blockchain-integration.js
```

### Manual Testing
1. **Start Backend**
   ```bash
   cd backend
   npm run server
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Claims Creation**
   - Create a claim through the farmer dashboard
   - Check if it appears in blockchain logs

## 📊 API Endpoints

### Blockchain Claims Logs
- `GET /api/blockchain-claims` - Get all claims logs
- `GET /api/blockchain-claims/stats` - Get statistics
- `GET /api/blockchain-claims/farmer/:farmerId` - Get logs by farmer
- `GET /api/blockchain-claims/status/:status` - Get logs by status
- `GET /api/blockchain-claims/:id` - Get specific log
- `POST /api/blockchain-claims` - Create new log
- `PUT /api/blockchain-claims/:id` - Update log

## 🔄 How It Works

### Automatic Blockchain Logging
1. **Claim Creation**: When a claim is created via `/api/claims`, it's automatically logged to blockchain
2. **Claim Updates**: When a claim status is updated, the new status is logged to blockchain
3. **Data Structure**: Only essential data is logged:
   ```json
   {
     "claimId": "CLM-2024-123456-001",
     "farmerName": "John Doe",
     "cropType": "Rice",
     "timestamp": "2024-01-15T10:00:00Z",
     "status": "pending"
   }
   ```

### Error Handling
- Blockchain logging failures don't break claim creation
- Errors are logged but don't affect the main application flow
- Frontend gracefully handles blockchain service unavailability

## 🎨 Frontend Integration

### Adding to Admin Dashboard
To add the blockchain claims logs to your admin dashboard:

1. **Import the component**
   ```jsx
   import BlockchainClaimsLogs from '../components/BlockchainClaimsLogs';
   ```

2. **Add as a new tab or section**
   ```jsx
   <BlockchainClaimsLogs />
   ```

### Features
- **Real-time Updates**: Automatically refreshes blockchain data
- **Search & Filter**: Search by farmer name, claim ID, or crop type
- **Status Filtering**: Filter by claim status
- **Statistics**: View total logs and status counts
- **Responsive Design**: Works on all screen sizes

## 🔍 Troubleshooting

### Common Issues

1. **Fabric Service Not Accessible**
   - Check if Laptop 2 is running the Fabric network
   - Verify the IP address in `.env` file
   - Ensure connection service is running on port 3001

2. **Claims Not Logging to Blockchain**
   - Check backend console for error messages
   - Verify FABRIC_SERVICE_URL is correct
   - Test direct connection to Fabric service

3. **Frontend Not Loading Blockchain Data**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check network tab for failed requests

### Debug Commands
```bash
# Test backend health
curl http://localhost:5000/api/health

# Test blockchain service
curl http://192.168.1.100:3001/health

# Test blockchain claims logs
curl http://localhost:5000/api/blockchain-claims
```

## 📝 Next Steps

1. **Set up Laptop 2** with Hyperledger Fabric network
2. **Update IP address** in `.env` file with Laptop 2's actual IP
3. **Test the integration** using the provided test script
4. **Add blockchain logs view** to admin dashboard
5. **Monitor logs** for any issues

## 🆘 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure both laptops are on the same network
4. Test each component individually

## 🎉 Success Indicators

You'll know the integration is working when:
- ✅ Backend starts without errors
- ✅ Test script passes all tests
- ✅ Claims are created successfully
- ✅ Blockchain logs appear in the admin interface
- ✅ No error messages in console logs
