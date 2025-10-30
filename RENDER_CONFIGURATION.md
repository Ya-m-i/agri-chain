# Render Deployment Configuration

## Current Setup
- **Backend:** Hosted on Render
- **Frontend:** Hosted on Render (not GitHub Pages)
- **Database:** MongoDB Atlas

## Frontend Render Configuration

### Service Settings (Dashboard)

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Create New Web Service** (if not already created)
   - Connect your GitHub repository
   - Select the `AGRI-CHAIN` repository

### Build & Deploy Settings

```
Name: agri-chain-frontend
Region: [Your preferred region]
Branch: main
Root Directory: frontend

Build Command:
npm install && npm run build

Start Command:
npx serve -s dist -l $PORT

Environment:
Node

Instance Type: Free (or your preferred tier)
```

### Environment Variables

Add these in Render Dashboard → Your Service → Environment:

```
NODE_ENV=production
VITE_API_URL=https://agri-chain.onrender.com
VITE_SOCKET_URL=https://agri-chain.onrender.com
VITE_APP_NAME=AGRI-CHAIN
VITE_APP_VERSION=1.0.0
```

**IMPORTANT:** Vite environment variables must be prefixed with `VITE_`

## Backend Render Configuration

### Service Settings

```
Name: agri-chain-backend
Region: [Same as frontend]
Branch: main
Root Directory: backend

Build Command:
npm install

Start Command:
node server.js

Environment:
Node

Instance Type: Free (or your preferred tier)
```

### Environment Variables

```
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-frontend-url.onrender.com
FABRIC_SERVICE_URL=https://api.kapalongagrichain.site
```

## Package.json for Frontend (Render)

Your frontend needs a way to serve the built files. Install `serve`:

```bash
cd frontend
npm install --save-dev serve
```

Update `frontend/package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build --mode production",
    "preview": "vite preview",
    "start": "serve -s dist -l $PORT"
  }
}
```

## Vite Config for Render

Your `vite.config.js` should have `base: '/'` (which is correct):

```javascript
export default defineConfig({
  base: '/', // ✅ Correct for Render
  // ... rest of config
})
```

## Troubleshooting Blank Page on Farmer Side

### Issue: Frontend loads but farmer dashboard is blank

**Possible causes:**

1. **Environment variables not loaded:**
   ```
   Check: VITE_API_URL is set in Render dashboard
   Check: It's VITE_API_URL not just API_URL
   ```

2. **Build not including updated code:**
   ```
   Solution: Trigger manual redeploy in Render
   Solution: Clear build cache in Render settings
   ```

3. **Sourcemaps disabled:**
   ```
   Solution: Set sourcemap: true in vite.config.js (already done)
   ```

4. **React error still occurring:**
   ```
   Check browser console for unminified errors
   Look for network errors in DevTools
   ```

### Debug Steps

1. **Check if frontend is deployed:**
   ```
   Visit: https://your-frontend.onrender.com
   Should see: Login page
   ```

2. **Check API connectivity:**
   ```
   Open DevTools → Network tab
   Login as farmer
   Check: API calls to https://agri-chain.onrender.com/api/...
   ```

3. **Check console errors:**
   ```
   Open DevTools → Console tab
   Look for: Actual error messages (not minified)
   With sourcemap enabled, you should see real file names
   ```

4. **Check environment variables in browser:**
   ```javascript
   // In browser console:
   console.log('API URL:', import.meta.env.VITE_API_URL)
   console.log('Socket URL:', import.meta.env.VITE_SOCKET_URL)
   ```

## Manual Deployment Steps

If automatic deployment isn't working:

### Option 1: Trigger Render Redeploy

1. Go to Render Dashboard
2. Select your frontend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for build to complete

### Option 2: Clear Cache & Redeploy

1. Go to Render Dashboard
2. Select your frontend service  
3. Go to "Settings"
4. Click "Clear build cache"
5. Click "Manual Deploy"

### Option 3: Rebuild Locally & Deploy

```bash
cd frontend
npm run build
git add dist/
git commit -m "feat: Update build with fixes"
git push origin main
```

## Common Issues

### Issue: "Cannot read properties of undefined"

**Solution:**
- Already fixed with `enabled` guards in hooks
- Ensure latest code is deployed
- Check if Render pulled latest commit

### Issue: Environment variables not working

**Solution:**
```bash
# In Render dashboard, variables must have VITE_ prefix
VITE_API_URL=https://agri-chain.onrender.com
VITE_SOCKET_URL=https://agri-chain.onrender.com

# NOT:
API_URL=https://agri-chain.onrender.com  # ❌ Won't work
```

### Issue: Build succeeds but app doesn't work

**Solution:**
1. Check "Start Command" is correct: `npx serve -s dist -l $PORT`
2. Check dist/ folder was created during build
3. Check Render logs for runtime errors

## Verification Checklist

After deployment:

- [ ] Frontend URL loads login page
- [ ] Admin login works
- [ ] Farmer login works
- [ ] Farmer dashboard renders (not blank)
- [ ] No console errors
- [ ] API calls reach backend
- [ ] Socket.IO connects
- [ ] Notifications work
- [ ] Refresh button appears

## Getting Frontend URL

Your frontend should be accessible at:
```
https://[your-service-name].onrender.com
```

Update backend CORS to allow this URL in `backend/server.js`.

## Next Steps

1. **Add serve package:**
   ```bash
   cd frontend
   npm install --save-dev serve
   ```

2. **Commit changes:**
   ```bash
   git add .
   git commit -m "fix: Add serve package for Render deployment"
   git push origin main
   ```

3. **Configure in Render Dashboard:**
   - Set environment variables
   - Set build/start commands
   - Trigger manual deploy

4. **Test:**
   - Visit frontend URL
   - Login as farmer
   - Check dashboard loads
   - Check browser console

