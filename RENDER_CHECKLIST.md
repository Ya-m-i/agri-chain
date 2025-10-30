# Render Configuration Checklist

## Your Services
- **Backend:** `agri-chain` (https://agri-chain.onrender.com)
- **Frontend:** `agri-chain-frontend` (https://agri-chain-frontend.onrender.com)

---

## 🔍 Frontend Service Settings to Verify

### 1. Go to Render Dashboard
https://dashboard.render.com → Select `agri-chain-frontend`

### 2. Check General Settings

```
✅ Name: agri-chain-frontend
✅ Region: [Your region]
✅ Branch: main
✅ Root Directory: frontend
✅ Runtime: Node
```

### 3. Check Build & Deploy Settings

Click "Settings" tab:

```
Build Command:
npm install && npm run build

Start Command:
npm start
```

**IMPORTANT:** The start command MUST be `npm start` (not `npx serve...`)

### 4. Check Environment Variables

Click "Environment" tab. You should have:

```
NODE_ENV = production
VITE_API_URL = https://agri-chain.onrender.com
VITE_SOCKET_URL = https://agri-chain.onrender.com
VITE_APP_NAME = AGRI-CHAIN
VITE_APP_VERSION = 1.0.0
```

**CRITICAL:** Variables MUST have `VITE_` prefix!

### 5. Check Auto-Deploy

```
✅ Auto-Deploy: ON (deploys on push to main)
```

---

## 🔍 Backend Service Settings to Verify

### Go to Backend Service
https://dashboard.render.com → Select `agri-chain`

### Check Environment Variables

Should include:

```
NODE_ENV = production
MONGO_URI = [your MongoDB connection string]
JWT_SECRET = [your secret]
FRONTEND_URL = https://agri-chain-frontend.onrender.com
FABRIC_SERVICE_URL = https://api.kapalongagrichain.site
```

**IMPORTANT:** `FRONTEND_URL` should point to your frontend service!

---

## 🚀 Deployment Steps

### Step 1: Install Serve Package Locally

```bash
cd frontend
npm install
```

This installs the `serve` package we added.

### Step 2: Commit All Changes

```bash
# From root directory
git add .
git commit -m "feat: Configure frontend for Render with serve package

- Add serve package for static file serving
- Update vite config with sourcemaps
- Add start script for Render deployment
- Fix duplicate rollupOptions"

git push origin main
```

### Step 3: Watch Render Deploy

1. Go to Render Dashboard → `agri-chain-frontend`
2. Click "Logs" tab
3. Watch the deployment process
4. Look for these stages:
   ```
   ==> Downloading cache...
   ==> Installing dependencies...
   ==> npm install && npm run build
   ==> Building...
   ==> Build successful!
   ==> Starting server...
   ==> npm start
   ==> Your service is live 🎉
   ```

### Step 4: Check for Errors

**If build fails, look for:**
- `npm ERR!` - dependency issues
- `Module not found` - missing packages
- `Build failed` - vite config issues

**If start fails, look for:**
- `serve: command not found` - serve not installed
- `PORT is not defined` - Render environment issue
- `Cannot find module` - build output missing

---

## 🧪 Testing After Deployment

### 1. Visit Frontend URL
```
https://agri-chain-frontend.onrender.com
```

Expected: See login page

### 2. Open Browser Console
Press F12 → Console tab

Expected logs:
```javascript
App component mounting...
Environment variables: {
  API_URL: "https://agri-chain.onrender.com",
  SOCKET_URL: "https://agri-chain.onrender.com",
  ...
}
```

### 3. Test Environment Variables

In browser console, run:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL)
console.log('Socket URL:', import.meta.env.VITE_SOCKET_URL)
```

Expected output:
```
API URL: https://agri-chain.onrender.com
Socket URL: https://agri-chain.onrender.com
```

**If `undefined`:** Environment variables not loaded properly in Render!

### 4. Test Admin Login
```
Username: admin
Password: admin123
```

Expected: Redirects to admin dashboard

### 5. Test Farmer Login

Use valid farmer credentials.

Expected:
- ✅ Redirects to farmer dashboard
- ✅ Dashboard fully renders
- ✅ No blank page
- ✅ No infinite loops
- ✅ Refresh button visible in notifications

### 6. Check Network Tab

DevTools → Network tab:
- API calls should go to `agri-chain.onrender.com`
- All requests should return 200 OK
- No CORS errors

### 7. Check Socket Connection

Console should show:
```
Socket.IO connected successfully, ID: [socket-id]
SocketManager: Connected and joined room: farmer-[id]
```

---

## ❌ Troubleshooting

### Issue: Environment variables are undefined

**Fix in Render Dashboard:**

1. Go to `agri-chain-frontend` → Environment
2. Verify all variables have `VITE_` prefix
3. After adding/changing variables, click "Manual Deploy"
4. Select "Clear build cache & deploy"

### Issue: Build succeeds but app doesn't start

**Check Render Logs for:**
```
serve: command not found
```

**Fix:** The `serve` package wasn't installed. 

1. Make sure `package.json` has `"serve": "^14.2.4"` in devDependencies
2. Commit and push changes
3. Redeploy

### Issue: Farmer dashboard still blank

**Debug Steps:**

1. **Check browser console** for the actual error (not minified)
2. **Check Network tab** for failed API calls
3. **Verify environment variables** are loaded in browser
4. **Check if latest code was deployed:**
   ```
   Render Dashboard → Deployments tab
   Check commit hash matches your latest commit
   ```

### Issue: CORS errors

**Fix in Backend:**

1. Go to Render Dashboard → `agri-chain` service
2. Environment → Add/Update:
   ```
   FRONTEND_URL=https://agri-chain-frontend.onrender.com
   ```
3. Verify `backend/server.js` includes:
   ```javascript
   'https://agri-chain-frontend.onrender.com'
   ```
   in allowedOrigins array

4. Redeploy backend

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Frontend URL loads login page
- [ ] Environment variables appear in console
- [ ] Admin login works
- [ ] Farmer login works
- [ ] Farmer dashboard renders (NOT blank)
- [ ] No infinite notification loops
- [ ] Refresh button visible in notifications
- [ ] API calls successful (Network tab)
- [ ] Socket.IO connects (Console shows "connected")
- [ ] No CORS errors
- [ ] No console errors

---

## 🎯 Quick Commands

### Force Redeploy Frontend
```
Render Dashboard → agri-chain-frontend
→ Manual Deploy → Clear build cache & deploy
```

### View Live Logs
```
Render Dashboard → agri-chain-frontend → Logs
(Keep this open while testing)
```

### Rollback if Needed
```
Render Dashboard → agri-chain-frontend → Deployments
→ Find last working deployment → Redeploy
```

---

## 📞 If Still Having Issues

1. **Share Render build logs** - Copy from Logs tab
2. **Share browser console errors** - Copy full error messages
3. **Share Network tab errors** - Screenshot failed requests
4. **Verify commit deployed** - Check commit hash in Render matches GitHub

---

## Summary

You already have both services. Just need to:

1. ✅ Install `serve` package locally (`npm install`)
2. ✅ Commit all changes (vite.config.js, package.json)
3. ✅ Push to GitHub (`git push origin main`)
4. ✅ Render auto-deploys in ~3-5 minutes
5. ✅ Verify environment variables in Render dashboard
6. ✅ Test the deployed app

The main fixes ensure:
- Better error visibility (sourcemaps)
- Proper static file serving (serve package)
- Correct start command (`npm start`)
- Environment variables loaded properly

