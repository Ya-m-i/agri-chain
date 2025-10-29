# 🚀 AGRI-CHAIN Render Deployment Guide

## 📍 Current Deployment Status

### ✅ Live Services on Render

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | `https://agri-chain-frontend.onrender.com` | 🟢 Live |
| **Backend API** | `https://agri-chain.onrender.com` | 🟢 Live |
| **Database** | MongoDB Atlas | 🟢 Connected |
| **Blockchain** | `https://api.kapalongagrichain.site` | 🟢 Connected |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    AGRI-CHAIN System                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────┐          ┌──────────────────┐        │
│  │   FRONTEND        │          │    BACKEND       │        │
│  │   (React SPA)     │◄────────►│   (Express.js)   │        │
│  │                   │          │                  │        │
│  │  Render Static    │   HTTPS  │  Render Web      │        │
│  │  Site Hosting     │   REST   │  Service         │        │
│  │                   │   & WS   │                  │        │
│  └───────────────────┘          └──────────────────┘        │
│           │                              │                   │
│           │                              ├──────────────┐    │
│           │                              │              │    │
│           ▼                              ▼              ▼    │
│  ┌───────────────────┐     ┌──────────────────┐  ┌────────┐│
│  │  Service Worker   │     │  MongoDB Atlas   │  │Fabric  ││
│  │  (PWA Cache)      │     │  (Database)      │  │Service ││
│  └───────────────────┘     └──────────────────┘  └────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Render Configuration

### Frontend (Static Site)

#### Build Settings:
```yaml
Name: agri-chain-frontend
Type: Static Site
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
Auto-Deploy: Yes (on Git push to main)
```

#### Environment Variables:
```env
VITE_API_URL=https://agri-chain.onrender.com
VITE_SOCKET_URL=https://agri-chain.onrender.com
VITE_APP_NAME=AGRI-CHAIN
VITE_APP_VERSION=1.0.0
```

#### Custom Domain (Optional):
- You can add a custom domain in Render dashboard
- Automatic SSL certificate provisioning
- DNS configuration required

---

### Backend (Web Service)

#### Build Settings:
```yaml
Name: agri-chain-backend
Type: Web Service
Root Directory: backend
Build Command: npm install
Start Command: npm start
Port: 5000 (default)
Auto-Deploy: Yes (on Git push to main)
Health Check Path: /api/health
```

#### Environment Variables (Set in Render Dashboard):
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://ashton1234:ashton1234@ashtoncluster.hpza7tw.mongodb.net/agrichain?retryWrites=true&w=majority&appName=AshtonCluster
JWT_SECRET=abc123
FRONTEND_URL=https://agri-chain-frontend.onrender.com
FABRIC_SERVICE_URL=https://api.kapalongagrichain.site
```

⚠️ **Important**: Never commit `.env` files with secrets to Git. Always use Render's environment variable dashboard.

---

## 🚀 Deployment Workflow

### Automatic Deployment (Recommended)

1. **Make changes to your code locally**
   ```bash
   # Edit your files
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Render automatically detects the push**
   - Frontend and backend rebuild automatically
   - Takes ~2-5 minutes
   - Logs available in Render dashboard

3. **Verify deployment**
   - Check Render dashboard for build status
   - Test the live URLs
   - Monitor logs for errors

### Manual Deployment

1. **Go to Render Dashboard**
   - https://dashboard.render.com

2. **Select your service**
   - Click on `agri-chain-frontend` or `agri-chain-backend`

3. **Click "Manual Deploy"**
   - Select branch (usually `main`)
   - Click "Deploy"
   - Wait for build to complete

---

## 🔍 Monitoring & Debugging

### Health Checks

#### Backend Health:
```bash
curl https://agri-chain.onrender.com/api/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "AGRI-CHAIN API is running",
  "timestamp": "2025-10-29T...",
  "environment": "production",
  "version": "1.0.0",
  "cors": {
    "origin": "...",
    "allowedInProduction": [
      "https://ya-m-i.github.io",
      "https://agri-chain-frontend.onrender.com"
    ]
  }
}
```

