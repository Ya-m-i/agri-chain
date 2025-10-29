# 🌾 AGRI-CHAIN Quick Reference Card

## 🚀 Your Live URLs

```
Frontend: https://agri-chain-frontend.onrender.com
Backend:  https://agri-chain.onrender.com
Alt URL:  https://ya-m-i.github.io/agri-chain/
```

---

## 🏗️ Architecture at a Glance

```
┌─────────────────┐     HTTPS/WSS      ┌─────────────────┐
│    Frontend     │◄──────────────────►│     Backend     │
│   React SPA     │   REST + Socket    │  Express API    │
│   (on Render)   │                    │  (on Render)    │
└─────────────────┘                    └────────┬────────┘
                                               │
                                    ┌──────────┼──────────┐
                                    │                     │
                              ┌─────▼──────┐      ┌──────▼─────┐
                              │  MongoDB   │      │  Fabric    │
                              │   Atlas    │      │ Blockchain │
                              └────────────┘      └────────────┘
```

---

## 🔧 Technology Stack

| Layer | Tech | Version |
|-------|------|---------|
| Frontend | React | 19.0.0 |
| Build Tool | Vite | 6.2.6 |
| State | Zustand | 5.0.3 |
| Data Fetch | React Query | 5.85.5 |
| Real-time | Socket.IO | 4.8.1 |
| Styling | Tailwind CSS | 4.1.4 |
| Backend | Express | 5.1.0 |
| Database | MongoDB | 8.16.4 |
| Auth | JWT | 9.0.2 |

---

## 📡 Key API Endpoints

```
Auth & Users:
POST   /api/farmers/login        # Farmer login
POST   /api/users/login          # Admin login

Claims:
GET    /api/claims               # Get claims
POST   /api/claims               # Submit claim
PATCH  /api/claims/:id           # Update claim

Farmers:
GET    /api/farmers              # Get all farmers
POST   /api/farmers              # Register farmer

Assistance:
GET    /api/assistance           # Get programs
POST   /api/assistance/apply     # Apply

Insurance:
GET    /api/crop-insurance       # Get policies
POST   /api/crop-insurance       # Create policy

Prices:
GET    /api/crop-prices          # Get prices

Blockchain:
GET    /api/blockchain-claims    # Get logs

Health:
GET    /api/health               # Check server
```

---

## 🔐 Environment Variables

### Backend (Set in Render Dashboard):
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=abc123
FRONTEND_URL=https://agri-chain-frontend.onrender.com
FABRIC_SERVICE_URL=https://api.kapalongagrichain.site
```

### Frontend (Build-time):
```env
VITE_API_URL=https://agri-chain.onrender.com
VITE_SOCKET_URL=https://agri-chain.onrender.com
VITE_APP_NAME=AGRI-CHAIN
VITE_APP_VERSION=1.0.0
```

---

## 🚀 Deployment Commands

### Deploy to Render (Automatic):
```bash
git add .
git commit -m "Your changes"
git push origin main
# Render auto-deploys in 3-6 minutes
```

### Local Development:
```bash
# Backend
cd backend
npm install
npm run dev  # runs on port 5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev  # runs on port 5173
```

### Testing:
```bash
# Test API connectivity
node test-api.js

# Test CORS
node test-backend-cors.js

# Test blockchain
node test-blockchain-integration.js
```

---

## 🔍 Quick Health Checks

```bash
# Backend health
curl https://agri-chain.onrender.com/api/health

# CORS test
curl https://agri-chain.onrender.com/api/cors-test

# Get farmers (test data retrieval)
curl https://agri-chain.onrender.com/api/farmers
```

---

## 🎯 Project Structure

```
AGRI-CHAIN/
├── frontend/              # React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/        # Main pages
│   │   ├── store/        # Zustand stores
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Utilities
│   │   ├── api.jsx       # API layer
│   │   └── App.jsx       # Root component
│   └── dist/             # Built files
│
├── backend/              # Express API
│   ├── controller/       # Route handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, errors
│   ├── config/          # DB config
│   └── server.js        # Entry point
│
└── agri-chain-connector/ # Blockchain
    ├── fabricClient.js   # Fabric SDK
    └── server.js        # Blockchain API
