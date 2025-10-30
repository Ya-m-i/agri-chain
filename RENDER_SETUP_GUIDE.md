# Complete Render Setup Guide for AGRI-CHAIN

## Overview
This guide covers deploying both frontend and backend to Render.

---

## Part 1: Backend Setup (Already Done ✅)

Your backend should already be running at: `https://agri-chain.onrender.com`

### Verify Backend
```bash
curl https://agri-chain.onrender.com/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "AGRI-CHAIN API is running"
}
```

---

## Part 2: Frontend Setup for Render

### Step 1: Install Dependencies Locally

```bash
cd frontend
npm install
```

This will install the new `serve` package we added.

### Step 2: Test Build Locally

```bash
npm run build
```

Expected output:
```
✓ built in [time]
dist/index.html                [size]
dist/assets/[name]-[hash].js   [size]
```

### Step 3: Test Serve Locally

```bash
# Set PORT environment variable
$env:PORT=3000  # PowerShell
npm start
```

Visit: http://localhost:3000 (should show your app)

---

## Part 3: Configure Frontend in Render Dashboard

### A. Create New Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `Ya-m-i/agri-chain`
4. Click "Connect"

### B. Service Configuration

```
Name: agri-chain-frontend
Region: Singapore (or closest to you)
Branch: main
Root Directory: frontend

Runtime: Node

Build Command:
npm install && npm run build

Start Command:
npm start

Environment Variables: (Add these below)
```

### C. Environment Variables

Click "Add Environment Variable" for each:

```
NODE_ENV = production
VITE_API_URL = https://agri-chain.onrender.com
VITE_SOCKET_URL = https://agri-chain.onrender.com
VITE_APP_NAME = AGRI-CHAIN
VITE_APP_VERSION = 1.0.0
```

**CRITICAL:** Variables MUST have `VITE_` prefix!

### D. Auto-Deploy Settings

✅ Enable "Auto-Deploy" (deploys on every push to main)

### E. Instance Type

- Free tier is sufficient for testing
- Upgrade to paid if needed later

### F. Create Web Service

Click "Create Web Service" and wait for initial deploy (~5-10 minutes)

---

## Part 4: Update Backend CORS

Once frontend is deployed, update backend CORS to allow your frontend URL.

### Get Your Frontend URL

After deployment completes, Render gives you a URL like:
```
https://agri-chain-frontend.onrender.com
```

### Update Backend CORS

In `backend/server.js`, the CORS is already configured to allow Render URLs.
Verify these lines exist:

```javascript
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://ya-m-i.github.io',
      'https://ya-m-i.github.io/agri-chain',
      process.env.FRONTEND_URL,
      'https://agri-chain.onrender.com',
      'https://agri-chain-frontend.onrender.com'  // ← Your frontend URL
    ].filter(Boolean)
```

If your URL is different, add it to the array.

### Update Backend Environment Variable

In Render Dashboard → Backend Service → Environment:

```
FRONTEND_URL = https://agri-chain-frontend.onrender.com
```

(Use your actual frontend URL)

---

## Part 5: Test Deployment

### 1. Check Frontend Loads

Visit: `https://[your-frontend-url].onrender.com`

Expected: See login page

### 2. Check Browser Console

Open DevTools → Console

Expected:
```
App component mounting...
Environment variables: {
  API_URL: "https://agri-chain.onrender.com",
  SOCKET_URL: "https://agri-chain.onrender.com",
  ...
}
```

### 3. Test Admin Login

```
Username: admin
Password: admin123
```

Expected: Redirect to admin dashboard

### 4. Test Farmer Login

Use valid farmer credentials from your database.

Expected: 
- ✅ Redirect to farmer dashboard
- ✅ Dashboard renders completely
- ✅ No blank page
- ✅ No console errors

### 5. Check API Connectivity

In DevTools → Network tab:
- Look for API calls to `https://agri-chain.onrender.com/api/...`
- All should return 200 OK
- Check response data

### 6. Check Socket.IO

Console should show:
```
Socket.IO connected successfully, ID: [socket-id]
```

---

## Part 6: Troubleshooting

### Issue: Blank page on farmer side

**Debug steps:**

1. **Check if build included latest code:**
   ```bash
   # Check last commit in GitHub
   git log --oneline -1
   
   # Check if Render deployed that commit
   # (View in Render Dashboard → Deployment logs)
   ```

2. **Check environment variables in browser:**
   ```javascript
   // In browser console:
   console.log(import.meta.env.VITE_API_URL)
   ```
   
   Should output: `https://agri-chain.onrender.com`
   
   If `undefined`, environment variables weren't loaded.