#### CORS Test:
```bash
curl https://agri-chain.onrender.com/api/cors-test
```

#### Database Connection:
Check backend logs for:
```
MongoDB Connected: ashtoncluster.hpza7tw.mongodb.net
✅ AGRI-CHAIN Server running on port: 5000
```

### Viewing Logs

#### Method 1: Render Dashboard
1. Go to https://dashboard.render.com
2. Click on your service
3. Click "Logs" tab
4. View real-time logs

#### Method 2: Render CLI
```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# View logs
render logs -s agri-chain-backend
```

### Common Log Messages

✅ **Success Indicators:**
```
✅ AGRI-CHAIN Server running on port: 5000
MongoDB Connected: ashtoncluster.hpza7tw.mongodb.net
🔌 Socket.IO server initialized
🌐 CORS enabled for GitHub Pages
```

❌ **Error Indicators:**
```
MongoDB connection error: ...
CORS: Origin blocked - ...
Failed to connect to Fabric network
```

---

## 🐛 Troubleshooting

### Problem: Frontend Can't Connect to Backend

**Symptoms:**
- API calls fail
- CORS errors in browser console
- Loading states never resolve

**Solutions:**
1. **Check backend status**
   ```bash
   curl https://agri-chain.onrender.com/api/health
   ```

2. **Verify environment variables**
   - Frontend has correct `VITE_API_URL`
   - Backend has correct `FRONTEND_URL`

3. **Check CORS configuration**
   - Backend allows frontend origin
   - Check backend logs for CORS messages

4. **Rebuild frontend**
   - Environment variables are build-time
   - Must rebuild after changing them

---

### Problem: Backend Shows "Service Unavailable"

**Symptoms:**
- 503 errors
- Backend not responding
- Health check fails

**Solutions:**
1. **Check Render service status**
   - Go to Render dashboard
   - Look for deployment errors
   - Check if service is suspended

2. **Review build logs**
   - Look for npm install errors
   - Check for missing dependencies
   - Verify Node.js version compatibility

3. **Check MongoDB connection**
   - Verify MONGO_URI is correct
   - Check MongoDB Atlas IP whitelist
   - Ensure cluster is active

---

### Problem: WebSocket Connections Failing

**Symptoms:**
- Real-time updates not working
- Socket.IO connection errors
- "Transport error" messages

**Solutions:**
1. **Verify WebSocket support**
   - Render supports WebSockets
   - Check firewall/proxy settings
   - Try different network

2. **Check socket URL**
   - Should match backend URL
   - Must use `https://` (not `http://`)

3. **Review backend logs**
   - Look for "Client connected" messages
   - Check for authentication errors

---

### Problem: Slow First Request (Cold Start)

**Symptoms:**
- First request takes 30+ seconds
- Subsequent requests are fast
- Happens after inactivity

**Solutions:**
1. **Upgrade to paid plan**
   - Free tier spins down after inactivity
   - Paid tier keeps services running

2. **Implement keep-alive**
   - Periodic health check pings
   - External monitoring service
   - Uptime monitoring tools

3. **Show loading state**
   - Inform users about cold start
   - Display appropriate loading message

---

## 📊 Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   - Already implemented with React.lazy()
   - Routes loaded on demand
   - Reduces initial bundle size

2. **Asset Optimization**
   - Vite handles minification
   - Tree shaking enabled
   - Hash-based cache busting

3. **Caching Strategy**
   - React Query for API caching
   - Service Worker for offline support
   - Browser cache for static assets

### Backend Optimization

1. **Database Indexing**
   - Indexes on frequently queried fields
   - Compound indexes for complex queries
   - Check `createOptimizedIndexes()` in db.js

2. **Connection Pooling**
   - Min connections: 5
   - Max connections: 10
   - Prevents connection exhaustion

3. **Socket.IO Rooms**
   - Targeted event broadcasting
   - Reduces unnecessary traffic
   - Admin and farmer-specific rooms

---

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files
- ✅ Use Render's environment variable dashboard
- ✅ Rotate secrets regularly
- ✅ Use strong JWT_SECRET