```

---

## 🔄 Common Workflows

### Add New Feature:
1. Code locally in feature branch
2. Test locally (localhost)
3. Commit and push to GitHub
4. Render auto-deploys
5. Test on production URLs
6. Monitor logs in Render dashboard

### Fix Bug:
1. Check Render logs for errors
2. Reproduce locally
3. Fix code
4. Test locally
5. Deploy via Git push
6. Verify fix in production

### Update Dependencies:
```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix

# Test locally, then deploy
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Frontend can't reach backend | Check CORS, verify URLs |
| Backend not responding | Check Render logs, verify MongoDB |
| Socket.IO not connecting | Check WebSocket support, verify URL |
| Cold start (slow first load) | Wait 30s, or upgrade to paid plan |
| Database errors | Check MongoDB Atlas, verify connection |
| Build failures | Check Render logs, verify dependencies |

---

## 📊 Database Collections

```javascript
farmers              // User profiles
claims               // Insurance claims
assistances          // Aid programs
assistanceapplications // Applications
cropinsurances       // Insurance policies
cropprices           // Market prices
users                // Admin accounts
```

---

## 🔐 Security Features

✅ JWT authentication  
✅ Password hashing (bcryptjs)  
✅ CORS protection  
✅ HTTPS/WSS encryption  
✅ MongoDB authentication  
✅ Input validation  
✅ Error handling  
✅ Security headers  

---

## 📈 Monitoring

### Render Dashboard:
- Logs: Real-time server logs
- Metrics: CPU, memory, bandwidth
- Deploys: Build history
- Settings: Env vars, domains

### MongoDB Atlas:
- Cluster monitoring
- Query performance
- Storage usage
- Connection stats

---

## 🎯 Performance Tips

1. **Lazy Load**: Already implemented ✅
2. **Code Split**: Already implemented ✅
3. **Image Optimization**: Use base64 with limits ✅
4. **Caching**: React Query + Service Worker ✅
5. **Database Indexing**: Already configured ✅

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| CODE_SCAN_SUMMARY.md | This scan summary |
| SYSTEM_ARCHITECTURE_ANALYSIS.md | Deep dive |
| RENDER_DEPLOYMENT_GUIDE.md | Deployment |
| SYSTEM_FLOW_DIAGRAM.md | Visual flows |
| README.md | General overview |

---

## 🆘 Getting Help

1. **Check Documentation**: Read the MD files
2. **Check Logs**: Render dashboard → Logs tab
3. **Test Endpoints**: Use curl or Postman
4. **MongoDB Atlas**: Check cluster status
5. **Render Status**: https://status.render.com

---

## ✅ System Status

| Component | Status |
|-----------|--------|
| Frontend | 🟢 Live |
| Backend | 🟢 Live |
| Database | 🟢 Connected |
| Blockchain | 🟢 Connected |
| Real-time | 🟢 Working |

---

## 🎓 Key Features

**For Farmers:**
- Register & manage profile
- Submit insurance claims
- Apply for assistance programs
- Track claim status
- View crop prices
- Real-time notifications

**For Admins:**
- Review & process claims
- Manage farmers
- Manage assistance programs
- View analytics
- Blockchain logs
- Generate reports

---

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **GitHub Repo**: Your repository
- **React Docs**: https://react.dev
- **Express Docs**: https://expressjs.com
- **Socket.IO Docs**: https://socket.io

---

## 📞 Quick Commands

```bash
# View backend logs (with Render CLI)
render logs -s agri-chain-backend

# Rebuild manually
git commit --allow-empty -m "Rebuild"
git push

# Local dev
npm run dev  # in backend or frontend folder

# Test connectivity
curl https://agri-chain.onrender.com/api/health
```

---

## 🎉 Your System is Live!

✅ **Production Ready**  
✅ **Fully Deployed on Render**  
✅ **Documentation Complete**  
✅ **Monitoring Active**

**Need more details?** Check the comprehensive documentation files created:
- `SYSTEM_ARCHITECTURE_ANALYSIS.md`
- `RENDER_DEPLOYMENT_GUIDE.md`
- `SYSTEM_FLOW_DIAGRAM.md`

---

**Last Updated**: October 29, 2025  
**Status**: ✅ Operational  
**Version**: 1.0.0