3. **Check for JavaScript errors:**
   ```
   Open DevTools → Console
   Look for red error messages
   With sourcemap enabled, you'll see actual file names
   ```

4. **Check network errors:**
   ```
   Open DevTools → Network tab
   Filter: XHR/Fetch
   Look for failed requests (red)
   Check response errors
   ```

### Issue: Build fails on Render

**Solutions:**

1. **Check build logs in Render:**
   - Click your service → "Logs" tab
   - Look for npm errors
   - Common: Node version mismatch

2. **Specify Node version:**
   Add to `frontend/package.json`:
   ```json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

3. **Clear build cache:**
   - Render Dashboard → Your Service
   - Settings → "Clear build cache"
   - Manually redeploy

### Issue: Environment variables not working

**Solutions:**

1. **Check variable names:**
   ```
   ✅ VITE_API_URL
   ❌ API_URL (won't work)
   ```

2. **Restart service after adding variables:**
   - Render Dashboard → Your Service
   - "Manual Deploy" → "Clear build cache & deploy"

3. **Check if variables are in .env.production:**
   ```bash
   cd frontend
   type .env.production
   ```

### Issue: CORS errors

**Solutions:**

1. **Check backend allows frontend URL:**
   ```javascript
   // In backend/server.js
   const allowedOrigins = [
     'https://your-frontend.onrender.com' // ← Add this
   ]
   ```

2. **Update backend FRONTEND_URL:**
   ```
   Render Dashboard → Backend Service → Environment
   FRONTEND_URL = https://your-frontend.onrender.com
   ```

3. **Redeploy backend** after CORS changes

### Issue: App works locally but not on Render

**Common causes:**

1. **Environment variables missing on Render**
   - Check all VITE_ variables are set

2. **Build command incorrect**
   - Should be: `npm install && npm run build`

3. **Start command incorrect**
   - Should be: `npm start` (which runs `serve -s dist -l $PORT`)

4. **PORT variable not used**
   - `serve` needs `-l $PORT` to bind to Render's port

---

## Part 7: Maintenance

### Deploying Updates

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: Your changes"
   git push origin main
   ```

2. **Auto-deploy triggers:**
   - Render detects push to main
   - Automatically builds and deploys
   - Wait ~3-5 minutes

3. **Monitor deployment:**
   - Render Dashboard → Your Service
   - Watch "Logs" tab
   - Wait for "Live" status

### Manual Redeploy

If auto-deploy fails:

1. Render Dashboard → Your Service
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"
4. Wait for completion

### Rollback

If deployment breaks:

1. **Find last working commit:**
   ```bash
   git log --oneline
   ```

2. **Revert:**
   ```bash
   git revert [commit-hash]
   git push origin main
   ```

3. **Or force rollback:**
   - Render Dashboard → Deployments tab
   - Find working deployment
   - Click "..." → "Redeploy"

---

## Part 8: Performance Optimization

### Enable Brotli Compression

Render automatically serves compressed files if available.

### Enable HTTP/2

Render enables HTTP/2 by default (no config needed).

### Custom Domain (Optional)

1. Render Dashboard → Your Service
2. Settings → Custom Domains
3. Add your domain
4. Follow DNS instructions

---

## Summary Checklist

### Frontend Setup:
- [ ] Installed `serve` package
- [ ] Added `start` script to package.json
- [ ] Fixed vite.config.js (sourcemap, no duplicate options)
- [ ] Set `base: '/'` in vite.config.js
- [ ] Created Render web service
- [ ] Set environment variables (VITE_ prefix)
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`

### Backend Setup:
- [ ] Backend running on Render
- [ ] CORS allows frontend URL
- [ ] Environment variables set
- [ ] MongoDB connection working

### Testing:
- [ ] Frontend URL loads
- [ ] Admin login works
- [ ] Farmer login works
- [ ] Farmer dashboard NOT blank
- [ ] API calls successful
- [ ] Socket.IO connects
- [ ] No console errors

---

## Next Steps After Setup

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "feat: Configure for Render deployment"
   git push origin main
   ```

2. **Wait for Render to deploy** (~3-5 minutes)

3. **Test thoroughly:**
   - Admin functions
   - Farmer functions
   - All features work

4. **Monitor for errors:**
   - Check Render logs
   - Check browser console
   - Test on different devices

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Vite Docs:** https://vitejs.dev
- **React Docs:** https://react.dev

## Your URLs

After setup, you'll have:

- **Frontend:** `https://[your-service-name].onrender.com`
- **Backend:** `https://agri-chain.onrender.com`
- **Database:** MongoDB Atlas (external)
- **Blockchain:** `https://api.kapalongagrichain.site`