### CORS Configuration
- ✅ Whitelist specific origins only
- ✅ No wildcard (*) in production
- ✅ Credentials support enabled
- ✅ Proper preflight handling

### Database Security
- ✅ MongoDB Atlas with authentication
- ✅ IP whitelisting (0.0.0.0/0 for Render)
- ✅ TLS/SSL encryption
- ✅ Limited user permissions

### API Security
- ✅ JWT authentication
- ✅ Password hashing (bcryptjs)
- ✅ Input validation
- ✅ Error handling middleware

---

## 📈 Scaling on Render

### Free Tier Limitations:
- 512 MB RAM
- 0.5 CPU
- Service spins down after 15 min inactivity
- 750 hours/month free

### Upgrading:
1. **Starter Plan** ($7/month/service)
   - Always on (no spin down)
   - Custom domains
   - Better performance

2. **Standard Plan** ($25/month/service)
   - More resources
   - Faster builds
   - Priority support

### Horizontal Scaling:
- Multiple instances (paid plans)
- Load balancing
- Redis for Socket.IO adapter
- Separate database tier

---

## 🧪 Testing Deployment

### Manual Testing Checklist:

- [ ] Frontend loads successfully
- [ ] Backend health check responds
- [ ] User can login (admin and farmer)
- [ ] Claims can be created
- [ ] Real-time updates work
- [ ] Dashboard displays data
- [ ] Blockchain logging works
- [ ] Mobile responsive design
- [ ] PWA installation works
- [ ] Offline mode functions

### Automated Testing:

Run test scripts:
```bash
# Test backend API
node test-api.js

# Test CORS configuration
node test-backend-cors.js

# Test blockchain integration
node test-blockchain-integration.js

# Test assistance flow
node test-crop-type-assistance.js
```

---

## 📞 Support & Resources

### Render Documentation:
- https://render.com/docs
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/static-sites

### AGRI-CHAIN Resources:
- Main README: `README.md`
- Architecture Analysis: `SYSTEM_ARCHITECTURE_ANALYSIS.md`
- CORS Fix Guide: `CORS_FIX_DEPLOYMENT_GUIDE.md`
- GitHub Pages Guide: `GITHUB_PAGES_DEPLOYMENT.md`
- Production Summary: `PRODUCTION_DEPLOYMENT_SUMMARY.md`

### Getting Help:
1. Check Render status: https://status.render.com
2. Review deployment logs in dashboard
3. Check MongoDB Atlas status
4. Review application logs
5. Test with curl/Postman

---

## 🎯 Quick Commands

### Check Services:
```bash
# Backend health
curl https://agri-chain.onrender.com/api/health

# CORS test
curl https://agri-chain.onrender.com/api/cors-test

# Get farmers
curl https://agri-chain.onrender.com/api/farmers
```

### Rebuild Services:
```bash
# Trigger rebuild via Git
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

### View Logs:
```bash
# Using Render CLI
render logs -s agri-chain-backend --tail

# Or use Render Dashboard web interface
```

---

## ✅ Deployment Checklist

### Initial Setup:
- [x] Create Render account
- [x] Connect GitHub repository
- [x] Create frontend static site
- [x] Create backend web service
- [x] Configure environment variables
- [x] Set up MongoDB Atlas
- [x] Configure CORS
- [x] Test deployments

### Ongoing Maintenance:
- [ ] Monitor Render logs regularly
- [ ] Check MongoDB Atlas usage
- [ ] Update dependencies periodically
- [ ] Review and rotate secrets
- [ ] Monitor performance metrics
- [ ] Backup database regularly
- [ ] Test disaster recovery

---

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Frontend loads at Render URL
- ✅ Backend responds to health checks
- ✅ Database connection established
- ✅ Socket.IO connections work
- ✅ CORS allows frontend requests
- ✅ Users can login and interact
- ✅ Real-time updates function
- ✅ Blockchain logging works
- ✅ No errors in logs
- ✅ Mobile responsive

**Current Status**: ✅ All systems operational on Render!

---

**Last Updated**: October 29, 2025
**Deployment Platform**: Render
**Application Version**: 1.0.0

